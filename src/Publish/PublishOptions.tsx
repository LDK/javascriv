// Publish/PublishOptions.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectFiles, BrowserItem } from '../redux/filesSlice';
import PublishTree, { PublishItem } from './PublishTree';
import { SelectChangeEvent } from '@mui/material/Select';
import publishToPdf from './pdfCompiler';
import { PublishingOptions } from './publishing';

export interface PublishOptionsProps {
  optionsOpen: boolean;
  onClose: () => void;
}

const PublishOptions: React.FC<PublishOptionsProps> = ({ optionsOpen, onClose }) => {
  const items = useSelector(selectFiles);
  const [pageBreaks, setPageBreaks] = useState<string>('Nowhere');
  const [publishedItems, setPublishedItems] = useState<BrowserItem[]>(items);
  const [pageNumberPosition, setPageNumberPosition] = useState<string>('Top Left');

  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const handleClose = () => {
    onClose();
  };

  const handleReady = () => {
    const options: PublishingOptions = {
      items: publishedItems,
      pageBreaks,
      pageNumbers: pageNumberPosition
    };
    publishToPdf(options);
  };
  
  const handlePageBreaksChange = (event: SelectChangeEvent) => {
    setPageBreaks(event.target.value as string);
  };

  const handlePageNumberPositionChange = (event: SelectChangeEvent) => {
    setPageNumberPosition(event.target.value as string);
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

        {/* Add this FormControl for Page Numbers */}
        <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
          <InputLabel htmlFor="page-numbers-select">Page Numbers</InputLabel>
          <Select
            value={pageNumberPosition}
            onChange={handlePageNumberPositionChange}
            label="Page Numbers"
            inputProps={{ id: 'page-numbers-select' }}
          >
            <MenuItem value="Top Left">Top Left</MenuItem>
            <MenuItem value="Top Middle">Top Middle</MenuItem>
            <MenuItem value="Top Right">Top Right</MenuItem>
            <MenuItem value="Bottom Left">Bottom Left</MenuItem>
            <MenuItem value="Bottom Middle">Bottom Middle</MenuItem>
            <MenuItem value="Bottom Right">Bottom Right</MenuItem>
          </Select>
        </FormControl>
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

export default PublishOptions;