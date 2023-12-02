// src/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export type ScreenName = 'userSettings' | 'projectManagement' | 'projectSettings' | 'mainMenuMobile' | null;

type AppState = {
  screen: ScreenName;
};

const initialState: AppState = {
  screen: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState: initialState,
  reducers: {
    setScreen: (state, action: PayloadAction<ScreenName>) => {
      state.screen = action.payload;
    }
  },
});

export const { setScreen } = appSlice.actions;

// getContent selector function
export const getActiveScreen = (state: RootState) => {
  return state.app.screen;
};

export default appSlice.reducer;