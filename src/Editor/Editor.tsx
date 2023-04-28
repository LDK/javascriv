// Editor/Editor.tsx
import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as MyEditor } from 'tinymce';
import { Box, useTheme } from '@mui/material';
import { familyFonts, getFontsCSS } from './EditorFonts';

interface TinyEditorProps {
  content: string | null;
  initial: string | null;
  onEditorChange: (content: string) => void;
}

const apiKey = 'nvkvn50rzrstv9udik5clmd6ee0f8y92o1glls8m9tr7hp1l';

const TinyEditor: React.FC<TinyEditorProps> = ({ content, initial, onEditorChange }) => {
  const editorRef = useRef<MyEditor | null>(null);
  const height="500";
  const theme = useTheme();

  const handleInit = (_event: any, editor: MyEditor) => {
    editorRef.current = editor;
  };
    
  const handleEditorChange = (content: string) => {
    if (onEditorChange) {
      onEditorChange(content);
    }
  };
  
  useEffect(() => {
    console.log('content useEffect', content, editorRef);
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
        onInit={handleInit}
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
            'undo redo | styles | editimage | bold italic backcolor | removeformat | help',
            'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table',
            'fontfamily fontsize | code', // Add the "code" button here
          ],
          skin: theme.palette.mode === 'dark' ? 'oxide-dark' : undefined,
          font_family_formats: familyFonts,
          content_style: `@import url('${getFontsCSS()}');`,
          content_css: theme.palette.mode === 'dark' ? 'dark' : undefined,
          font_size_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
        }}
        onEditorChange={handleEditorChange}
      />
    </Box>
  );
};

export default TinyEditor;
