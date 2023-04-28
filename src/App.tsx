// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, ThemeProvider, Dialog, DialogTitle, DialogContent, DialogContentText, TextField } from '@mui/material';
import Header from './Header';
import FileBrowser from './Browser/FileBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, BrowserItem, FileTreeState, findItemByPath, saveItem, selectFiles, selectOpenFilePath, setContent, setFiles, setOpenFilePath } from './redux/filesSlice';
import TinyEditor from './Editor/Editor';
import { darkTheme, lightTheme } from './theme/theme';
import { RootState, store } from './redux/store';
import PublishOptions from './Publish/PublishOptions';

const App: React.FC = () => {
  const [, setHasContentChanged] = useState(false);
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [initial, setInitial] = useState<string | null | false>(null);

  const [publishOptionsOpen, setPublishOptionsOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const openFilePath = useSelector(selectOpenFilePath);
  const dispatch = useDispatch();
  const items = useSelector(selectFiles);

  const activeTheme = useSelector((state:RootState) => state.theme.active);

  useEffect(() => {
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing && existing.content) {
        setEditorContent(existing.content);
        setInitial(existing.content as string);
      } else {
        if (initial === null) {
          setInitial(false);
        }
      }
    }
    // eslint-disable-next-line
  }, [openFilePath]);

  useEffect(() => {
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing && existing.content) {
        setInitial(existing.content as string)
      }
    }
    // eslint-disable-next-line
  }, [activeTheme])

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
  
          if (typeof content === 'string') {
            const importedProject:FileTreeState = JSON.parse(content);

            if (importedProject) {
              if (importedProject.openFilePath && importedProject.files) {
                dispatch(setOpenFilePath(importedProject.openFilePath));
                dispatch(setFiles(importedProject.files));

                const newItem = findItemByPath(importedProject.files, importedProject.openFilePath.split('/'));

                if (newItem && newItem.content) {
                  documentClick(newItem.content, false);
                  handleEditorChange(newItem.content);
                }
              }
            }
            // Process the imported project data here
          }
        } catch (error) {
          console.error('Error importing project:', error);
        }
      };

      
      reader.readAsText(file);
    }
  
    // Reset the file input value so the same file can be imported again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  function handleExportProject(fileName:string) {
    // Add the .json extension if it's not already present
    if (!fileName.endsWith('.json')) {
      fileName += '.json';
    }
  
    // Use getState to grab `files` and `openFilePath` from files state
    const projectData = store.getState().files;
  
    // Convert the project data object into a JSON-formatted string
    const jsonString = JSON.stringify(projectData, null, 2);
  
    // Create a new Blob object containing the JSON string, with the MIME type set to 'application/json'
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a new URL for the Blob
    const url = URL.createObjectURL(blob);
  
    // Create and configure a temporary anchor element to initiate the download
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
  
    // Add the anchor to the document, initiate the download, and remove the anchor
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  const handleSubmit = async () => {
    const htmlContent = editorContent || '';

    if (!openFilePath) {
      const newName = getUniqueNewDocumentName(items);
      const newItem: BrowserItem = { name: newName, type: 'file', subType: 'document', content: htmlContent, path: `/${newName}` };

      dispatch(addItem({ path: '', item: newItem }));
      dispatch(setOpenFilePath(newName));
      handleFileSave(newItem);
    } else {
      const payload = { path: openFilePath, content: htmlContent };
      dispatch(setContent(payload));
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing) {
        handleFileSave({ ...existing, content: htmlContent });
      }
    }
  };

  const getUniqueNewDocumentName = (items: BrowserItem[]) => {
    let index = 0;
    let newName = 'New Document';

    // eslint-disable-next-line
    while (items.some((item) => item.name === `${newName}${index > 0 ? ` ${index}` : ''}`)) {
      index++;
    }

    return `${newName}${index > 0 ? ` ${index}` : ''}`;
  };

  const handleFileSave = (item: BrowserItem) => {
    setHasContentChanged(false);
    if (openFilePath) {
      dispatch(saveItem({ path: openFilePath }));
    }
  };

  const handleEditorChange = (content: string) => {
    if (editorContent !== null) {
      const cleanInitialContent = editorContent?.replace(/[\n\r]+/g, '').trim() || '';
      const cleanCurrentHtmlContent = content.replace(/[\n\r]+/g, '').trim();

      setHasContentChanged(Boolean(cleanInitialContent !== cleanCurrentHtmlContent));

      if (openFilePath) {
        dispatch(setContent({ path: openFilePath, content }));
      }
    }
    
    setEditorContent(content);
  };

  const documentClick = (documentContent: string | null, changed: boolean) => {
    console.log('document click', documentContent, changed);
    setEditorContent(documentContent);
    setHasContentChanged(changed);
  }

  return (
    <ThemeProvider theme={activeTheme === 'light' ? lightTheme : darkTheme}>
      <Header />
      <CssBaseline />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="xl" sx={{ px: "0 !important" }}>
          <Grid container spacing={0}>
            <Grid item xs={12} md={4} lg={3} xl={2} px={0} mx={0}>
                <FileBrowser
                  onDocumentClick={documentClick}
                />
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              <Box px={0}>
                <TinyEditor content={editorContent} initial={initial || ''} onEditorChange={handleEditorChange} />

                <Box pt={2} className="actions" position="absolute" bottom="2rem" width="100%" right="0" textAlign="right">
                  <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                  </Button>

                  <Button onClick={() => { setPublishOptionsOpen(true) }} color="primary" variant="contained">
                    Publish
                  </Button>

                  <Button onClick={
                    (e) => {
                      e.currentTarget.blur(); // Remove focus from the button
                      setExportDialogOpen(true) }
                    }
                    color="primary"
                    variant="contained"
                  >
                    Export Current Project
                  </Button>

                  <input
                    type="file"
                    accept=".json"
                    ref={setFileInputRef}
                    onChange={handleImportProject}
                    style={{ display: 'none' }}
                  />

                  <Button
                    onClick={() => {
                      fileInputRef?.click();
                    }}
                    color="primary"
                    variant="contained"
                  >
                    Import Project
                  </Button>

                  <PublishOptions optionsOpen={publishOptionsOpen} onClose={() => { setPublishOptionsOpen(false) }} />
                </Box>

              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
 
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Current Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the file name for the exported project (the extension will be hard-coded to .json):
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="projectFileName"
            label="File Name"
            type="text"
            fullWidth
            variant="standard"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleExportProject((e.target as HTMLInputElement).value);
                setExportDialogOpen(false);
              }
            }}
          />
        </DialogContent>
        <Box p={2} display="flex" justifyContent="flex-end">
          <Button onClick={() => setExportDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              const input = document.getElementById('projectFileName') as HTMLInputElement;
              handleExportProject(input.value);
            }}
            color="primary"
          >
            Export
          </Button>
        </Box>
      </Dialog>

    </ThemeProvider>
  );
};

export default App;
