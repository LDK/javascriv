// Browser/FileBrowser.tsx
import React, { useState } from 'react';
import { Box, IconButton, useTheme, PaletteColor, PaletteMode } from '@mui/material';
import { BrowserItem, findItemByPath, selectFiles, selectOpenFilePath } from '../redux/filesSlice';
import { useSelector } from 'react-redux';
import Sticky from 'react-stickynode';
import FileBrowserItem from './FileBrowserItem';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import NewFileDialog from './NewFileDialog';

interface FileBrowserProps {
  onDocumentClick: (documentContent: string | null, changed: boolean) => void;
}

export const ROOTFOLDER = '<root>';

export const findParentFolder = (items: BrowserItem[], path: string[]) => {
  const openFile = findItemByPath(items, path);
  let openFolder = '';

  if (openFile && openFile.type !== 'folder') {
    openFolder = openFile.path.split('/').slice(0, -1).join('/');
  }

  if (!openFolder.length) {
    openFolder = ROOTFOLDER;
  }

  return openFolder;
}

export type FileType = 'file' | 'folder' | null;
export type SubType = 'document' | 'image' | 'other' | null;

const FileBrowser: React.FC<FileBrowserProps> = ({ onDocumentClick }) => {
  const items = useSelector(selectFiles);
  const openFilePath = useSelector(selectOpenFilePath);
  const theme = useTheme();

  const [openFolder, setOpenFolder] = useState<string | null>(findParentFolder(items, openFilePath?.split('/') || []));
  const [adding, setAdding] = useState<{ fileType: FileType, subType: SubType } | false>(false);

  const handleFolderClick = (folder: BrowserItem) => {
    setOpenFolder(folder.path);
  }

  const renderItem = (item: BrowserItem, path: string[] = []) => {
    return (
      <FileBrowserItem
        key={item.name}
        onFolderClick={handleFolderClick}
        {...{ setOpenFolder, onDocumentClick, openFolder, item, path, openFilePath } }
      />
    );
  };

  const paletteRGBA = (color: PaletteColor, opacity: number, mode: PaletteMode) => {
    return `rgba(${color[mode].replace('rgb(', '').replace(')', '')}, ${opacity})`;
  }

  return (
    <Box
      width="100%"
      sx={{
        backgroundColor: theme.palette.secondary[theme.palette.mode],
        minHeight: "calc(100vh - 40px)",
        maxHeight: "calc(100% - 40px)",
        overflowY: "scroll",
      }}
    >
      <Sticky top={64} innerZ={1}>
        <Box
          overflow={{ overflowY: "scroll" }}
          maxHeight="calc(100vh - 60px)"
          pb={8}
          sx={{ color: theme.palette.text.primary }}
          height="100vh"
          position="relative"
        >
          <Box
            position="fixed"
            bottom="0"
            zIndex={100}
            px={2}
            py={1}
            width="100%"
            textAlign="right"
            display="block"
            sx={{ 
              backgroundColor: paletteRGBA(theme.palette.primary, .5, theme.palette.mode),
              // blur anything that scrolls behind this element
              backdropFilter: 'blur(3px)',
            }}
          >
            <IconButton
              aria-label="Add a New File"
              component="label"
              onClick={() => setAdding({ fileType: 'file', subType: 'document' })}
            >
              <NoteAddIcon />
            </IconButton>
  
            <IconButton
              aria-label="Add a New Folder"
              component="label"
              onClick={() => setAdding({ fileType: 'folder', subType: null })}
            >
              <CreateNewFolderIcon />
            </IconButton>
          </Box>
          {items.map((item) => renderItem(item))}
        </Box>
      </Sticky>

      <NewFileDialog {...{ 
        open: Boolean(adding), 
        fileType: adding ? adding.fileType : null,
        subType: adding ? adding.subType : null,
        setOpen: setAdding, 
        openFilePath: openFilePath as string,
        onClose: () => setAdding(false),
        setOpenFolder, openFolder }}
      />

    </Box>
  );
};

export default FileBrowser;