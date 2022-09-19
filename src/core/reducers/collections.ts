import { escapeRegExp, get } from 'lodash';
import { Collection } from '..';
import { getIn } from '../../lib/util/objectUtil';
import { stringTemplate } from '../../lib/widgets';
import type { ConfigAction } from '../actions/config';
import { CONFIG_SUCCESS } from '../actions/config';
import type { Backend } from '../backend';
import { FILES, FOLDER } from '../constants/collectionTypes';
import { COMMIT_AUTHOR, COMMIT_DATE } from '../constants/commitProps';
import { IDENTIFIER_FIELDS, INFERABLE_FIELDS, SORTABLE_FIELDS } from '../constants/fieldInference';
import { formatExtensions } from '../formats/formats';
import consoleError from '../lib/consoleError';
import { summaryFormatter } from '../lib/formatters';
import type {
  CmsConfig,
  CollectionFiles,
  Collections,
  Entry,
  EntryField,
  EntryFields,
  ViewFilter,
  ViewGroup,
} from '../types/redux';
import { selectMediaFolder } from './entries';

const { keyToPathArray } = stringTemplate;

const defaultState: Collections = {};

function collections(state = defaultState, action: ConfigAction) {
  switch (action.type) {
    case CONFIG_SUCCESS: {
      const collections = action.payload.collections;
      let newState: Collections = {};
      collections.forEach(collection => {
        newState[collection.name] = collection;
      });
      return newState;
    }
    default:
      return state;
  }
}

const selectors = {
  [FOLDER]: {
    entryExtension(collection: Collection) {
      return (
        collection.extension || get(formatExtensions, collection.format || 'frontmatter')
      ).replace(/^\./, '');
    },
    fields(collection: Collection) {
      return collection.fields;
    },
    entryPath(collection: Collection, slug: string) {
      const folder = (collection.folder as string).replace(/\/$/, '');
      return `${folder}/${slug}.${this.entryExtension(collection)}`;
    },
    entrySlug(collection: Collection, path: string) {
      const folder = (collection.folder as string).replace(/\/$/, '');
      const slug = path
        .split(folder + '/')
        .pop()
        ?.replace(new RegExp(`\\.${escapeRegExp(this.entryExtension(collection))}$`), '');

      return slug;
    },
    allowNewEntries(collection: Collection) {
      return collection.create;
    },
    allowDeletion(collection: Collection) {
      return collection.delete ?? true;
    },
    templateName(collection: Collection) {
      return collection.name;
    },
  },
  [FILES]: {
    fileForEntry(collection: Collection, slug: string) {
      const files = collection.files;
      return files && files.filter(f => f?.name === slug)[0];
    },
    fields(collection: Collection, slug: string) {
      const file = this.fileForEntry(collection, slug);
      return file && file.fields;
    },
    entryPath(collection: Collection, slug: string) {
      const file = this.fileForEntry(collection, slug);
      return file && file.file;
    },
    entrySlug(collection: Collection, path: string) {
      const file = (collection.files as CollectionFiles).filter(f => f?.file === path)[0];
      return file && file.name;
    },
    entryLabel(collection: Collection, slug: string) {
      const file = this.fileForEntry(collection, slug);
      return file && file.label;
    },
    allowNewEntries() {
      return false;
    },
    allowDeletion(collection: Collection) {
      return collection.delete ?? false;
    },
    templateName(_collection: Collection, slug: string) {
      return slug;
    },
  },
};

function getFieldsWithMediaFolders(fields: EntryField[]) {
  const fieldsWithMediaFolders = fields.reduce((acc, f) => {
    if (f.media_folder) {
      acc = [...acc, f];
    }

    if (f.fields) {
      acc = [...acc, ...getFieldsWithMediaFolders(f.fields)];
    } else if (f.field) {
      acc = [...acc, ...getFieldsWithMediaFolders([f.field])];
    } else if (f.types) {
      acc = [...acc, ...getFieldsWithMediaFolders(f.types)];
    }

    return acc;
  }, [] as EntryField[]);

  return fieldsWithMediaFolders;
}

export function getFileFromSlug(collection: Collection, slug: string) {
  return collection.files?.find(f => f.name === slug);
}

export function selectFieldsWithMediaFolders(collection: Collection, slug: string) {
  if (collection.folder) {
    const fields = collection.fields ?? [];
    return getFieldsWithMediaFolders(fields as unknown as EntryFields);
  } else if (collection.files) {
    const fields = getFileFromSlug(collection, slug)?.fields ?? [];
    return getFieldsWithMediaFolders(fields as unknown as EntryFields);
  }

  return [];
}

export function selectMediaFolders(config: CmsConfig, collection: Collection, entry: Entry) {
  const fields = selectFieldsWithMediaFolders(collection, entry.slug);
  const folders = fields.map(f => selectMediaFolder(config, collection, entry, f));
  if (collection.files) {
    const file = getFileFromSlug(collection, entry.slug);
    if (file) {
      folders.unshift(selectMediaFolder(config, collection, entry, undefined));
    }
  }
  if (collection.media_folder) {
    // stop evaluating media folders at collection level
    const newCollection = { ...collection };
    delete newCollection.files;
    collection = newCollection;
    folders.unshift(selectMediaFolder(config, collection, entry, undefined));
  }

  return new Set(folders);
}

export function selectFields(collection: Collection, slug: string) {
  return selectors[collection.type].fields(collection, slug);
}

export function selectFolderEntryExtension(collection: Collection) {
  return selectors[FOLDER].entryExtension(collection);
}

export function selectFileEntryLabel(collection: Collection, slug: string) {
  return selectors[FILES].entryLabel(collection, slug);
}

export function selectEntryPath(collection: Collection, slug: string) {
  return selectors[collection.type].entryPath(collection, slug);
}

export function selectEntrySlug(collection: Collection, path: string) {
  return selectors[collection.type].entrySlug(collection, path);
}

export function selectAllowNewEntries(collection: Collection) {
  return selectors[collection.type].allowNewEntries(collection);
}

export function selectAllowDeletion(collection: Collection) {
  return selectors[collection.type].allowDeletion(collection);
}

export function selectTemplateName(collection: Collection, slug: string) {
  return selectors[collection.type].templateName(collection, slug);
}

export function getFieldsNames(fields: EntryField[], prefix = '') {
  let names = fields.map(f => `${prefix}${f.name}`);

  fields.forEach((f, index) => {
    if (f.fields) {
      const fields = f.fields;
      names = [...names, ...getFieldsNames(fields, `${names[index]}.`)];
    } else if (f.field) {
      const field = f.field;
      names = [...names, ...getFieldsNames([field], `${names[index]}.`)];
    } else if (f.types) {
      const types = f.types;
      names = [...names, ...getFieldsNames(types, `${names[index]}.`)];
    }
  });

  return names;
}

export function selectField(collection: Collection, key: string) {
  const array = keyToPathArray(key);
  let name: string | undefined;
  let field: EntryField | undefined;
  let fields = (collection.fields ?? []) as EntryFields;
  while ((name = array.shift()) && fields) {
    field = fields.find(f => f.name === name) as EntryField;
    if (field?.fields) {
      fields = field?.fields;
    } else if (field?.field) {
      fields = [field?.field];
    } else if (field?.types) {
      fields = field?.types;
    }
  }

  return field;
}

export function traverseFields(
  fields: EntryField[],
  updater: (field: EntryField) => EntryField,
  done = () => false,
) {
  if (done()) {
    return fields;
  }

  return fields.map((f: EntryField): EntryField => {
    const field = updater(f as EntryField);
    if (done()) {
      return field;
    } else if (field.fields) {
      return {
        ...field,
        fields: traverseFields(field.fields!, updater, done),
      };
    } else if (field.field) {
      return {
        ...field,
        field: traverseFields([field.field!], updater, done)[0],
      };
    } else if (field.types) {
      return {
        ...field,
        types: traverseFields(field.types!, updater, done),
      };
    } else {
      return field;
    }
  });
}

export function updateFieldByKey(
  collection: Collection,
  key: string,
  updater: (field: EntryField) => EntryField,
) {
  const selected = selectField(collection, key);
  if (!selected) {
    return collection;
  }

  let updated = false;

  function updateAndBreak(f: EntryField) {
    const field = f as EntryField;
    if (field === selected) {
      updated = true;
      return updater(field);
    } else {
      return field;
    }
  }

  const newCollection = {
    ...collection,
    fields: traverseFields(
      (collection.fields ?? []) as EntryField[],
      updateAndBreak,
      () => updated,
    ),
  };

  return newCollection;
}

export function selectIdentifier(collection: Collection) {
  const identifier = collection.identifier_field;
  const identifierFields = identifier ? [identifier, ...IDENTIFIER_FIELDS] : [...IDENTIFIER_FIELDS];
  const fieldNames = getFieldsNames((collection.fields ?? []) as EntryField[]);
  return identifierFields.find(id =>
    fieldNames.find(name => name.toLowerCase().trim() === id.toLowerCase().trim()),
  ) ?? '';
}

export function selectInferedField(collection: Collection, fieldName: string) {
  if (fieldName === 'title' && collection.identifier_field) {
    return selectIdentifier(collection);
  }
  const inferableField = (
    INFERABLE_FIELDS as Record<
      string,
      {
        type: string;
        synonyms: string[];
        secondaryTypes: string[];
        fallbackToFirstField: boolean;
        showError: boolean;
      }
    >
  )[fieldName];
  const fields = collection.fields;
  let field;

  // If collection has no fields or fieldName is not defined within inferables list, return null
  if (!fields || !inferableField) return null;
  // Try to return a field of the specified type with one of the synonyms
  const mainTypeFields = fields
    .filter(f => (f.widget ?? 'string') === inferableField.type)
    .map(f => f?.name);
  field = mainTypeFields.filter(f => inferableField.synonyms.indexOf(f as string) !== -1);

  if (field && field.length > 0) {
    return field[0];
  }

  // Try to return a field for each of the specified secondary types
  const secondaryTypeFields = fields
    .filter(f => inferableField.secondaryTypes.indexOf(f.widget ?? 'string') !== -1)
    .map(f => f?.name);
  field = secondaryTypeFields.filter(f => inferableField.synonyms.indexOf(f as string) !== -1);

  if (field && field.length > 0) {
    return field[0];
  }

  // Try to return the first field of the specified type
  if (inferableField.fallbackToFirstField && mainTypeFields.length > 0) {
    return mainTypeFields[0];
  }

  // Coundn't infer the field. Show error and return null.
  if (inferableField.showError) {
    consoleError(
      `The Field ${fieldName} is missing for the collection “${collection.name}”`,
      `Netlify CMS tries to infer the entry ${fieldName} automatically, but one couldn't be found for entries of the collection “${collection.name}”. Please check your site configuration.`,
    );
  }

  return null;
}

export function selectEntryCollectionTitle(collection: Collection, entry: Entry) {
  // prefer formatted summary over everything else
  const summaryTemplate = collection.summary;
  if (summaryTemplate) return summaryFormatter(summaryTemplate, entry, collection);

  // if the collection is a file collection return the label of the entry
  if (collection.type == FILES) {
    const label = selectFileEntryLabel(collection, entry.slug);
    if (label) return label;
  }

  // try to infer a title field from the entry data
  const entryData = entry.data;
  const titleField = selectInferedField(collection, 'title');
  const result = titleField && getIn(entryData, titleField);

  // if the custom field does not yield a result, fallback to 'title'
  if (!result && titleField !== 'title') {
    return getIn(entryData, 'title');
  }

  return result;
}

export function selectDefaultSortableFields(
  collection: Collection,
  backend: Backend,
  hasIntegration: boolean,
) {
  let defaultSortable = SORTABLE_FIELDS.map((type: string) => {
    const field = selectInferedField(collection, type);
    if (backend.isGitBackend() && type === 'author' && !field && !hasIntegration) {
      // default to commit author if not author field is found
      return COMMIT_AUTHOR;
    }
    return field;
  }).filter(Boolean);

  if (backend.isGitBackend() && !hasIntegration) {
    // always have commit date by default
    defaultSortable = [COMMIT_DATE, ...defaultSortable];
  }

  return defaultSortable as string[];
}

export function selectSortableFields(collection: Collection, t: (key: string) => string) {
  const sortableFields = collection.sortable_fields;

  const fields = (sortableFields ? sortableFields : [])
    .map(key => {
      if (key === COMMIT_DATE) {
        return { key, field: { name: key, label: t('collection.defaultFields.updatedOn.label') } };
      }
      const field = selectField(collection, key);
      if (key === COMMIT_AUTHOR && !field) {
        return { key, field: { name: key, label: t('collection.defaultFields.author.label') } };
      }

      return { key, field };
    })
    .filter(item => !!item.field)
    .map(item => ({ ...item.field, key: item.key }));

  return fields;
}

export function selectSortDataPath(collection: Collection, key: string) {
  if (key === COMMIT_DATE) {
    return 'updatedOn';
  } else if (key === COMMIT_AUTHOR && !selectField(collection, key)) {
    return 'author';
  } else {
    return `data.${key}`;
  }
}

export function selectViewFilters(collection: Collection) {
  const viewFilters = collection.view_filters as ViewFilter[];
  return viewFilters;
}

export function selectViewGroups(collection: Collection) {
  const viewGroups = collection.view_groups as ViewGroup[];
  return viewGroups;
}

export function selectFieldsComments(collection: Collection, entryMap: Entry) {
  let fields: EntryField[] = [];
  if (collection.folder) {
    fields = collection.fields as EntryField[];
  } else if (collection.files) {
    const file = collection.files!.find(f => f?.name === entryMap.slug);
    if (file) {
      fields = file.fields as EntryField[];
    }
  }
  const comments: Record<string, string> = {};
  const names = getFieldsNames(fields);
  names.forEach(name => {
    const field = selectField(collection, name);
    if (field?.comment) {
      comments[name] = field.comment!;
    }
  });

  return comments;
}

export function selectHasMetaPath(collection: Collection) {
  return (
    collection.folder && collection.type === FOLDER && collection.meta && collection.meta?.path
  );
}

export default collections;
