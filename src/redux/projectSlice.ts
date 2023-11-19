// redux/projectSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FontOptions, ProjectFile, ProjectSettings, ProjectState, PublishOptions } from '../Project/ProjectTypes';
import { RootState } from './store';
import introCopy from '../editorIntro';
import { AppUser } from './userSlice';

const defaultSettings:ProjectSettings = {
  pageBreaks: 'Nowhere',
  pageNumberPosition: 'Top Left',
  displayDocumentTitles: true,
  includeToC: false,
  font: { name: 'Roboto', value: 'Roboto' },
  fontSize: 12,
};

const defaultFiles:ProjectFile[] = [
  {
    'type': 'file',
    'subType': 'document',
    'name': 'Document 1',
    'path': 'Document 1',
    'content': introCopy,
  }
];

const initialState:ProjectState = {
  files: defaultFiles,
  openFilePath: 'Document 1',
  settings: defaultSettings,
  title: 'New Project',
  collaborators: [],
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

export const findAllChangedFiles = (items: ProjectFile[]): ProjectFile[] => {
  let changedFiles: ProjectFile[] = [];

  items.forEach((item) => {
    if (item.type === 'file' && item.changed) {
      changedFiles.push(item);
    } else if (item.type === 'folder' && item.children) {
      changedFiles = changedFiles.concat(findAllChangedFiles(item.children));
    }
  });

  return changedFiles;
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjectTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setProjectCreator: (state, action: PayloadAction<number>) => {
      state.creator = action.payload;
    },
    setProjectSettings: (state, action: PayloadAction<ProjectSettings>) => {
      let newSettings:ProjectSettings = { ...defaultSettings };

      for (const key in newSettings) {
        const value = action.payload[key];
        if (value !== undefined) {
          newSettings[key] = value;
        } else {
          newSettings[key] = defaultSettings[key as keyof typeof defaultSettings];
        }
      }

      state.settings = newSettings;
    },
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
    setProjectId: (state, action: PayloadAction<number | undefined>) => {
      state.id = action.payload;
    },
    setCollaborators: (state, action: PayloadAction<AppUser[]>) => {
      state.collaborators = action.payload;
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
      const files = action.payload;

      files.forEach((file) => {
        file.initialContent = file.content;
      });

      state.files = files;
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
        // item.changed = false;
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
        // Add to existing children array if there is one.
        parent.children.push({ ...item, children: item.children || (item.type === 'folder' ? [] : undefined) });
      } else if (parent && parent.type && parent.type === 'folder') {
        // Create children array if this is the first child added.
        parent.children = [item];
      } else if (!parent || !parent.type || parent.type !== 'folder') {
        // Add at root of file tree.
        state.files.push({ ...item, children: item.children || (item.type === 'folder' ? [] : undefined) });
      }
    },
    resetProject: (state) => {
      state.settings = defaultSettings;
      state.files = defaultFiles;
      state.openFilePath = 'Document 1';
      state.title = 'New Project';
      state.id = undefined;
    },
    setPublishOptions: (state, action: PayloadAction<PublishOptions>) => {
      state.settings.pageBreaks = action.payload.pageBreaks;
      state.settings.pageNumberPosition = action.payload.pageNumberPosition;
      state.settings.includeToC = action.payload.includeToC;
      state.settings.displayDocumentTitles = action.payload.displayDocumentTitles;
    },
    setFontOptions: (state, action: PayloadAction<FontOptions>) => {
      state.settings.font = action.payload.font;
      state.settings.fontSize = action.payload.fontSize;
    },
  },
});

export const { setProjectId, setProjectCreator, setContent, setChanged, 
    setOpenFilePath, deleteItem, addItem, saveItem, reorderItem, setName,
    setFiles, saveSetting, setProjectTitle, setProjectSettings, resetProject,
    setPublishOptions, setFontOptions, setCollaborators } = projectSlice.actions;

export const selectFiles = (state: RootState) => state.project.files;
export const selectOpenFilePath = (state: RootState) => state.project.openFilePath;
export const selectProjectTitle = (state: RootState) => state.project.title || 'Untitled Project';
export const getProjectSettings = (state: RootState) => state.project.settings;
export const getCurrentProject = (state: RootState) => state.project;

// getContent selector function
export const getContent = (state: RootState, path: string) => {
  const item = findItemByPath(state.project.files, path.split('/'));
  return item && item.content;
};

export default projectSlice.reducer;