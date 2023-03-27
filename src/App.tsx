// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { convertToRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Box, Button, Container, Grid } from '@mui/material';
import draftToHtml from 'draftjs-to-html';
import axios from 'axios';
import MyEditor from './MyEditor';
import Header from './Header';
import FileBrowser from './FileBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, BrowserItem, findItemByPath, saveItem, selectFiles, selectOpenFilePath, setContent, setOpenFilePath } from './filesSlice';

const App: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
  const [hasContentChanged, setHasContentChanged] = useState(false);
  const [initialContent, setInitialContent] = useState<string | null>(null);

  const editor = useRef<Editor>(null);

  const focusEditor = () => {
    if (editor.current) {
      editor.current.focusEditor();
    }
  }

  useEffect(() => {
    focusEditor();
  }, []);

  const openFilePath = useSelector(selectOpenFilePath);
  const dispatch = useDispatch();
  const items = useSelector(selectFiles);
  
  const handleSubmit = async () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const htmlContent = draftToHtml(rawContent);
  
    if (!openFilePath) {
      const newName = getUniqueNewDocumentName(items);
      const newItem:BrowserItem = { name: newName, type: "file", subType: "document", content: htmlContent };

      // Adjust the payload structure to match the expected format for addItem action
      dispatch(addItem({ path: "", item: newItem }));
      dispatch(setOpenFilePath(newName));
      handleFileSave(newItem);
    } else {
      dispatch(setContent({ path: openFilePath, content: htmlContent }));
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing) {
        handleFileSave({ ...existing, content: htmlContent });
      }
    }
  
    try {
      await axios.post('/dummy-api-endpoint', {
        content: htmlContent,
      });
      console.log('Content posted successfully:', htmlContent);
    } catch (error) {
      console.error('Error posting content:', error);
    }
  };

  const getUniqueNewDocumentName = (items: BrowserItem[]) => {
    let index = 0;
    let newName = "New Document";
  
    while (items.some((item) => item.name === `${newName}${index > 0 ? ` ${index}` : ''}`)) {
      index++;
    }
  
    return `${newName}${index > 0 ? ` ${index}` : ''}`;
  };

  const handleFileSave = (item:BrowserItem) => {
    setInitialContent(item.content || null);
    setHasContentChanged(false);
    if (openFilePath) {
      dispatch(saveItem({ path: openFilePath }));
    }
  }

  const handleEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  
    const currentContentState = newEditorState.getCurrentContent();
    const currentHtmlContent = draftToHtml(convertToRaw(currentContentState));
  
    const cleanInitialContent = initialContent?.replace(/[\n\r]+/g, '').trim() || '';
    const cleanCurrentHtmlContent = currentHtmlContent.replace(/[\n\r]+/g, '').trim();
  
    if (initialContent === null) {
      setInitialContent(currentHtmlContent);
    } else if (cleanInitialContent !== cleanCurrentHtmlContent) {
      setHasContentChanged(true);
      // Dispatch setContent action whenever the editor content changes
      if (openFilePath) {
        dispatch(setContent({ path: openFilePath, content: currentHtmlContent }));
      }
    } else {
      setHasContentChanged(false);

      if (openFilePath) {
        dispatch(setContent({ path: openFilePath, content: currentHtmlContent }));
      }
    }
  
  };
  
  return (
    <>
      <Header />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FileBrowser
                editorState={editorState}
                onDocumentClick={(newEditorState: EditorState, documentContent: string | null, changed: boolean) => {
                  setEditorState(newEditorState);
                  console.log('doc content', documentContent);
                  setInitialContent(documentContent);
                  setHasContentChanged(changed);
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box onClick={focusEditor} px={4}>
                <MyEditor
                  editor={editor}
                  editorState={editorState}
                  onChange={handleEditorStateChange}
                />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!hasContentChanged}
                >
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default App;
