// src/store.tsx
import { configureStore } from '@reduxjs/toolkit';
import filesSlice from './filesSlice';

export const store = configureStore({
  reducer: {
    files: filesSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
