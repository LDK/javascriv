// Import/ImportOptions.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme, TextField } from '@mui/material';
import { ProjectFile } from "../Project/ProjectTypes";

import { FileTreeItem } from '../FileTree/FileTree';
import ImportTree from './ImportTree';

export interface ImportOptionsProps {
  optionsOpen: boolean;
  onClose: () => void;
  title?: string;
  onReady: (options: ImportingOptions) => void;
  files: ProjectFile[];
}

export interface ImportingOptions {
  items: ProjectFile[];
  title: string;
}

const ImportOptions: React.FC<ImportOptionsProps> = ({ optionsOpen, onClose, title: initTitle, onReady, files: items }) => {
  const [importingItems, setImportingItems] = useState<ProjectFile[]>(items);
  const [title, setTitle] = useState<string>(initTitle || '');

  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const handleClose = () => {
    onClose();
  };

  const handleReady = () => {
    const options: ImportingOptions = {
      items: importingItems,
      title
    };

    if (onReady) {
      onReady(options);
    }
  };

  const handleCheck = (updatedItems: FileTreeItem[]) => {
    const filterIncludedItems = (items: FileTreeItem[]): ProjectFile[] => {
      return items.flatMap((item) => {
        if (item.included) {
          const newItem: ProjectFile = { ...item, children: item.children ? filterIncludedItems(item.children) : undefined };
          return [newItem];
        }
        return [];
      });
    };
  
    const newItems = filterIncludedItems(updatedItems);

    setImportingItems(newItems);
  };

  useEffect(() => {
    setImportingItems(items);
  }, [items]);

  return (
    <Dialog open={optionsOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Import Options</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <ImportTree items={items} onCheck={handleCheck} />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt:0 }}>
        <Button onClick={handleClose} color="error" variant={dark ? 'outlined' : 'contained'} sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button onClick={handleReady} color="success" variant={dark ? 'contained' : 'contained'} sx={{ fontWeight: 700 }}>
          Ready
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportOptions;