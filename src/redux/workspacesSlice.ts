import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { BrowserItem } from './filesSlice';

export interface WorkSpace {
  name: string;
  files: BrowserItem[];
}

interface WorkspacesState {
  workspaces: Record<string, WorkSpace>;
  activeWorkspace: string | null;
}

const initialFileItems: BrowserItem[] = [
  {
    type: 'folder',
    name: 'Folder 1',
    path: '/Folder 1',
    children: [
      {
        path: '/Folder 1/Document 1',
        type: 'file',
        name: 'Document 1',
        subType: 'document',
        attachment: '/path/to/doc1.pdf',
        content: '<h1>Document 1 Header</h1><p>Document 1 paragraph</p>',
        initialContent: '<h1>Document 1 Header</h1><p>Document 1 paragraph</p>',
      },
      {
        path: '/Folder 1/Image 1',
        type: 'file',
        name: 'Image 1',
        subType: 'image',
        content: 'data:image/png;base64,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',
      },
      {
        path: '/Folder 1/Subfolder 1',
        type: 'folder',
        name: 'Subfolder 1',
        children: [
          {
            path: '/Folder 1/Subfolder 1/Document 2',
            type: 'file',
            name: 'Document 2',
            subType: 'document',
            content: '<h1>Sample Header</h1><p>Sample paragraph</p>',
            initialContent: '<h1>Sample Header</h1><p>Sample paragraph</p>',
          },
          {
            path: '/Folder 1/Subfolder 1/Image 2',
            type: 'file',
            name: 'Image 2',
            subType: 'image',
          },
        ],
      },
    ],
  },
  {
    type: 'folder',
    name: 'Folder 2',
    path: '/Folder 2',
    children: [
      {
        path: '/Folder 2/Document 3',
        type: 'file',
        name: 'Document 3',
        subType: 'document',
        content: '<h1>Document 3 Header</h1><p>Document 3 paragraph</p>',
        initialContent: '<h1>Document 3 Header</h1><p>Document 3 paragraph</p>',
      },
    ],
  },
  {
    type: 'file',
    path: '/Document 4',
    name: 'Document 4',
    subType: 'document',
    content: '<h1>Document 4 Header</h1><p>Document 4 paragraph</p>',
    initialContent: '<h1>Document 4 Header</h1><p>Document 4 paragraph</p>',
  },
  {
    path: '/Image 3',
    type: 'file',
    name: 'Image 3',
    subType: 'image',
  },
];

const initialState: WorkspacesState = {
  workspaces: {
    'Demo Workspace': {
      name: 'Demo Workspace',
      files: initialFileItems,
    },
  },
  activeWorkspace: 'Demo Workspace',
};

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    addWorkspace: (state, action: PayloadAction<WorkSpace>) => {
      const { name } = action.payload;
      state.workspaces[name] = action.payload;
    },
    saveWorkspace: (state, action: PayloadAction<WorkSpace>) => {
      const { name } = action.payload;
      state.workspaces[name] = action.payload;
    },
    removeWorkspace: (state, action: PayloadAction<string>) => {
      const workspaceName = action.payload;
      if (state.activeWorkspace === workspaceName) {
        state.activeWorkspace = null;
      }
      delete state.workspaces[workspaceName];
    },
    setActiveWorkspace: (state, action: PayloadAction<string>) => {
      state.activeWorkspace = action.payload;
    },
  },
});

export const selectActiveWorkspaceFiles = (state: RootState): BrowserItem[] => {
  const activeWorkspace = state.workspaces.activeWorkspace;
  if (!activeWorkspace) return [];
  return state.workspaces.workspaces[activeWorkspace]?.files ?? [];
};

export const selectWorkspaceFilesByName = (
  state: RootState,
  workspaceName: string
): BrowserItem[] => {
  return state.workspaces.workspaces[workspaceName]?.files ?? [];
};

export const { addWorkspace, removeWorkspace, setActiveWorkspace } = workspacesSlice.actions;

export default workspacesSlice.reducer;
