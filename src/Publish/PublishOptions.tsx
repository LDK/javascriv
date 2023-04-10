// Publish/PublishOptions.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectFiles, BrowserItem, findItemByPath } from '../redux/filesSlice';
import PublishTree, { PublishItem } from './PublishTree';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SelectChangeEvent } from '@mui/material/Select';
import { PublishingOptions } from './pdfCompiler';

export interface PublishOptionsProps {
  optionsOpen: boolean;
  onClose: () => void;
  onReady: (options: any) => void; // You should define a proper type for 'options' based on the data required by the publishToPdf function.
}

const PublishOptions: React.FC<PublishOptionsProps> = ({ optionsOpen, onClose, onReady }) => {
  const items = useSelector(selectFiles);
  const [pageBreaks, setPageBreaks] = useState<string>('Nowhere');
  const [publishedItems, setPublishedItems] = useState<BrowserItem[]>(items);

  const handleClose = () => {
    onClose();
  };

  const handleReady = () => {
    const options: PublishingOptions = {
      items: publishedItems,
      pageBreaks,
    };
    onReady(options);
  };
  
  const handlePageBreaksChange = (event: SelectChangeEvent) => {
    setPageBreaks(event.target.value as string);
  };

  const handleReorder = (draggedPath: string, targetPath: string) => {
    setPublishedItems((prevPublishedItems) => {
      // First, remove the dragged item from the current tree
      const updatedItems = removeItemByPath(prevPublishedItems, draggedPath);
  
      console.log('dragged path', draggedPath);
      console.log('updated items', updatedItems);
      const newPath = targetPath + '/' + draggedPath.split('/').pop();
      console.log('new path', newPath);

      // Then, add the dragged item to the target location
      const newItems = addItemByPath(updatedItems, newPath);
      console.log('new items', newItems);
      return newItems;
    });
  };

  const addItemByPath = (tree: BrowserItem[], path: string): BrowserItem[] => {
    const rawPath = path.indexOf('/') === 0 ? path.slice(1) : path;
    const targetParentPath = path.split('/').slice(0, -1).join('/');

    return tree.map((item) => {
      if (item.type === 'folder' && item.children) {
        if (item.path === targetParentPath) {
          const newItem = findItemByPath(items, rawPath.split('/'));

          if (newItem) {
            return { ...item, children: [...item.children, newItem] };
          }
        } else {
          return { ...item, children: addItemByPath(item.children, path) };
        }
      }
      return item;
    });
  };  
  
  const removeItemByPath = (tree: BrowserItem[], path: string): BrowserItem[] => {
    return tree.reduce((acc: BrowserItem[], item: BrowserItem) => {
      if (item.path === path) {
        return acc;
      }
  
      if (item.type === 'folder' && item.children) {
        const itemPathSegments = item.path.split('/');
        const pathSegments = path.split('/');
        if (itemPathSegments[itemPathSegments.length - 1] === pathSegments[itemPathSegments.length - 1]) {
          return [...acc, { ...item, children: removeItemByPath(item.children, path) }];
        }
      }
  
      return [...acc, item];
    }, []);
  };  

  const handleCheck = (updatedItems: PublishItem[]) => {
    const filterIncludedItems = (items: PublishItem[]): BrowserItem[] => {
      return items.flatMap((item) => {
        if (item.included) {
          const newItem: BrowserItem = { ...item, children: item.children ? filterIncludedItems(item.children) : undefined };
          return [newItem];
        }
        return [];
      });
    };
  
    const newItems = filterIncludedItems(updatedItems);
    console.log('set pub', newItems);
    setPublishedItems(newItems);
  };

  useEffect(() => {
    console.log('published items', publishedItems);
  }, [publishedItems]);

  return (
    <Dialog open={optionsOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Publish Options</DialogTitle>
      <DialogContent>
        <DndProvider backend={HTML5Backend}>
          <PublishTree items={items} onReorder={handleReorder} onCheck={handleCheck} />
        </DndProvider>
        <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
          <InputLabel htmlFor="page-breaks-select">Insert Page Breaks...</InputLabel>
          <Select
            value={pageBreaks}
            onChange={handlePageBreaksChange}
            label="Insert Page Breaks..."
            inputProps={{ id: 'page-breaks-select' }}
          >
            <MenuItem value="Nowhere">Nowhere</MenuItem>
            <MenuItem value="Between Documents">Between Documents</MenuItem>
            <MenuItem value="Between Folders">Between Folders</MenuItem>
            <MenuItem value="Between Folders and Between Documents">Between Folders and Between Documents</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleReady} color="primary">
          Ready
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishOptions;