// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, ThemeProvider } from '@mui/material';
import Header from './Header';
import FileBrowser from './FileBrowser/FileBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserItem, findItemByPath, setChanged, setContent, setOpenFilePath } from './redux/filesSlice';
import TinyEditor from './Editor/Editor';
import { darkTheme, lightTheme } from './theme/theme';
import { RootState } from './redux/store';
import useProject from './Project/useProject';
import useFileBrowser from './FileBrowser/useFileBrowser';
import usePublishing from './Publish/usePublishing';
import { Editor } from 'tinymce';
import NewProjectDialog from './FileBrowser/NewProjectDialog';


const App: React.FC = () => {  
  const [editorContent, setEditorContent] = useState<string | null | false>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [initial, setInitial] = useState<string | null>(null);
  const [lastRevertTs, setLastRevertTs] = useState<number>(0);

  const dispatch = useDispatch();

  const handleDocumentClick = (item: BrowserItem) => {
    if (openFilePath && editor) {
      dispatch(setContent({path: openFilePath, content: editor.getContent()}));
    }
    setInitial(item.initialContent as string);
    dispatch(setOpenFilePath(item.path));
  }

  const { saveFile, documentClick, setHasContentChanged, hasContentChanged, openFilePath, items } = useFileBrowser({ contentCallback: handleDocumentClick });
  const { PublishButton, PublishOptions } = usePublishing();

  const handleEditorChange = (content: string) => {
    setHasContentChanged(content !== initial);
  };

  const { ImportButton, ImportOptions, ExportDialog, setExportDialogOpen, handleUpload, setNewProjectOpen, newProjectOpen } = useProject(handleEditorChange);

  const activeTheme = useSelector((state:RootState) => state.theme.active);

  useEffect(() => {
    dispatch(setChanged({path: openFilePath || '', changed: hasContentChanged}));
  }, [hasContentChanged, openFilePath, dispatch]);

  useEffect(() => {
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing && existing.path) {
        // setEditorContent(existing.content);
        setEditorContent(existing.content as string);
        setInitial(existing.initialContent as string);
      } else {
        if (editorContent === null) {
          setEditorContent(false);
        }
      }
    } else if (!openFilePath) {
      setEditorContent(null);
      setInitial(null);
    }
    // eslint-disable-next-line
  }, [openFilePath]);

  useEffect(() => {
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing && existing.content) {
        setEditorContent(existing.content as string)
      }
    }
    // eslint-disable-next-line
  }, [activeTheme]);

  const handleSave = async () => {
    if (!editor) return;

    const content = editor.getContent() || '';
    saveFile(content);
    setInitial(content);
  };

  const handleRevert = async () => {
    setLastRevertTs(Date.now());
    setEditorContent(initial);
  };

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
                <TinyEditor {...{ setEditor, handleEditorChange }} lastRevert={lastRevertTs} content={editorContent || ''} />

                <Box pt={2} className="actions" position="absolute" bottom="2rem" width="100%" right="0" textAlign="right">
                  <Button variant="contained" color="primary" onClick={handleSave} disabled={!hasContentChanged}>
                    Save
                  </Button>

                  <Button variant="contained" color="primary" onClick={handleRevert} disabled={!hasContentChanged}>
                    Revert
                  </Button>


                  <Button onClick={
                    (e) => {
                      e.currentTarget.blur(); // Remove focus from the button
                      setExportDialogOpen(true) }
                    }
                    color="primary" variant="contained"
                  >
                    Export...
                  </Button>

                  <input type="file" accept=".zip, .json"
                    ref={setFileInputRef}
                    onChange={handleUpload}
                    style={{ display: 'none' }} />

                  <ImportButton callback={() => { fileInputRef?.click();}} />
                  <ImportOptions />

                  <Button onClick={
                    (e) => {
                      e.currentTarget.blur(); // Remove focus from the button
                      setNewProjectOpen(true) }
                    }
                    color="primary" variant="contained"
                  >
                    New Project
                  </Button>

                  <PublishButton />
                  <PublishOptions />
                </Box>

              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
 
    <ExportDialog />
    <NewProjectDialog open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </ThemeProvider>
  );
};

export default App;
