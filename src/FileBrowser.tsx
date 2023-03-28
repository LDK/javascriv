// FileBrowser.tsx
import React, { useState } from 'react';
import { Box, Collapse, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { BrowserItem, selectFiles, selectOpenFilePath, setOpenFilePath } from './filesSlice';
import { useDispatch, useSelector } from 'react-redux';
import Sticky from 'react-stickynode';

interface FileBrowserProps {
  onDocumentClick: (documentContent: string | null, changed: boolean) => void;
}

type FileBrowserItemProps = {
  item: BrowserItem;
  level?: number;
  path?: string[];
  onDocumentClick: (documentContent: string | null, changed: boolean) => void;
};

const FileBrowserItem: React.FC<FileBrowserItemProps> = ({
  item,
  level = 0,
  path = [],
  onDocumentClick,
}) => {
  const [open, setOpen] = useState(false);

  const openFilePath = useSelector(selectOpenFilePath);

  const dispatch = useDispatch();

  const isFolder = item.type === 'folder';

  const fullPath = [...path, item.name].join('/');

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
    return <InsertDriveFileIcon />;
  };

  return (
    <>
      <ListItem button onClick={handleItemClick} style={{ paddingLeft: level * 16 }}>
        <ListItemIcon>{getIcon()}</ListItemIcon>
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{
            style: { color: item.changed ? 'red' : 'inherit' },
          }}
        />
      </ListItem>

      {isFolder && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child: BrowserItem, index: number) => (
              <FileBrowserItem key={index} item={child} level={level + 1} path={[...path, item.name]} onDocumentClick={onDocumentClick} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const FileBrowser: React.FC<FileBrowserProps> = ({ onDocumentClick }) => {
  const items = useSelector(selectFiles);

  const handleDocumentClick = (documentContent: string | null, changed: boolean) => {
    onDocumentClick(documentContent, changed);
  };

  const renderItem = (item: BrowserItem, path: string[] = []) => {
    return (
      <FileBrowserItem
        key={item.name}
        onDocumentClick={(documentContent, changed) => handleDocumentClick(documentContent, changed)}
        {...{ item, path }}
      />
    );
  };

  return (
    <Sticky top={64} innerZ={1}>
      <Box>
        {items.map((item) => renderItem(item))}
      </Box>
    </Sticky>
  );
};

export default FileBrowser;
