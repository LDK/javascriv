// src/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

type UserState = {
  id: number | null;
  username: string | null;
  email: string | null;
  token: string | null;
};

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      console.log('action', action);
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.id = null;
      state.username = null;
      state.token = null;
    }
  },
});

export const { setUser, clearUser } = userSlice.actions;

// getUser selector function
export const getUser = (state: RootState) => {
  return state;
};

export default userSlice.reducer;