// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, ThemeProvider } from '@mui/material';
import Header from './Header';
import FileBrowser from './FileBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, BrowserItem, findItemByPath, saveItem, selectFiles, selectOpenFilePath, setContent, setOpenFilePath } from './redux/filesSlice';
import MyTinyEditor from './MyTinyEditor';
import publishToPdf from './Publish/pdfCompiler';
import { darkTheme, lightTheme } from './theme/theme';
import { RootState } from './redux/store';
import PublishOptions from './Publish/PublishOptions';

const App: React.FC = () => {
  const [, setHasContentChanged] = useState(false);
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [initial, setInitial] = useState<string | null | false>(null);

  const [publishOptionsOpen, setPublishOptionsOpen] = useState(false);

  const openFilePath = useSelector(selectOpenFilePath);
  const dispatch = useDispatch();
  const items = useSelector(selectFiles);

  const activeTheme = useSelector((state:RootState) => state.theme.active);

  useEffect(() => {
    console.log('openFilePath', openFilePath);
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      console.log('existing', existing);
      if (existing && existing.content) {
        console.log('set content', existing.content);
        setEditorContent(existing.content);
        setInitial(existing.content as string);
        if (initial === null) {
          console.log('set initial', existing.content);
        }
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
    const htmlContent = editorContent || '';

    if (!openFilePath) {
      const newName = getUniqueNewDocumentName(items);
      const newItem: BrowserItem = { name: newName, type: 'file', subType: 'document', content: htmlContent, path: `/${newName}` };

      dispatch(addItem({ path: '', item: newItem }));
      dispatch(setOpenFilePath(newName));
      handleFileSave(newItem);
    } else {
      const payload = { path: openFilePath, content: htmlContent };
      console.log('payload', payload)
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

  return (
    <ThemeProvider theme={activeTheme === 'light' ? lightTheme : darkTheme}>
      <Header />
      <CssBaseline />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="xl" sx={{ px: "0 !important" }}>
          <Grid container spacing={0}>
            <Grid item xs={12} md={4} lg={3} xl={2} px={0} mx={0}>
                <FileBrowser
                  onDocumentClick={(documentContent: string | null, changed: boolean) => {
                    setEditorContent(documentContent);
                    setHasContentChanged(changed);
                  }}
                />
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              <Box px={0}>
                <MyTinyEditor content={editorContent} initial={initial || ''} onEditorChange={handleEditorChange} />

                <Box pt={2} className="actions" position="absolute" bottom="2rem" width="100%" right="0" textAlign="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    
                  >
                    Submit
                  </Button>

                  <Button onClick={() => { setPublishOptionsOpen(true) }} color="primary" variant="contained">
                    Publish
                  </Button>

                  <PublishOptions optionsOpen={publishOptionsOpen} onClose={() => { setPublishOptionsOpen(false) }} onReady={publishToPdf} />
                </Box>

              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
