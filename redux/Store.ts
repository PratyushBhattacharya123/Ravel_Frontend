import {configureStore} from '@reduxjs/toolkit';
import authSlice from './features/auth/authSlice';
import {apiSlice} from './features/api/apiSlice';

const Store: any = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
  },
  devTools: false,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(apiSlice.middleware),
});

export default Store;
