import { combineReducers } from 'redux';
import {reducer as toastrReducer} from 'react-redux-toastr'

import reducers from './index';

function createRootReducer() {
  return combineReducers({
    ...reducers,
    toastr: toastrReducer // <- Mounted at toastr.
  });
}

export default createRootReducer;
