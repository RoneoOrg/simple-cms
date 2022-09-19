import createRootReducer from '../reducers/combinedReducer';

import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: createRootReducer(),
});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
