import { fromJS, List, Map } from 'immutable';
import { get } from 'lodash';
import { join } from 'path-browserify';
import { v4 as uuid } from 'uuid';
import {
  ADD_DRAFT_ENTRY_MEDIA_FILE,
  DRAFT_CHANGE_FIELD,
  DRAFT_CLEAR_ERRORS,
  DRAFT_CREATE_DUPLICATE_FROM_ENTRY,
  DRAFT_CREATE_EMPTY,
  DRAFT_CREATE_FROM_ENTRY,
  DRAFT_CREATE_FROM_LOCAL_BACKUP,
  DRAFT_DISCARD,
  DRAFT_LOCAL_BACKUP_RETRIEVED,
  DRAFT_VALIDATION_ERRORS,
  ENTRY_DELETE_SUCCESS,
  ENTRY_PERSIST_FAILURE,
  ENTRY_PERSIST_REQUEST,
  ENTRY_PERSIST_SUCCESS,
  REMOVE_DRAFT_ENTRY_MEDIA_FILE,
} from '../actions/entries';
import { duplicateI18nFields, getDataPath } from '../lib/i18n';
import { selectFolderEntryExtension, selectHasMetaPath } from './collections';

const initialState = Map({
  entry: {},
  fieldsMetaData: {},
  fieldsErrors: {},
  hasChanged: false,
  key: '',
});

function entryDraftReducer(state = {}, action) {
  switch (action.type) {
    case DRAFT_CREATE_FROM_ENTRY:
      // Existing Entry
      return state.withMutations(state => {
        state.set('entry', fromJS(action.payload.entry));
        state.setIn(['entry', 'newRecord'], false);
        state.set('fieldsMetaData', {});
        state.set('fieldsErrors', {});
        state.set('hasChanged', false);
        state.set('key', uuid());
      });
    case DRAFT_CREATE_EMPTY:
      // New Entry
      return state.withMutations(state => {
        state.set('entry', fromJS(action.payload));
        state.setIn(['entry', 'newRecord'], true);
        state.set('fieldsMetaData', {});
        state.set('fieldsErrors', {});
        state.set('hasChanged', false);
        state.set('key', uuid());
      });
    case DRAFT_CREATE_FROM_LOCAL_BACKUP:
      // Local Backup
      return state.withMutations(state => {
        const backupDraftEntry = state.localBackup;
        const backupEntry = backupDraftEntry['entry'];
        state.delete('localBackup');
        state.set('entry', backupEntry);
        state.setIn(['entry', 'newRecord'], !backupEntry.path);
        state.set('fieldsMetaData', {});
        state.set('fieldsErrors', {});
        state.set('hasChanged', true);
        state.set('key', uuid());
      });
    case DRAFT_CREATE_DUPLICATE_FROM_ENTRY:
      // Duplicate Entry
      return state.withMutations(state => {
        state.set('entry', fromJS(action.payload));
        state.setIn(['entry', 'newRecord'], true);
        state.set('mediaFiles', List());
        state.set('fieldsMetaData', {});
        state.set('fieldsErrors', {});
        state.set('hasChanged', true);
      });
    case DRAFT_DISCARD:
      return initialState;
    case DRAFT_LOCAL_BACKUP_RETRIEVED: {
      const { entry } = action.payload;
      const newState = new Map({
        entry: fromJS(entry),
      });
      return state.set('localBackup', newState);
    }
    case DRAFT_CHANGE_FIELD: {
      return state.withMutations(state => {
        const { field, value, metadata, entries, i18n } = action.payload;
        const name = field.name;
        const meta = field.meta;

        const dataPath = (i18n && getDataPath(i18n.currentLocale, i18n.defaultLocale)) || ['data'];
        if (meta) {
          state.setIn(['entry', 'meta', name], value);
        } else {
          state.setIn(['entry', ...dataPath, name], value);
          if (i18n) {
            state = duplicateI18nFields(state, field, i18n.locales, i18n.defaultLocale);
          }
        }
        state.mergeDeepIn(['fieldsMetaData'], fromJS(metadata));
        const newData = state.getIn(['entry', ...dataPath]);
        const newMeta = state.getIn(['entry', 'meta']);
        state.set(
          'hasChanged',
          !entries.some(e => newData.equals(e.get(...dataPath))) ||
            !entries.some(e => newMeta.equals(e.meta)),
        );
      });
    }
    case DRAFT_VALIDATION_ERRORS:
      if (action.payload.errors.length === 0) {
        return state.deleteIn(['fieldsErrors', action.payload.uniquefieldId]);
      } else {
        return state.setIn(['fieldsErrors', action.payload.uniquefieldId], action.payload.errors);
      }

    case DRAFT_CLEAR_ERRORS: {
      return state.set('fieldsErrors', {});
    }

    case ENTRY_PERSIST_REQUEST: {
      return state.setIn(['entry', 'isPersisting'], true);
    }

    case ENTRY_PERSIST_FAILURE: {
      return state.deleteIn(['entry', 'isPersisting']);
    }

    case ENTRY_PERSIST_SUCCESS:
      return state.withMutations(state => {
        state.deleteIn(['entry', 'isPersisting']);
        state.set('hasChanged', false);
        if (!state.getIn(['entry', 'slug'])) {
          state.setIn(['entry', 'slug'], action.payload.slug);
        }
      });

    case ENTRY_DELETE_SUCCESS:
      return state.withMutations(state => {
        state.deleteIn(['entry', 'isPersisting']);
        state.set('hasChanged', false);
      });

    case ADD_DRAFT_ENTRY_MEDIA_FILE: {
      return state.withMutations(state => {
        const mediaFiles = state.getIn(['entry', 'mediaFiles']);

        state.setIn(
          ['entry', 'mediaFiles'],
          mediaFiles
            .filterNot(file => file.id === action.payload.id)
            .insert(0, fromJS(action.payload)),
        );
        state.set('hasChanged', true);
      });
    }

    case REMOVE_DRAFT_ENTRY_MEDIA_FILE: {
      return state.withMutations(state => {
        const mediaFiles = state.getIn(['entry', 'mediaFiles']);

        state.setIn(
          ['entry', 'mediaFiles'],
          mediaFiles.filterNot(file => file.id === action.payload.id),
        );
        state.set('hasChanged', true);
      });
    }

    default:
      return state;
  }
}

export function selectCustomPath(collection, entryDraft) {
  if (!selectHasMetaPath(collection)) {
    return;
  }
  const meta = entryDraft.getIn(['entry', 'meta']);
  const path = meta && meta.path;
  const indexFile = get(collection, ['meta', 'path', 'index_file']);
  const extension = selectFolderEntryExtension(collection);
  const customPath = path && join(collection.folder, path, `${indexFile}.${extension}`);
  return customPath;
}

export default entryDraftReducer;
