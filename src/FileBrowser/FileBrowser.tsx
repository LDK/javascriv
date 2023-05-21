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
import { NewBrowserItem, SetOpenFunction } from './useBrowserDialog';
import DuplicateDialog from './DuplicateDialog';
import DeleteDialog from './DeleteDialog';
import MoveFileDialog from './MoveFileDialog';

interface FileBrowserProps {
  onDocumentClick: (item: BrowserItem) => void;
}

export const ROOTFOLDER = '<root>';

export const findParentFolder = (path: string[]) => {
  const filteredPath = path.filter(p => p !== '');
  const parentPath = filteredPath.slice(0, -1);

  const openFolder = parentPath.length ? `/${parentPath.join('/')}` : ROOTFOLDER;

  return openFolder;
}

export type FileType = 'file' | 'folder' | null;
export type SubType = 'document' | 'image' | 'other' | null;

const FileBrowser: React.FC<FileBrowserProps> = ({ onDocumentClick }) => {
  const items = useSelector(selectFiles);
  const openFilePath = useSelector(selectOpenFilePath);
  const theme = useTheme();

  const openItem = findItemByPath(items, openFilePath?.split('/') || []);
  let initialFolder = openFilePath;

  if (openItem && openItem.type !== 'folder') {
    initialFolder = findParentFolder(openItem.path.split('/'));
  }

  const [openFolder, setOpenFolder] = useState<string | null>(initialFolder);
  const [duplicating, setDuplicating] = useState<BrowserItem | false>(false);
  const [deleting, setDeleting] = useState<BrowserItem | false>(false);
  const [moving, setMoving] = useState<BrowserItem | false>(false);

  const [adding, setAdding] = useState<NewBrowserItem | false>(false);

  const handleFolderClick = (folder: BrowserItem) => {
    setOpenFolder(folder.path);
  }

  const renderItem = (item: BrowserItem, path: string[] = [], idx:number) => {
    return (
      <FileBrowserItem
        index={idx}
        count={items.length}
        key={item.name}
        onFolderClick={handleFolderClick}
        setMoving={setMoving as SetOpenFunction}
        setDeleting={setDeleting as SetOpenFunction}
        setDuplicating={setDuplicating as SetOpenFunction}
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
              onClick={() => setAdding({ type: 'file', subType: 'document' })}
            >
              <NoteAddIcon />
            </IconButton>
  
            <IconButton
              aria-label="Add a New Folder"
              component="label"
              onClick={() => setAdding({ type: 'folder', subType: null })}
            >
              <CreateNewFolderIcon />
            </IconButton>
          </Box>
          {items.map((item, idx) => renderItem(item, [], idx))}
        </Box>
      </Sticky>

      <NewFileDialog {...{ 
        open: Boolean(adding), 
        fileType: adding ? adding.type : null,
        subType: adding ? adding.subType as SubType : null,
        setOpen: setAdding, 
        openFilePath: openFilePath as string,
        onClose: () => setAdding(false),
        setOpenFolder, openFolder }}
      />

      {Boolean(duplicating) &&
        <DuplicateDialog {...{ 
          open: Boolean(duplicating), 
          setOpen: setDuplicating as SetOpenFunction, 
          onClose: () => setDuplicating(false),
          sourceFilePath: duplicating ? duplicating.path : '',
          fileType: duplicating ? duplicating.type : 'file',
          subType: duplicating ? (duplicating.subType || null) : null,
          setOpenFolder, openFolder }}
        />
      }

      {Boolean(deleting) &&
        <DeleteDialog {...{ 
          open: Boolean(deleting), 
          setOpen: setDeleting as SetOpenFunction, 
          onClose: () => setDeleting(false),
          sourceFilePath: deleting ? deleting.path : '',
          setOpenFolder, openFolder }}
        />
      }

      {Boolean(moving) &&
        <MoveFileDialog {...{
          open: Boolean(moving),
          setOpen: setMoving as SetOpenFunction,
          onClose: () => setMoving(false),
          sourceFilePath: moving ? moving.path : '',
          setOpenFolder, openFolder }}
        />
      }

    </Box>
  );
};

export default FileBrowser;