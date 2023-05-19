// redux/filesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export type BrowserItem = {
  type: 'folder' | 'file';
  name: string;
  path: string;
  children?: BrowserItem[];
  subType?: 'document' | 'image' | 'other' | null;
  attachment?: string;
  content?: string;
  initialContent?: string;
  changed?: boolean;
};

export type FileTreeState = {
  files: BrowserItem[];
  openFilePath: string | null;
};

const initialItems: BrowserItem[] = [
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

const initialState:FileTreeState = {
  files: initialItems,
  openFilePath: null,
};

export const findItemByPath = (items: BrowserItem[], path: string[]): BrowserItem | undefined => {
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

export const findFolderByPath = (items: BrowserItem[], path: string[]): BrowserItem | undefined => {
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

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
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
    setName: (state, action: PayloadAction<{ path: string; newName: string }>) => {
      const { path, newName } = action.payload;
      const item = findItemByPath(state.files, path.split('/'));

      if (item) {
        item.changed = item.name !== newName;
        item.name = newName;
    
        const pathParts = path.split('/');
        pathParts[pathParts.length - 1] = newName;
        item.path = pathParts.join('/');
    
        const updateChildPaths = (children: BrowserItem[], level: number) => {
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
    setFiles: (state, action: PayloadAction<BrowserItem[]>) => {
      state.files = action.payload;
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      const rawPath = action.payload.startsWith('/') ? action.payload.slice(1) : action.payload;
      const path = rawPath.split('/');

      const parentPath = path.slice(0,-1);
      const parent = parentPath.length ? findFolderByPath(state.files, parentPath) : { children: state.files } as BrowserItem;

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
      action: PayloadAction<{ path: string; item: Omit<BrowserItem, 'children'> }>
    ) => {
      const rawPath = action.payload.path.startsWith('/') ? action.payload.path.slice(1) : action.payload.path;
      const path = rawPath.split('/');

      const parentPath = path.slice(0,-1);
      const parent = parentPath.length ? findFolderByPath(state.files, parentPath) : { children: state.files } as BrowserItem;

      const { item } = action.payload;

      if (parent && parent.type && parent.children) {
        parent.children.push({ ...item, children: item.type === 'folder' ? [] : undefined });
      } else if (!parent || !parent.type) {
        // Add at root of file tree.
        state.files.push({ ...item, children: item.type === 'folder' ? [] : undefined });
      }
    },
  },
});

export const { setContent, setOpenFilePath, deleteItem, addItem, saveItem, setName, setFiles } = filesSlice.actions;

export const selectFiles = (state: RootState) => state.files.files;
export const selectOpenFilePath = (state: RootState) => state.files.openFilePath;

// getContent selector function
export const getContent = (state: RootState, path: string) => {
  const item = findItemByPath(state.files.files, path.split('/'));
  return item && item.content;
};

export default filesSlice.reducer;