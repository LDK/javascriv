// src/themeSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

type themeState = {
  active: string;
};

const filesSlice = createSlice({
  name: 'files',
  initialState: { active: 'light' },
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.active = action.payload;
    },
  },
});

export const { setTheme } = filesSlice.actions;

export const selectFiles = (state: RootState) => state.files.files;
export const selectOpenFilePath = (state: RootState) => state.files.openFilePath;

// getContent selector function
export const getTheme = (state: RootState) => {
  return state.theme.active;
};

export default filesSlice.reducer;