import { Cursor } from '../../lib/util';
import { getIn, setIn } from '../../lib/util/objectUtil';
import {
  ENTRIES_SUCCESS,
  FILTER_ENTRIES_SUCCESS,
  GROUP_ENTRIES_SUCCESS,
  SORT_ENTRIES_SUCCESS,
} from '../actions/entries';

// Since pagination can be used for a variety of views (collections
// and searches are the most common examples), we namespace cursors by
// their type before storing them in the state.
export function selectCollectionEntriesCursor(state, collectionName) {
  return new Cursor(getIn(state, ['cursorsByType', 'collectionEntries', collectionName]));
}

function cursors(state = { cursorsByType: { collectionEntries: {} } }, action) {
  switch (action.type) {
    case ENTRIES_SUCCESS: {
      return setIn(
        state,
        ['cursorsByType', 'collectionEntries', action.payload.collection],
        Cursor.create(action.payload.cursor).store,
      );
    }
    case FILTER_ENTRIES_SUCCESS:
    case GROUP_ENTRIES_SUCCESS:
    case SORT_ENTRIES_SUCCESS: {
      return state.deleteIn(['cursorsByType', 'collectionEntries', action.payload.collection]);
    }
    default:
      return state;
  }
}

export default cursors;
