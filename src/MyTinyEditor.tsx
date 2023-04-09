// MyTinyEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyEditor } from 'tinymce';
import { Box, useTheme } from '@mui/material';

interface MyTinyEditorProps {
  content: string | null;
  initial: string | null;
  onEditorChange: (content: string) => void;
}

const apiKey = 'nvkvn50rzrstv9udik5clmd6ee0f8y92o1glls8m9tr7hp1l';

const MyTinyEditor: React.FC<MyTinyEditorProps> = ({ content, initial, onEditorChange }) => {
  const editorRef = useRef<TinyEditor | null>(null);
  const height="500";
  const theme = useTheme();

  const handleEditorChange = (content: string) => {
    if (onEditorChange) {
      onEditorChange(content);
    }
  };
  
  useEffect(() => {
    if (editorRef.current && content !== null) {
      const bookmark = editorRef.current.selection.getBookmark(2, true);
      editorRef.current.undoManager.transact(() => {
        if (editorRef.current) {
          editorRef.current.setContent(content);
        }
      });
      editorRef.current.selection.moveToBookmark(bookmark);
    }
  }, [content]);
    
  return (
    <Box width="100%" sx={{ backgroundColor: 'rgba(10, 25, 60)', minHeight: 'calc(100vh - 40px)' }} mt={0}>
      <Editor
        key={`editor-${theme.palette.mode}`}
        apiKey={apiKey}
        initialValue={initial || ''}
        init={{
          height: height,
          menubar: false,
          resize: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'anchor',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount',
          ],
          toolbar: [
            'undo redo | styles | image | bold italic backcolor | removeformat | help',
            'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table'
          ],
          skin: theme.palette.mode === 'dark' ? 'oxide-dark' : undefined, // Use the custom skin located in the public/skin folder
          content_css: theme.palette.mode === 'dark' ? 'dark' : undefined, // Use the custom content CSS located in the public/skin folder
        }}
        onEditorChange={handleEditorChange}
      />
    </Box>
  );
};

export default MyTinyEditor;
