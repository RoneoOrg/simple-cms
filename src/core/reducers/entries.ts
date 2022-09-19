import { groupBy, once, orderBy, set, sortBy, trim } from 'lodash';
import { dirname, join } from 'path-browserify';
import { Collection } from '..';
import { basename, isAbsolutePath } from '../../lib/util';
import { getIn } from '../../lib/util/objectUtil';
import {
  CHANGE_VIEW_STYLE,
  ENTRIES_FAILURE,
  ENTRIES_REQUEST,
  ENTRIES_SUCCESS,
  ENTRY_DELETE_SUCCESS,
  ENTRY_FAILURE,
  ENTRY_REQUEST,
  ENTRY_SUCCESS,
  FILTER_ENTRIES_FAILURE,
  FILTER_ENTRIES_REQUEST,
  FILTER_ENTRIES_SUCCESS,
  GROUP_ENTRIES_FAILURE,
  GROUP_ENTRIES_REQUEST,
  GROUP_ENTRIES_SUCCESS,
  SORT_ENTRIES_FAILURE,
  SORT_ENTRIES_REQUEST,
  SORT_ENTRIES_SUCCESS,
} from '../actions/entries';
import { SEARCH_ENTRIES_SUCCESS } from '../actions/search';
import { VIEW_STYLE_LIST } from '../constants/collectionViews';
import { folderFormatter } from '../lib/formatters';
import { joinUrlPath } from '../lib/urlHelper';
import type {
  ChangeViewStylePayload,
  CmsConfig,
  CollectionFiles,
  Entries,
  EntriesAction,
  EntriesFilterFailurePayload,
  EntriesFilterRequestPayload,
  EntriesGroupFailurePayload,
  EntriesGroupRequestPayload,
  EntriesRequestPayload,
  EntriesSortFailurePayload,
  EntriesSortRequestPayload,
  EntriesSuccessPayload,
  Entry,
  EntryDeletePayload,
  EntryDraft,
  EntryFailurePayload,
  EntryField,
  EntryRequestPayload,
  EntrySuccessPayload,
  Filter,
  Group,
  GroupMap,
  GroupOfEntries,
  Sort,
  SortMap,
  SortObject,
} from '../types/redux';
import { SortDirection } from '../types/redux';
import { selectSortDataPath } from './collections';

const storageSortKey = '../netlify-cms.entries.sort';
const viewStyleKey = '../netlify-cms.entries.viewStyle';
type StorageSortObject = SortObject & { index: number };
type StorageSort = { [collection: string]: { [key: string]: StorageSortObject } };

const loadSort = once(() => {
  const sortString = localStorage.getItem(storageSortKey);
  if (sortString) {
    try {
      const sort: StorageSort = JSON.parse(sortString);
      let map: Sort = {};
      Object.entries(sort).forEach(([collection, sort]) => {
        let orderedMap = {} as SortMap;
        sortBy(Object.values(sort), ['index']).forEach(value => {
          const { key, direction } = value;
          orderedMap[key] = { key, direction };
        });
        map[collection] = orderedMap;
      });
      return map;
    } catch (e: any) {
      return {} as Sort;
    }
  }
  return {} as Sort;
});

function clearSort() {
  localStorage.removeItem(storageSortKey);
}

function persistSort(sort: Sort | undefined) {
  if (sort) {
    const storageSort: StorageSort = {};
    Object.keys(sort).forEach(key => {
      const collection = key as string;
      const sortObjects = (
        (sort[collection] ? Object.values(sort[collection]) : []) as SortObject[]
      ).map((value, index) => ({ ...value, index }));

      sortObjects.forEach(value => {
        set(storageSort, [collection, value.key], value);
      });
    });
    localStorage.setItem(storageSortKey, JSON.stringify(storageSort));
  } else {
    clearSort();
  }
}

const loadViewStyle = once(() => {
  const viewStyle = localStorage.getItem(viewStyleKey);
  if (viewStyle) {
    return viewStyle;
  }

  localStorage.setItem(viewStyleKey, VIEW_STYLE_LIST);
  return VIEW_STYLE_LIST;
});

function clearViewStyle() {
  localStorage.removeItem(viewStyleKey);
}

function persistViewStyle(viewStyle: string | undefined) {
  if (viewStyle) {
    localStorage.setItem(viewStyleKey, viewStyle);
  } else {
    clearViewStyle();
  }
}

function entries(
  state = { entities: {}, pages: {}, sort: loadSort(), viewStyle: loadViewStyle() },
  action: EntriesAction,
) {
  switch (action.type) {
    case ENTRY_REQUEST: {
      const payload = action.payload as EntryRequestPayload;

      const entities = {
        ...state.entities,
      };

      const newCollection = {
        ...((entities as any)[payload.collection] ?? {}),
      };

      const newEntity = {
        ...(newCollection[payload.slug] ?? {}),
      };

      newEntity.isFetching = true;

      newCollection[payload.slug] = newEntity;

      (entities as any)[payload.collection] = newCollection;

      return { ...state, entities };
    }

    case ENTRY_SUCCESS: {
      const payload = action.payload as EntrySuccessPayload;
      const collection = payload.collection;
      const slug = payload.entry.slug;

      const entities = {
        ...state.entities,
      };

      const newCollection = {
        ...((entities as any)[collection] ?? {}),
      };

      newCollection[slug] = payload.entry;
      (entities as any)[collection] = newCollection;

      const pages = {
        ...state.pages,
      };

      const newPagesCollection = {
        ...((pages as any)[collection] ?? {}),
      };

      if (!newPagesCollection.ids) {
        newPagesCollection.ids = [];
      }

      if (!newPagesCollection.ids.includes(slug)) {
        newPagesCollection.ids.unshift(slug);
      }

      (pages as any)[collection] = newPagesCollection;

      return {
        ...state,
        entities,
        pages,
      };
    }

    case ENTRIES_REQUEST: {
      const payload = action.payload as EntriesRequestPayload;

      const pages = {
        ...state.pages,
      };

      if (payload.collection in pages) {
        const newCollection = {
          ...((pages as any)[payload.collection] ?? {}),
        };

        newCollection.isFetching = true;

        (pages as any)[payload.collection] = newCollection;
      }

      return { ...state, pages };
    }

    case ENTRIES_SUCCESS: {
      const payload = action.payload as EntriesSuccessPayload;
      const loadedEntries = payload.entries;
      const page = payload.page;

      console.log('hello from entries reducer!');

      const entities = {
        ...state.entities,
      };

      const newCollection = {
        ...((entities as any)[payload.collection] ?? {}),
      };

      loadedEntries.forEach((entry: any) => {
        newCollection[entry.slug] = { ...entry, isFetching: false };
      });

      (entities as any)[payload.collection] = newCollection;

      const pages = {
        ...state.pages,
      };

      (pages as any)[payload.collection] = {
        page,
        ids: loadedEntries.map(entry => entry.slug),
      };

      return { ...state, entities, pages };
    }
    case ENTRIES_FAILURE:
      const pages = {
        ...state.pages,
      };

      if (action.meta.collection in pages) {
        const newCollection = {
          ...((pages as any)[action.meta.collection] ?? {}),
        };

        newCollection.isFetching = false;

        (pages as any)[action.meta.collection] = newCollection;
      }

      return { ...state, pages };

    case ENTRY_FAILURE: {
      const payload = action.payload as EntryFailurePayload;

      const entities = {
        ...state.entities,
      };

      const newCollection = {
        ...((entities as any)[payload.collection] ?? {}),
      };

      const newEntity = {
        ...(newCollection[payload.slug] ?? {}),
      };

      newEntity.isFetching = false;
      newEntity.error = payload.error.message;

      newCollection[payload.slug] = newEntity;

      (entities as any)[payload.collection] = newCollection;

      return { ...state, entities };
    }

    case SEARCH_ENTRIES_SUCCESS: {
      const payload = action.payload as EntriesSuccessPayload;
      const loadedEntries = payload.entries;

      const entities = {
        ...state.entities,
      };

      loadedEntries.forEach(entry => {
        const newCollection = {
          ...((entities as any)[entry.collection] ?? {}),
        };

        newCollection[entry.slug] = {
          ...entry,
          isFetching: false,
        };

        (entities as any)[entry.collection] = newCollection;
      });

      return { ...state, entities };
    }

    case ENTRY_DELETE_SUCCESS: {
      const payload = action.payload as EntryDeletePayload;
      const collection = payload.collectionName;
      const slug = payload.entrySlug;

      const entities = {
        ...state.entities,
      };

      const newCollection = {
        ...((entities as any)[collection] ?? {}),
      };

      delete newCollection[slug];
      (entities as any)[collection] = newCollection;

      const pages = {
        ...state.pages,
      };

      const newPagesCollection = {
        ...((pages as any)[collection] ?? {}),
      };

      if (!newPagesCollection.ids) {
        newPagesCollection.ids = [];
      }

      newPagesCollection.ids = newPagesCollection.ids.filter(
        (id: string) => id !== payload.entrySlug,
      );

      (pages as any)[collection] = newPagesCollection;

      return {
        ...state,
        entities,
        pages,
      };
    }

    case SORT_ENTRIES_REQUEST: {
      const payload = action.payload as EntriesSortRequestPayload;
      const { collection, key, direction } = payload;

      const sort = {
        ...state.sort,
      };

      sort[collection] = { [key]: { key, direction } } as SortMap;

      const pages = {
        ...state.pages,
      };

      const newPagesCollection = {
        ...((pages as any)[collection] ?? {}),
      };

      newPagesCollection.isFetching = true;
      delete newPagesCollection.page;

      (pages as any)[collection] = newPagesCollection;

      persistSort(sort);

      return {
        ...state,
        sort,
        pages,
      };
    }

    case GROUP_ENTRIES_SUCCESS:
    case FILTER_ENTRIES_SUCCESS:
    case SORT_ENTRIES_SUCCESS: {
      const payload = action.payload as { collection: string; entries: Entry[] };
      const { collection, entries } = payload;

      const entities = {
        ...state.entities,
      };

      entries.forEach((entry: any) => {
        const newCollection = {
          ...((entities as any)[entry.collection] ?? {}),
        };

        newCollection[entry.slug] = {
          ...entry,
          isFetching: false,
        };

        (entities as any)[entry.collection] = newCollection;
      });

      const pages = {
        ...state.pages,
      };

      const ids = entries.map(entry => entry.slug);

      (pages as any)[collection] = {
        page: 1,
        ids,
        isFetching: false,
      };

      return {
        ...state,
        entities,
        pages,
      };
    }

    case SORT_ENTRIES_FAILURE: {
      const payload = action.payload as EntriesSortFailurePayload;
      const { collection, key } = payload;

      const sort = {
        ...state.sort,
      };

      const newSortCollection = {
        ...(sort[collection] ?? {}),
      };

      delete newSortCollection[key];

      sort[collection] = newSortCollection;

      const pages = {
        ...state.pages,
      };

      const newPagesCollection = {
        ...((pages as any)[collection] ?? {}),
      };

      newPagesCollection.isFetching = false;
      delete newPagesCollection.page;

      (pages as any)[collection] = newPagesCollection;

      persistSort(sort);

      return {
        ...state,
        sort,
        pages,
      };
    }

    case FILTER_ENTRIES_REQUEST: {
      const payload = action.payload as EntriesFilterRequestPayload;
      const { collection, filter: viewFilter } = payload;

      const filter = {
        ...(state as any).filter,
      };

      const newFilterCollection = {
        ...(filter[collection] ?? {}),
      };

      let newFilter: any;
      if (viewFilter.id in newFilterCollection) {
        newFilter = { ...newFilterCollection[viewFilter.id] };
      } else {
        newFilter = { ...viewFilter };
      }

      newFilter.active = !newFilter.active;
      newFilterCollection[viewFilter.id] = newFilter;
      filter[collection] = newFilterCollection;

      return {
        ...state,
        filter,
      };
    }

    case FILTER_ENTRIES_FAILURE: {
      const payload = action.payload as EntriesFilterFailurePayload;
      const { collection, filter: viewFilter } = payload;

      const filter = {
        ...(state as any).filter,
      };

      const newFilterCollection = {
        ...(filter[collection] ?? {}),
      };

      delete newFilterCollection[viewFilter.id];
      filter[collection] = newFilterCollection;

      const pages = {
        ...state.pages,
      };

      const newPagesCollection = {
        ...((pages as any)[collection] ?? {}),
      };

      newPagesCollection.isFetching = false;

      (pages as any)[collection] = newPagesCollection;

      return {
        ...state,
        filter,
        pages,
      };
    }

    case GROUP_ENTRIES_REQUEST: {
      const payload = action.payload as EntriesGroupRequestPayload;
      const { collection, group: groupBy } = payload;

      const group = {
        ...(state as any).group,
      };

      let newGroup: any;
      if (groupBy.id in group[collection]) {
        newGroup = { ...group[collection][groupBy.id] };
      } else {
        newGroup = { ...groupBy };
      }

      newGroup.active = !newGroup.active;
      group[collection] = {
        [groupBy.id]: newGroup,
      };

      return {
        ...state,
        group,
      };
    }

    case GROUP_ENTRIES_FAILURE: {
      const payload = action.payload as EntriesGroupFailurePayload;
      const { collection, group: groupBy } = payload;

      const group = {
        ...(state as any).group,
      };

      const newGroupCollection = {
        ...(group[collection] ?? {}),
      };

      delete newGroupCollection[groupBy.id];

      group[collection] = newGroupCollection;

      const pages = {
        ...state.pages,
      };

      const newPagesCollection = {
        ...((pages as any)[collection] ?? {}),
      };

      newPagesCollection.isFetching = false;

      (pages as any)[collection] = newPagesCollection;

      return {
        ...state,
        group,
        pages,
      };
    }

    case CHANGE_VIEW_STYLE: {
      const payload = action.payload as unknown as ChangeViewStylePayload;
      const { style } = payload;
      persistViewStyle(style);
      return {
        ...state,
        viewStyle: style,
      };
    }

    default:
      return state;
  }
}

export function selectEntriesSort(entries: Entries, collection: string) {
  const sort = entries.sort as Sort | undefined;
  return sort?.[collection];
}

export function selectEntriesFilter(entries: Entries, collection: string) {
  const filter = entries.filter as Filter | undefined;
  return filter?.[collection] || {};
}

export function selectEntriesGroup(entries: Entries, collection: string) {
  const group = entries.group as Group | undefined;
  return group?.[collection] || {};
}

export function selectEntriesGroupField(entries: Entries, collection: string) {
  const groups = selectEntriesGroup(entries, collection);
  const value = Object.values(groups ?? {}).find((v: any) => v?.active === true);
  return value;
}

export function selectEntriesSortFields(entries: Entries, collection: string) {
  const sort = selectEntriesSort(entries, collection);
  const values = Object.values(sort ?? {}).filter(v => v?.direction !== SortDirection.None) || [];

  return values;
}

export function selectEntriesFilterFields(entries: Entries, collection: string) {
  const filter = selectEntriesFilter(entries, collection);
  const values = Object.values(filter ?? {}).filter(v => v?.active === true) || [];
  return values;
}

export function selectViewStyle(entries: Entries) {
  return entries.viewStyle;
}

export function selectEntry(state: Entries, collection: string, slug: string) {
  return state.entities[collection]?.[slug];
}

export function selectPublishedSlugs(state: Entries, collection: string) {
  return state.pages[collection]?.ids ?? [];
}

function getPublishedEntries(state: Entries, collectionName: string) {
  const slugs = selectPublishedSlugs(state, collectionName);
  const entries =
    slugs && (slugs.map(slug => selectEntry(state, collectionName, slug as string)) as Entry[]);
  return entries;
}

export function selectEntries(state: Entries, collection: Collection) {
  const collectionName = collection.name;
  let entries = getPublishedEntries(state, collectionName);

  const sortFields = selectEntriesSortFields(state, collectionName);
  if (sortFields && sortFields.length > 0) {
    const keys = sortFields.map(v => selectSortDataPath(collection, v.key));
    const orders = sortFields.map(v => (v.direction === SortDirection.Ascending ? 'asc' : 'desc'));
    entries = orderBy(entries, keys, orders);
  }

  const filters = selectEntriesFilterFields(state, collectionName);
  if (filters && filters.length > 0) {
    entries = entries.filter(e => {
      const allMatched = filters.every(f => {
        const pattern = f.pattern;
        const field = f.field;
        const data = e!.data || {};
        const toMatch = getIn(data, field);
        const matched = toMatch !== undefined && new RegExp(String(pattern)).test(String(toMatch));
        return matched;
      });
      return allMatched;
    });
  }

  return entries;
}

function getGroup(entry: Entry, selectedGroup: GroupMap) {
  const label = selectedGroup.label;
  const field = selectedGroup.field;

  const fieldData = getIn(entry.data, field);
  if (fieldData === undefined) {
    return {
      id: 'missing_value',
      label,
      value: fieldData,
    };
  }

  const dataAsString = String(fieldData);
  if (selectedGroup.pattern) {
    const pattern = selectedGroup.pattern;
    let value = '';
    try {
      const regex = new RegExp(pattern);
      const matched = dataAsString.match(regex);
      if (matched) {
        value = matched[0];
      }
    } catch (e: any) {
      console.warn(`Invalid view group pattern '${pattern}' for field '${field}'`, e);
    }
    return {
      id: `${label}${value}`,
      label,
      value,
    };
  }

  return {
    id: `${label}${fieldData}`,
    label,
    value: typeof fieldData === 'boolean' ? fieldData : dataAsString,
  };
}

export function selectGroups(state: Entries, collection: Collection) {
  const collectionName = collection.name;
  const entries = getPublishedEntries(state, collectionName);

  const selectedGroup = selectEntriesGroupField(state, collectionName);
  if (selectedGroup === undefined) {
    return [];
  }

  let groups: Record<string, { id: string; label: string; value: string | boolean | undefined }> =
    {};
  const groupedEntries = groupBy(entries, entry => {
    const group = getGroup(entry, selectedGroup);
    groups = { ...groups, [group.id]: group };
    return group.id;
  });

  const groupsArray: GroupOfEntries[] = Object.entries(groupedEntries).map(([id, entries]) => {
    return {
      ...groups[id],
      paths: new Set(entries.map(entry => entry.path)),
    };
  });

  return groupsArray;
}

export function selectEntryByPath(state: Entries, collection: string, path: string) {
  const slugs = selectPublishedSlugs(state, collection);
  const entries =
    slugs && (slugs.map(slug => selectEntry(state, collection, slug as string)) as Entry[]);

  return entries && entries.find(e => e?.path === path);
}

export function selectEntriesLoaded(state: Entries, collection: string) {
  return !!state.pages[collection];
}

export function selectIsFetching(state: Entries, collection: string) {
  return state.pages[collection]?.isFetching ?? false;
}

const DRAFT_MEDIA_FILES = 'DRAFT_MEDIA_FILES';

function getFileField(collectionFiles: CollectionFiles, slug: string | undefined) {
  const file = collectionFiles.find(f => f?.name === slug);
  return file;
}

function hasCustomFolder(
  folderKey: 'media_folder' | 'public_folder',
  collection: Collection | undefined | null,
  slug: string | undefined,
  field: EntryField | undefined,
) {
  if (!collection) {
    return false;
  }

  if (field && field[folderKey]) {
    return true;
  }

  if (collection.files) {
    const file = getFileField(collection.files, slug);
    if (file && file[folderKey]) {
      return true;
    }
  }

  if (collection[folderKey]) {
    return true;
  }

  return false;
}

function traverseFields(
  folderKey: 'media_folder' | 'public_folder',
  config: CmsConfig,
  collection: Collection,
  entryMap: Entry | undefined,
  field: EntryField,
  fields: EntryField[],
  currentFolder: string,
): string | null {
  const matchedField = fields.filter(f => f === field)[0];
  if (matchedField) {
    return folderFormatter(
      matchedField[folderKey] ? matchedField[folderKey]! : `{{${folderKey}}}`,
      entryMap,
      collection,
      currentFolder,
      folderKey,
      config.slug,
    );
  }

  for (let f of fields) {
    const field = { ...f };
    if (!field[folderKey]) {
      // add identity template if doesn't exist
      field[folderKey] = `{{${folderKey}}}`;
    }
    const folder = folderFormatter(
      field[folderKey]!,
      entryMap,
      collection,
      currentFolder,
      folderKey,
      config.slug,
    );
    let fieldFolder = null;
    if (field.fields) {
      fieldFolder = traverseFields(
        folderKey,
        config,
        collection,
        entryMap,
        field,
        field.fields!,
        folder,
      );
    } else if (field.fields) {
      fieldFolder = traverseFields(
        folderKey,
        config,
        collection,
        entryMap,
        field,
        [field.field!],
        folder,
      );
    } else if (field.fields) {
      fieldFolder = traverseFields(
        folderKey,
        config,
        collection,
        entryMap,
        field,
        field.types!,
        folder,
      );
    }
    if (fieldFolder != null) {
      return fieldFolder;
    }
  }

  return null;
}

function evaluateFolder(
  folderKey: 'media_folder' | 'public_folder',
  config: CmsConfig,
  c: Collection,
  entryMap: Entry | undefined,
  field: EntryField | undefined,
) {
  let currentFolder = config[folderKey]!;

  const collection = { ...c };
  // add identity template if doesn't exist
  if (!collection[folderKey]) {
    collection[folderKey] = `{{${folderKey}}}`;
  }

  if (collection.files) {
    // files collection evaluate the collection template
    // then move on to the specific file configuration denoted by the slug
    currentFolder = folderFormatter(
      collection[folderKey]!,
      entryMap,
      collection,
      currentFolder,
      folderKey,
      config.slug,
    );

    let f = getFileField(collection.files!, entryMap?.slug);
    if (f) {
      const file = { ...f };
      if (!file[folderKey]) {
        // add identity template if doesn't exist
        file[folderKey] = `{{${folderKey}}}`;
      }

      // evaluate the file template and keep evaluating until we match our field
      currentFolder = folderFormatter(
        file[folderKey]!,
        entryMap,
        collection,
        currentFolder,
        folderKey,
        config.slug,
      );

      if (field) {
        const fieldFolder = traverseFields(
          folderKey,
          config,
          collection,
          entryMap,
          field,
          file.fields! as EntryField[],
          currentFolder,
        );

        if (fieldFolder !== null) {
          currentFolder = fieldFolder;
        }
      }
    }
  } else {
    // folder collection, evaluate the collection template
    // and keep evaluating until we match our field
    currentFolder = folderFormatter(
      collection[folderKey]!,
      entryMap,
      collection,
      currentFolder,
      folderKey,
      config.slug,
    );

    if (field) {
      const fieldFolder = traverseFields(
        folderKey,
        config,
        collection,
        entryMap,
        field,
        collection.fields! as EntryField[],
        currentFolder,
      );

      if (fieldFolder !== null) {
        currentFolder = fieldFolder;
      }
    }
  }

  return currentFolder;
}

export function selectMediaFolder(
  config: CmsConfig,
  collection: Collection | undefined | null,
  entryMap: Entry | undefined,
  field: EntryField | undefined,
) {
  const name = 'media_folder';
  let mediaFolder = config[name];

  const customFolder = hasCustomFolder(name, collection, entryMap?.slug, field);

  if (customFolder) {
    const folder = evaluateFolder(name, config, collection!, entryMap, field);
    if (folder.startsWith('/')) {
      // return absolute paths as is
      mediaFolder = join(folder);
    } else {
      const entryPath = entryMap?.path;
      mediaFolder = entryPath
        ? join(dirname(entryPath), folder)
        : join(collection!.folder as string, DRAFT_MEDIA_FILES);
    }
  }

  return trim(mediaFolder, '/');
}

export function selectMediaFilePath(
  config: CmsConfig,
  collection: Collection | null,
  entryMap: Entry | undefined,
  mediaPath: string,
  field: EntryField | undefined,
) {
  if (isAbsolutePath(mediaPath)) {
    return mediaPath;
  }

  const mediaFolder = selectMediaFolder(config, collection, entryMap, field);

  return join(mediaFolder, basename(mediaPath));
}

export function selectMediaFilePublicPath(
  config: CmsConfig,
  collection: Collection | null,
  mediaPath: string,
  entryMap: Entry | undefined,
  field: EntryField | undefined,
) {
  if (isAbsolutePath(mediaPath)) {
    return mediaPath;
  }

  const name = 'public_folder';
  let publicFolder = config[name]!;

  const customFolder = hasCustomFolder(name, collection, entryMap?.slug, field);

  if (customFolder) {
    publicFolder = evaluateFolder(name, config, collection!, entryMap, field);
  }

  if (isAbsolutePath(publicFolder)) {
    return joinUrlPath(publicFolder, basename(mediaPath));
  }

  return join(publicFolder, basename(mediaPath));
}

export function selectEditingDraft(state: EntryDraft) {
  return state['entry'];
}

export default entries;
