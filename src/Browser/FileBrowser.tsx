// Browser/FileBrowser.tsx
import React from 'react';
import { Box, useTheme } from '@mui/material';
import { BrowserItem, selectFiles, selectOpenFilePath } from '../redux/filesSlice';
import { useSelector } from 'react-redux';
import Sticky from 'react-stickynode';
import FileBrowserItem from './FileBrowserItem';

interface FileBrowserProps {
  onDocumentClick: (documentContent: string | null, changed: boolean) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ onDocumentClick }) => {
  const items = useSelector(selectFiles);
  const openFilePath = useSelector(selectOpenFilePath);
  const theme = useTheme();

  const handleDocumentClick = (documentContent: string | null, changed: boolean) => {
    onDocumentClick(documentContent, changed);
  };

  const renderItem = (item: BrowserItem, path: string[] = []) => {
    return (
      <FileBrowserItem
        key={item.name}
        onDocumentClick={(documentContent, changed) => handleDocumentClick(documentContent, changed)}
        {...{ item, path, openFilePath }}
      />
    );
  };

  return (
    <Box width="100%" sx={{ backgroundColor: theme.palette.secondary[theme.palette.mode], minHeight: 'calc(100vh - 40px)' }}>
      <Sticky top={64} innerZ={1}>
        <Box overflow={"scroll"} maxHeight="calc(100% - 40px)" sx={{ color: 'rgba(232, 232, 232, .9)' }}>
          {items.map((item) => renderItem(item))}
        </Box>
      </Sticky>
    </Box>
  );
};

export default FileBrowser;
