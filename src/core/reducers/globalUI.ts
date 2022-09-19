import { produce } from 'immer';
import type { AnyAction } from 'redux';

export type GlobalUI = {
  isFetching: boolean;
};

const LOADING_IGNORE_LIST = [
  'STATUS_REQUEST',
  'STATUS_SUCCESS',
  'STATUS_FAILURE',
];

function ignoreWhenLoading(action: AnyAction) {
  return LOADING_IGNORE_LIST.some(type => action.type.includes(type));
}

const defaultState: GlobalUI = {
  isFetching: false,
};

/**
 * Reducer for some global UI state that we want to share between components
 */
const globalUI = produce((state: GlobalUI, action: AnyAction) => {
  // Generic, global loading indicator
  if (!ignoreWhenLoading(action) && action.type.includes('REQUEST')) {
    state.isFetching = true;
  } else if (
    !ignoreWhenLoading(action) &&
    (action.type.includes('SUCCESS') || action.type.includes('FAILURE'))
  ) {
    state.isFetching = false;
  }
}, defaultState);

export default globalUI;
