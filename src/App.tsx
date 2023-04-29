// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, ThemeProvider } from '@mui/material';
import Header from './Header';
import FileBrowser from './FileBrowser/FileBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserItem, findItemByPath, setContent, setFiles, setOpenFilePath } from './redux/filesSlice';
import TinyEditor from './Editor/Editor';
import { darkTheme, lightTheme } from './theme/theme';
import { RootState } from './redux/store';
import { handleTest } from './Convert/scrivener/scrivener';
import useProject from './Project/useProject';
import useFileBrowser from './FileBrowser/useFileBrowser';
import usePublishing from './Publish/usePublishing';

const App: React.FC = () => {  
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [initial, setInitial] = useState<string | null | false>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const dispatch = useDispatch();

  const { saveFile, documentClick, setHasContentChanged, openFilePath, items } = useFileBrowser({ contentCallback: setEditorContent });
  const { PublishButton, PublishOptions } = usePublishing();

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

  const { ExportDialog, setExportDialogOpen, importProject } = useProject(handleEditorChange);

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

  const handleSubmit = async () => {
    saveFile(editorContent || '');
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
                <TinyEditor content={editorContent} initial={initial || ''} onEditorChange={handleEditorChange} />

                <Box pt={2} className="actions" position="absolute" bottom="2rem" width="100%" right="0" textAlign="right">
                  <Button variant="contained" color="primary" onClick={() => { handleTest((tree:BrowserItem[]) => {
                    if (tree && tree[0]) {
                      dispatch(setFiles(tree));
                      dispatch(setOpenFilePath(tree[0].path));
                    }
                  }) }}>
                    Scrivener Import Test
                  </Button>

                  <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                  </Button>


                  <Button onClick={
                    (e) => {
                      e.currentTarget.blur(); // Remove focus from the button
                      setExportDialogOpen(true) }
                    }
                    color="primary" variant="contained"
                  >
                    Export Project
                  </Button>

                  <input type="file" accept=".json" 
                    ref={setFileInputRef}
                    onChange={importProject}
                    style={{ display: 'none' }} />

                  <Button
                    onClick={() => { fileInputRef?.click();}}
                    color="primary"
                    variant="contained"
                  >
                    Import Project
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
    </ThemeProvider>
  );
};

export default App;
