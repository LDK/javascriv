// Import/MobileProjectBrowser.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme, TextField } from '@mui/material';
import { ProjectFile } from "../Project/ProjectTypes";

import useFileTree, { FileTreeItem, FileTreeView } from '../FileTree/FileTree';
import ImportTree from './ImportTree';
import { useSelector } from 'react-redux';
import { selectFiles, selectOpenFilePath } from '../redux/projectSlice';

export interface MobileProjectBrowserProps {
  open: boolean;
  onClose: () => void;
  files: ProjectFile[];
  mobileBrowser: JSX.Element;
}

export interface ImportingOptions {
  items: ProjectFile[];
  title: string;
}

const MobileProjectBrowser: React.FC<MobileProjectBrowserProps> = ({ mobileBrowser, open, onClose, files: items }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const openFilePath = useSelector(selectOpenFilePath);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    handleClose();
  },[openFilePath]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Project Files</DialogTitle>

      <DialogContent>
        {mobileBrowser}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt:0 }}>
        <Button onClick={handleClose} color="error" variant={dark ? 'outlined' : 'contained'} sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MobileProjectBrowser;