// src/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectListing } from '../Project/ProjectTypes';
import { RootState } from './store';
import { CustomFont } from '../Project/CustomFontsDialog';

export type ProjectCategory = 'Created' | 'Collaborator';

type ProjectCategories = {
  [key in ProjectCategory]: ProjectListing[];
};

export type AppUser = {
  id: number | null;
  username: string | null;
  email: string | null;
};

export type UserState = AppUser & {
  token: string | null;
  projects?: {
    Created: ProjectListing[];
    Collaborator: ProjectListing[];
  };
  fonts?: CustomFont[];
};

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  token: null,
  projects: {
    Created: [],
    Collaborator: []
  },
  fonts: undefined
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.id = null;
      state.username = null;
      state.token = null;
    },
    setUserProjects: (state, action: PayloadAction<ProjectCategories>) => {
      state.projects = {
        Created: action.payload.Created,
        Collaborator: action.payload.Collaborator
      };
    },
    setUserFonts: (state, action: PayloadAction<CustomFont[]>) => {
      state.fonts = action.payload;
    },
  },
});

export const { setUser, clearUser, setUserProjects, setUserFonts } = userSlice.actions;

// getUser selector function
export const getActiveUser = (state: RootState) => {
  return state.user;
};

export default userSlice.reducer;