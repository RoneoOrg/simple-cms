import { combineReducers } from 'redux';
import snackbarReducer from '../store/slices/snackbars';
import entryDraftReducer from './entryDraft';
import collectionsReducer from './collections';
import searchReducer from './search';
import mediasReducer from './medias';
import mediaLibraryReducer from './mediaLibrary';
import globalUIReducer from './globalUI';
import statusReducer from './status';
import authReducer from './auth';
import configReducer from './config';
import integrationsReducer from './integrations';
import entriesReducer from './entries';
import cursorsReducer from './cursors';

function createRootReducer() {
  return combineReducers({
    auth: authReducer,
    config: configReducer,
    collections: collectionsReducer,
    search: searchReducer,
    integrations: integrationsReducer,
    entries: entriesReducer,
    cursors: cursorsReducer,
    entryDraft: entryDraftReducer,
    medias: mediasReducer,
    mediaLibrary: mediaLibraryReducer,
    globalUI: globalUIReducer,
    status: statusReducer,
    snackbar: snackbarReducer,
  });
}

export default createRootReducer;
