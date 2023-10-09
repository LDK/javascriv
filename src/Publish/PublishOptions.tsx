// Publish/PublishOptions.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { getProjectSettings, selectFiles } from '../redux/projectSlice';
import PublishTree from './PublishTree';
import publishToPdf from './pdfCompiler';
import { Binary, PublishingOptions } from './compiling';
import { FileTreeItem } from '../FileTree/FileTree';
import { ProjectFile } from '../Project/ProjectTypes';

export interface PublishOptionsProps {
  optionsOpen: boolean;
  onClose: () => void;
}

export function usePublishingOptions () {
  const projectSettings = useSelector(getProjectSettings);

  const [pageBreaks, setPageBreaks] = useState<string>(projectSettings?.pageBreaks as string || 'Nowhere');
  const [pageNumberPosition, setPageNumberPosition] = useState<string>(projectSettings?.pageNumberPosition as string || 'Nowhere');
  const [displayDocumentTitles, setDisplayDocumentTitles] = useState<Binary>(projectSettings?.displayDocumentTitles? 1 : 0);
  const [includeToC, setIncludeToC] = useState<Binary>(projectSettings?.includeToC? 1 : 0);

  useEffect(() => {
    if (projectSettings.pageBreaks && projectSettings.pageBreaks !== pageBreaks) {
      setPageBreaks(projectSettings.pageBreaks as string);
    }

    if (projectSettings.pageNumberPosition && projectSettings.pageNumberPosition !== pageNumberPosition) {
      setPageNumberPosition(projectSettings.pageNumberPosition as string);
    }

    if (projectSettings.includeToC && projectSettings.includeToC !== includeToC) {
      setIncludeToC(projectSettings.includeToC ? 1 : 0);
    }

    if (projectSettings.displayDocumentTitles && projectSettings.displayDocumentTitles !== displayDocumentTitles) {
      setDisplayDocumentTitles(projectSettings.displayDocumentTitles ? 1 : 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSettings]);

  const PageBreaksSelect = () => (
    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
    <InputLabel htmlFor="page-breaks-select">Insert Page Breaks...</InputLabel>
    <Select
      value={pageBreaks}
      onChange={(e) => setPageBreaks(e.target.value as string)}
      label="Insert Page Breaks..."
      inputProps={{ id: 'page-breaks-select' }}
    >
      <MenuItem value="Nowhere">Nowhere</MenuItem>
      <MenuItem value="Between Documents">Between Documents</MenuItem>
      <MenuItem value="Between Folders">Between Folders</MenuItem>
      <MenuItem value="Between Folders and Between Documents">Between Folders and Between Documents</MenuItem>
    </Select>
  </FormControl>
  );
  
  const PageNumberPositionSelect = () => (
    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
      <InputLabel htmlFor="page-numbers-select">Page Numbers</InputLabel>
      <Select
        value={pageNumberPosition}
        onChange={(e) => setPageNumberPosition(e.target.value as string)}
        label="Page Numbers"
        inputProps={{ id: 'page-numbers-select' }}
      >
        <MenuItem value={0}>Nowhere</MenuItem>
        <MenuItem value="Top Left">Top Left</MenuItem>
        <MenuItem value="Top Middle">Top Middle</MenuItem>
        <MenuItem value="Top Right">Top Right</MenuItem>
        <MenuItem value="Bottom Left">Bottom Left</MenuItem>
        <MenuItem value="Bottom Middle">Bottom Middle</MenuItem>
        <MenuItem value="Bottom Right">Bottom Right</MenuItem>
      </Select>
    </FormControl>
  );
  
  const DisplayDocumentTitlesSelect = () => (
    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
      <InputLabel htmlFor="display-document-titles-select">Display Document Titles as Headers?</InputLabel>
      <Select
        value={displayDocumentTitles as Binary}
        onChange={(e) => setDisplayDocumentTitles(e.target.value as Binary)}
        label="Display Document Titles as Headers?"
        inputProps={{ id: 'display-document-titles-select' }}
      >
        <MenuItem value={1}>Yes</MenuItem>
        <MenuItem value={0}>No</MenuItem>
      </Select>
    </FormControl>
  );
  
  const IncludeToCSelect = () => (
    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
      <InputLabel htmlFor="include-toc-select">Include Table of Contents?</InputLabel>
      <Select
        value={includeToC as Binary}
        onChange={(e) => setIncludeToC(e.target.value as Binary)}
        label="Include Table of Contents"
        inputProps={{ id: 'include-toc-select' }}
      >
        <MenuItem value={1}>Yes</MenuItem>
        <MenuItem value={0}>No</MenuItem>
      </Select>
    </FormControl>
  );

  return {
    PageBreaksSelect,
    PageNumberPositionSelect,
    DisplayDocumentTitlesSelect,
    IncludeToCSelect,
    setPageBreaks,
    setPageNumberPosition,
    setDisplayDocumentTitles,
    setIncludeToC,
    pageBreaks,
    pageNumberPosition,
    displayDocumentTitles,
    includeToC
  };
}

const PublishOptions: React.FC<PublishOptionsProps> = ({ optionsOpen, onClose }) => {
  const items = useSelector(selectFiles);

  const [publishedItems, setPublishedItems] = useState<ProjectFile[]>(items);

  const { 
    PageBreaksSelect, PageNumberPositionSelect, DisplayDocumentTitlesSelect, IncludeToCSelect,
    pageBreaks, pageNumberPosition, displayDocumentTitles, includeToC
  } = usePublishingOptions();

  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const handleClose = () => {
    onClose();
  };

  const handleReady = () => {
    const options: PublishingOptions = {
      items: publishedItems,
      pageBreaks,
      displayDocumentTitles,
      includeToC,
      pageNumbers: pageNumberPosition
    };
    publishToPdf(options);
  };

  const handleCheck = (updatedItems: FileTreeItem[]) => {
    const filterIncludedItems = (items: FileTreeItem[]): ProjectFile[] => {
      return items.flatMap((item) => {
        if (item.included) {
          const newItem: ProjectFile = { ...item, children: item.children ? filterIncludedItems(item.children) : undefined };
          return [newItem];
        }
        return [];
      });
    };
  
    const newItems = filterIncludedItems(updatedItems);

    setPublishedItems(newItems);
  };

  useEffect(() => {
    setPublishedItems(items);
  }, [items]);

  return (
    <Dialog open={optionsOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Publish Options</DialogTitle>
      <DialogContent>
        <PublishTree items={items} onCheck={handleCheck} />

        <PageBreaksSelect />
        <PageNumberPositionSelect />
        <DisplayDocumentTitlesSelect />
        <IncludeToCSelect />

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