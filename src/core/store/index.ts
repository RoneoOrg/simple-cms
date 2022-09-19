import createRootReducer from '../reducers/combinedReducer';

import { configureStore } from '@reduxjs/toolkit';
import { waitUntilAction } from './middleware/waitUntilAction';

const store = configureStore({
  reducer: createRootReducer(),
  middleware: getDefaultMiddleware => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['WAIT_UNTIL_ACTION'],
        ignoredActionPaths: ['payload.cursor'],
      },
    }).concat(waitUntilAction),
});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
