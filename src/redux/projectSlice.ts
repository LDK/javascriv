// redux/projectSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditorFont } from '../Editor/EditorFonts';
import { ProjectFile, ProjectState } from '../Project/ProjectTypes';
import { RootState } from './store';

const initialItems: ProjectFile[] = [

];

const initialState:ProjectState = {
  files: initialItems,
  openFilePath: null,
  settings: {},
  title: 'New Project'
};

export const findItemByPath = (items: ProjectFile[], path: string[]): ProjectFile | undefined => {
  const filteredPath = path.filter(p => p !== '');
  if (!filteredPath.length) return undefined;

  const [head, ...tail] = filteredPath;
  const item = items.find((i) => i.name === head);

  if (!item || !tail.length || item.type === 'file') {
    return item;
  } else {
    return findItemByPath(item.children || [], tail);
  }
};

export const findFolderByPath = (items: ProjectFile[], path: string[]): ProjectFile | undefined => {
  const filteredPath = path.filter(p => p !== '');
  if (!filteredPath.length) return undefined;

  const [head, ...tail] = filteredPath;
  const item = items.find((i) => i.name === head);

  if (!item || item.type === 'file') {
    return undefined;
  } else if (!tail.length) {
    return item;
  } else {
    return findFolderByPath(item.children || [], tail);
  }
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    saveSetting: (state, action: PayloadAction<{ settingKey: string; value: string | number | boolean }>) => {
      const { settingKey, value } = action.payload;
      if (state.settings) {
        state.settings[settingKey] = value;
      } else {
        state.settings = { [settingKey]: value };
      }
    },
    setContent: (state, action: PayloadAction<{ path: string; content: string }>) => {
      const { path, content } = action.payload;
      const item = findItemByPath(state.files, path.split('/'));

      if (item && item.type === 'file') {
        item.content = content;
    
        const cleanInitialContent = item.initialContent
          ? item.initialContent.replace(/\n/g, '').trim()
          : '';
        const cleanContent = content.replace(/\n/g, '').trim();
    
        item.changed = cleanInitialContent !== cleanContent;
      }
    },
    setChanged: (state, action: PayloadAction<{ path: string; changed: boolean }>) => {
      const { path, changed } = action.payload;
      const item = findItemByPath(state.files, path.split('/'));
      if (item) {
        item.changed = changed;
      }
    },
    setName: (state, action: PayloadAction<{ path: string; newName: string }>) => {
      const { path, newName } = action.payload;
      const item = findItemByPath(state.files, path.split('/'));

      if (item) {
        item.changed = item.name !== newName;
        item.name = newName;
    
        const pathParts = path.split('/');
        pathParts[pathParts.length - 1] = newName;
        item.path = pathParts.join('/');
    
        const updateChildPaths = (children: ProjectFile[], level: number) => {
          children.forEach(child => {
            const childPathParts = child.path.split('/');
            childPathParts[childPathParts.length - level - 1] = newName;
            child.path = childPathParts.join('/');
    
            if (child.type === 'folder' && child.children) {
              updateChildPaths(child.children, level + 1);
            }
          });
        };
    
        if (item.type === 'folder' && item.children) {
          updateChildPaths(item.children, 1);
        }
      }
    },
    setOpenFilePath: (state, action: PayloadAction<string>) => {
      state.openFilePath = action.payload;
    },
    setFiles: (state, action: PayloadAction<ProjectFile[]>) => {
      state.files = action.payload;
    },
    reorderItem: (state, action: PayloadAction<{ path: string, oldIndex: number, newIndex: number }>) => {
      const { path, newIndex, oldIndex } = action.payload;

      const parent = findFolderByPath(state.files, path.split('/').slice(0,-1));

      if (parent && parent.children) {
        const item = findItemByPath(state.files, path.split('/'));

        if (item && newIndex !== oldIndex && newIndex >= 0 && newIndex < parent.children.length) {
          let newChildren = [...parent.children];
          newChildren.splice(oldIndex, 1);
          newChildren.splice(newIndex, 0, item);
          parent.children = newChildren;
        }
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      const rawPath = action.payload.startsWith('/') ? action.payload.slice(1) : action.payload;
      const path = rawPath.split('/');

      const parentPath = path.slice(0,-1);
      const parent = parentPath.length ? findFolderByPath(state.files, parentPath) : { children: state.files } as ProjectFile;

      if (parent && parent.type === 'folder' && parent.children) {
        parent.children = parent.children.filter((item) => item.path !== action.payload);
      } else if (parent && !parent.type) {
        state.files = state.files.filter((item) => item.path !== action.payload);
      }
    },
    saveItem: (state, action: PayloadAction<{ path: string }>) => {
      const { path } = action.payload;
      const item = findItemByPath(state.files, path.split('/'));

      if (item && item.content) {
        item.initialContent = item.content;
        item.changed = false;
      }
    },
    addItem: (
      state,
      action: PayloadAction<{ path: string; item: ProjectFile }>
    ) => {
      const rawPath = action.payload.path.startsWith('/') ? action.payload.path.slice(1) : action.payload.path;
      const path = rawPath.split('/');

      const parentPath = path.slice(0,-1);
      const parent = parentPath.length ? findFolderByPath(state.files, parentPath) : { children: state.files } as ProjectFile;

      // const { item } = action.payload;
      const item = { ...action.payload.item, path: path.join('/') };

      if (parent && parent.type && parent.children) {
        parent.children.push({ ...item, children: item.children || (item.type === 'folder' ? [] : undefined) });
      } else if (!parent || !parent.type) {
        // Add at root of file tree.
        state.files.push({ ...item, children: item.children || (item.type === 'folder' ? [] : undefined) });
      }
    },
  },
});

export const { setContent, setChanged, setOpenFilePath, deleteItem, addItem, saveItem, reorderItem, setName, setFiles } = projectSlice.actions;

export const selectFiles = (state: RootState) => state.project.files;
export const selectOpenFilePath = (state: RootState) => state.project.openFilePath;
export const getProjectSettings = (state: RootState) => state.project.settings;

// getContent selector function
export const getContent = (state: RootState, path: string) => {
  const item = findItemByPath(state.project.files, path.split('/'));
  return item && item.content;
};

export default projectSlice.reducer;