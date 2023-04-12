// Publish/PublishOptions.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectFiles, BrowserItem } from '../redux/filesSlice';
import PublishTree, { PublishItem } from './PublishTree';
import { SelectChangeEvent } from '@mui/material/Select';
import publishToPdf, { PublishingOptions } from './pdfCompiler';

export interface PublishOptionsProps {
  optionsOpen: boolean;
  onClose: () => void;
}

const PublishOptions: React.FC<PublishOptionsProps> = ({ optionsOpen, onClose }) => {
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
    publishToPdf(options);
  };
  
  const handlePageBreaksChange = (event: SelectChangeEvent) => {
    setPageBreaks(event.target.value as string);
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
    setPublishedItems(newItems);
  };

  useEffect(() => {
    console.log('published items', publishedItems);
  }, [publishedItems]);

  return (
    <Dialog open={optionsOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Publish Options</DialogTitle>
      <DialogContent>
        <PublishTree items={items} onCheck={handleCheck} />

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