import React, { useState } from 'react';
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

  const openFilePath = useSelector(selectOpenFilePath);
  const dispatch = useDispatch();
  const items = useSelector(selectFiles);

  const handleSubmit = async () => {
    const htmlContent = editorContent || '';

    if (!openFilePath) {
      const newName = getUniqueNewDocumentName(items);
      const newItem: BrowserItem = { name: newName, type: 'file', subType: 'document', content: htmlContent };

      dispatch(addItem({ path: '', item: newItem }));
      dispatch(setOpenFilePath(newName));
      handleFileSave(newItem);
    } else {
      dispatch(setContent({ path: openFilePath, content: htmlContent }));
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
    const cleanInitialContent = editorContent?.replace(/[\n\r]+/g, '').trim() || '';
    const cleanCurrentHtmlContent = content.replace(/[\n\r]+/g, '').trim();

    if (editorContent === null) {
      setEditorContent(content);
    } else if (cleanInitialContent !== cleanCurrentHtmlContent) {
      setHasContentChanged(true);
      if (openFilePath) {
        dispatch(setContent({ path: openFilePath, content }));
      }
    } else {
      setHasContentChanged(false);
      if (openFilePath) {
        dispatch(setContent({ path: openFilePath, content }));
      }
    }
  };

  return (
    <>
      <Header />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FileBrowser
                onDocumentClick={(documentContent: string | null, changed: boolean) => {
                  setEditorContent(documentContent);
                  setHasContentChanged(changed);
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box px={4}>
                <MyTinyEditor content={editorContent} onEditorChange={handleEditorChange} />

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
