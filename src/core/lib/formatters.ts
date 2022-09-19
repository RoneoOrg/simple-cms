import { stripIndent } from 'common-tags';
import formatISO from 'date-fns/formatISO';
import { flow, partialRight, trimEnd, trimStart } from 'lodash';
import { Collection } from '..';
import { getIn } from '../../lib/util/objectUtil';
import { stringTemplate } from '../../lib/widgets';
import { FILES } from '../constants/collectionTypes';
import { COMMIT_AUTHOR, COMMIT_DATE } from '../constants/commitProps';
import {
  getFileFromSlug,
  selectField,
  selectIdentifier,
  selectInferedField,
} from '../reducers/collections';
import type { CmsConfig, CmsSlug, Entry } from '../types/redux';
import { sanitizeSlug } from './urlHelper';

const {
  compileStringTemplate,
  parseDateFromEntry,
  SLUG_MISSING_REQUIRED_DATE,
  addFileTemplateFields,
} = stringTemplate;

const commitMessageTemplates = {
  create: 'Create {{collection}} “{{slug}}”',
  update: 'Update {{collection}} “{{slug}}”',
  delete: 'Delete {{collection}} “{{slug}}”',
  uploadMedia: 'Upload “{{path}}”',
  deleteMedia: 'Delete “{{path}}”',
  openAuthoring: '{{message}}',
} as const;

const variableRegex = /\{\{([^}]+)\}\}/g;

type Options = {
  slug?: string;
  path?: string;
  collection?: Collection;
  authorLogin?: string;
  authorName?: string;
};

export function commitMessageFormatter(
  type: keyof typeof commitMessageTemplates,
  config: CmsConfig,
  { slug, path, collection, authorLogin, authorName }: Options,
  isOpenAuthoring?: boolean,
) {
  const templates = { ...commitMessageTemplates, ...(config.backend.commit_messages || {}) };

  const commitMessage = templates[type].replace(variableRegex, (_, variable) => {
    switch (variable) {
      case 'slug':
        return slug || '';
      case 'path':
        return path || '';
      case 'collection':
        return collection ? collection.label_singular || collection.label : '';
      case 'author-login':
        return authorLogin || '';
      case 'author-name':
        return authorName || '';
      default:
        console.warn(`Ignoring unknown variable “${variable}” in commit message template.`);
        return '';
    }
  });

  if (!isOpenAuthoring) {
    return commitMessage;
  }

  const message = templates.openAuthoring.replace(variableRegex, (_, variable) => {
    switch (variable) {
      case 'message':
        return commitMessage;
      case 'author-login':
        return authorLogin || '';
      case 'author-name':
        return authorName || '';
      default:
        console.warn(`Ignoring unknown variable “${variable}” in open authoring message template.`);
        return '';
    }
  });

  return message;
}

export function prepareSlug(slug: string) {
  return (
    slug
      .trim()
      // Convert slug to lower-case
      .toLocaleLowerCase()

      // Remove single quotes.
      .replace(/[']/g, '')

      // Replace periods with dashes.
      .replace(/[.]/g, '-')
  );
}

export function getProcessSegment(slugConfig?: CmsSlug, ignoreValues?: string[]) {
  return (value: string) =>
    ignoreValues && ignoreValues.includes(value)
      ? value
      : flow([value => String(value), prepareSlug, partialRight(sanitizeSlug, slugConfig)])(value);
}

export function slugFormatter(
  collection: Collection,
  entryData: Record<string, unknown>,
  slugConfig?: CmsSlug,
) {
  const slugTemplate = collection.slug || '{{slug}}';

  const identifier = getIn(entryData, selectIdentifier(collection) as string) as string;
  if (!identifier) {
    throw new Error(
      'Collection must have a field name that is a valid entry identifier, or must have `identifier_field` set',
    );
  }

  const processSegment = getProcessSegment(slugConfig);
  const date = formatISO(new Date());
  const slug = compileStringTemplate(slugTemplate, date, identifier, entryData, processSegment);

  if (!collection.path) {
    return slug;
  } else {
    const pathTemplate = prepareSlug(collection.path as string);
    return compileStringTemplate(pathTemplate, date, slug, entryData, (value: string) =>
      value === slug ? value : processSegment(value),
    );
  }
}

export function previewUrlFormatter(
  baseUrl: string,
  collection: Collection,
  slug: string,
  entry: Entry,
  slugConfig?: CmsSlug,
) {
  /**
   * Preview URL can't be created without `baseUrl`. This makes preview URLs
   * optional for backends that don't support them.
   */
  if (!baseUrl) {
    return;
  }

  const basePath = trimEnd(baseUrl, '/');

  const isFileCollection = collection.type === FILES;
  const file = isFileCollection ? getFileFromSlug(collection, entry.slug) : undefined;

  function getPathTemplate() {
    return file?.preview_path ?? collection.preview_path;
  }

  function getDateField() {
    return file?.preview_path_date_field ?? collection.preview_path_date_field;
  }

  /**
   * If a `previewPath` is provided for the collection/file, use it to construct the
   * URL path.
   */
  const pathTemplate = getPathTemplate();

  /**
   * Without a `previewPath` for the collection/file (via config), the preview URL
   * will be the URL provided by the backend.
   */
  if (!pathTemplate) {
    return baseUrl;
  }

  let fields = entry.data as Record<string, string>;
  fields = addFileTemplateFields(entry.path, fields, collection.folder);
  const dateFieldName = getDateField() || selectInferedField(collection, 'date');
  const date = parseDateFromEntry(entry as unknown as Record<string, unknown>, dateFieldName);

  // Prepare and sanitize slug variables only, leave the rest of the
  // `preview_path` template as is.
  const processSegment = getProcessSegment(slugConfig, [fields['dirname'] as string]);
  let compiledPath;

  try {
    compiledPath = compileStringTemplate(pathTemplate, date, slug, fields, processSegment);
  } catch (err: any) {
    // Print an error and ignore `preview_path` if both:
    //   1. Date is invalid (according to Moment), and
    //   2. A date expression (eg. `{{year}}`) is used in `preview_path`
    if (err.name === SLUG_MISSING_REQUIRED_DATE) {
      console.error(stripIndent`
        Collection "${collection.name}" configuration error:
          \`preview_path_date_field\` must be a field with a valid date. Ignoring \`preview_path\`.
      `);
      return basePath;
    }
    throw err;
  }

  const previewPath = trimStart(compiledPath, ' /');
  return `${basePath}/${previewPath}`;
}

export function summaryFormatter(summaryTemplate: string, entry: Entry, collection: Collection) {
  let entryData = entry.data;
  const date =
    parseDateFromEntry(
      entry as unknown as Record<string, unknown>,
      selectInferedField(collection, 'date'),
    ) || null;
  const identifier = getIn(entryData, selectIdentifier(collection));

  entryData = addFileTemplateFields(entry.path, entryData, collection.folder);
  // allow commit information in summary template
  if (entry.author && !selectField(collection, COMMIT_AUTHOR)) {
    entryData = entryData.set(COMMIT_AUTHOR, entry.author);
  }
  if (entry.updatedOn && !selectField(collection, COMMIT_DATE)) {
    entryData = entryData.set(COMMIT_DATE, entry.updatedOn);
  }
  const summary = compileStringTemplate(summaryTemplate, date, identifier, entryData);
  return summary;
}

export function folderFormatter(
  folderTemplate: string,
  entry: Entry | undefined,
  collection: Collection,
  defaultFolder: string,
  folderKey: string,
  slugConfig?: CmsSlug,
) {
  if (!entry || !entry.data) {
    return folderTemplate;
  }

  let fields = entry.data as Record<string, string>;
  fields[folderKey] = defaultFolder;
  fields = addFileTemplateFields(entry.path, fields, collection.folder);

  const date: string | null =
    parseDateFromEntry(
      entry as unknown as Record<string, unknown>,
      selectInferedField(collection, 'date'),
    ) || null;
  const identifier = getIn(fields, selectIdentifier(collection) as string) as string;
  const processSegment = getProcessSegment(slugConfig, [
    defaultFolder,
    fields['dirname'] as string,
  ]);

  const mediaFolder = compileStringTemplate(
    folderTemplate,
    date,
    identifier,
    fields,
    processSegment,
  );

  return mediaFolder;
}
