// FileBrowser.tsx
import React, { useState } from 'react';
import { Box, Collapse, List, ListItem, ListItemIcon, ListItemText, PaletteMode, SxProps, useTheme } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { BrowserItem, selectFiles, selectOpenFilePath, setOpenFilePath } from './filesSlice';
import { useDispatch, useSelector } from 'react-redux';
import Sticky from 'react-stickynode';
import { ExtendedPalette } from './theme';

interface FileBrowserProps {
  onDocumentClick: (documentContent: string | null, changed: boolean) => void;
}

type FileBrowserItemProps = {
  item: BrowserItem;
  level?: number;
  path?: string[];
  openFilePath: string | null;
  onDocumentClick: (documentContent: string | null, changed: boolean) => void;
};

const FileBrowserItem: React.FC<FileBrowserItemProps> = ({
  item,
  level = 0,
  path = [],
  onDocumentClick,
  openFilePath
}) => {
  
  const isFolder = item.type === 'folder';

  const fullPath = [...path, item.name].join('/');

  const [open, setOpen] = useState<boolean>(Boolean(isFolder && openFilePath && openFilePath.startsWith(fullPath)));

  const dispatch = useDispatch();

  const theme = useTheme();
  const palette = theme.palette as ExtendedPalette;


  const getOpenCloseIcon = () => {
    if (isFolder) {
      const elProps:({ width: string; sx: SxProps; }) = { width: "100%", sx: { maxWidth: '100%'} };
      const el =  open ? <ExpandLessIcon {...elProps} /> : <ExpandMoreIcon {...elProps} />;
      return (
        <Box width="1.25rem" top={'7px'} position="relative" display="inline-block" color={palette.secondary.contrastText}>
          { el }
        </Box>
      );
    }
    return null;
  };

  const handleItemClick = () => {
    if (isFolder) {
      setOpen(!open);
    } else if (item.subType === 'document') {
      if (fullPath !== openFilePath) {
        dispatch(setOpenFilePath(fullPath));
  
        if (item.content && onDocumentClick)  {
          onDocumentClick(item.content || null, item.changed || false);
        }
      }
    } else if (item.subType === 'image') {
      console.log('Image clicked:', fullPath, item);
      if (item.content) {
        onDocumentClick(null, true);
      }
    }
  };  

  const getIcon = () => {
    if (isFolder) return <FolderIcon />;
    if (item.subType === 'document') return <DescriptionIcon />;
    if (item.subType === 'image') return <ImageIcon />;
    return <InsertDriveFileIcon color="inherit" />;
  };

  const opposite:PaletteMode = palette.mode === 'light' ? 'dark' : 'light';

  const isOpenPath = fullPath === openFilePath;

  return (
    <>
      <ListItem
        button
        onClick={handleItemClick}
        style={{
          color: palette.secondary.contrastText,
          paddingLeft: level * 16,
          backgroundColor: isOpenPath ? palette.secondary[opposite] : 'inherit',
        }}
      >

        <ListItemIcon sx={{ color: palette.secondary.contrastText, pl: 3 }}>{getIcon()}</ListItemIcon>

        <ListItemText
          primary={
            <>
              {item.name}
              {getOpenCloseIcon()}
            </>
          }
          primaryTypographyProps={{
            style: { color: item.changed ? palette.warning[isOpenPath ? 'main' : opposite] : 'inherit' },
          }}
        />
      </ListItem>

      {isFolder && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child: BrowserItem, index: number) => (
              <FileBrowserItem key={index} item={child} openFilePath={openFilePath} level={level + 1} path={[...path, item.name]} onDocumentClick={onDocumentClick} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

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
