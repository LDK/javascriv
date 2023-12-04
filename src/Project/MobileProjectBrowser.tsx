// MobileProjectBrowser.tsx
import React, { useEffect } from 'react';
import { Dialog } from '@mui/material';
import { ProjectFile } from "../Project/ProjectTypes";

import { useSelector } from 'react-redux';
import { selectOpenFilePath } from '../redux/projectSlice';

export interface MobileProjectBrowserProps {
  open: boolean;
  onClose: () => void;
  mobileBrowser: JSX.Element;
}

export interface ImportingOptions {
  items: ProjectFile[];
  title: string;
}

const MobileProjectBrowser: React.FC<MobileProjectBrowserProps> = ({ mobileBrowser, open, onClose }) => {
  const openFilePath = useSelector(selectOpenFilePath);
  
  useEffect(() => {
    onClose();
  },[openFilePath, onClose]);

  return (
    <Dialog {...{ open, onClose }} fullWidth PaperProps={{ sx: { margin: 0, width: '100%', height: '100%', maxHeight: '100%' } }}>
      {mobileBrowser}
    </Dialog>
  );
};

export default MobileProjectBrowser;