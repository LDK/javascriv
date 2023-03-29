// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Grid } from '@mui/material';
import Header from './Header';
import FileBrowser from './FileBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, BrowserItem, findItemByPath, saveItem, selectFiles, selectOpenFilePath, setContent, setOpenFilePath } from './filesSlice';
import MyTinyEditor from './MyTinyEditor';
import printToPdf from './pdfCompiler';

const App: React.FC = () => {
  const [hasContentChanged, setHasContentChanged] = useState(false);
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [initial, setInitial] = useState<string | null | false>(null);

  const openFilePath = useSelector(selectOpenFilePath);
  const dispatch = useDispatch();
  const items = useSelector(selectFiles);

  useEffect(() => {
    console.log('openFilePath', openFilePath);
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      console.log('existing', existing);
      if (existing && existing.content) {
        console.log('set content', existing.content);
        setEditorContent(existing.content);
        if (initial === null) {
          console.log('set initial', existing.content);
          setInitial(existing.content as string);
        }
      } else {
        if (initial === null) {
          setInitial(false);
        }
      }
    }
  }, [items, openFilePath]);

  const handleSubmit = async () => {
    const htmlContent = editorContent || '';

    if (!openFilePath) {
      const newName = getUniqueNewDocumentName(items);
      const newItem: BrowserItem = { name: newName, type: 'file', subType: 'document', content: htmlContent };

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
    <>
      <Header />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="xl" sx={{ px: "0 !important" }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} lg={3} xl={2} sx={{ backgroundColor: 'rgba(10, 25, 60)', minHeight: 'calc(100vh - 40px)' }}>
              <Box>
                <FileBrowser
                  onDocumentClick={(documentContent: string | null, changed: boolean) => {
                    setEditorContent(documentContent);
                    setHasContentChanged(changed);
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              <Box px={0} pr={{ xs: 0, lg: 3 }}>
                <MyTinyEditor content={editorContent} initial={initial || ''} onEditorChange={handleEditorChange} />

                <Box pt={2} className="actions">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!hasContentChanged}
                  >
                    Submit
                  </Button>

                  <Button onClick={() => printToPdf(items)} color="primary" variant="contained">
                    Print
                  </Button>
                </Box>

              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default App;
