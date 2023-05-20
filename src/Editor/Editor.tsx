// Editor/Editor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as MyEditor, EditorEvent } from 'tinymce';
import { Box, useTheme } from '@mui/material';
import { familyFonts, getFontsCSS } from './EditorFonts';

interface TinyEditorProps {
  content: string | null;
  initial: string | null;
  onEditorChange: (content: string) => void;
}

const apiKey = process.env.REACT_APP_TINYMCE_API_KEY;

const TinyEditor: React.FC<TinyEditorProps> = ({ content, initial, onEditorChange }) => {
  const editorRef = useRef<MyEditor | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const height="500";
  const theme = useTheme();

  const handleInit = (_event: any, editor: MyEditor) => {
    editorRef.current = editor;

    if (fullScreen) {
      editor.execCommand('mceFullScreen');
    }

    editor.addShortcut('esc', 'Writer Mode', () => {
      editor.execCommand('mceFullScreen');
    });

    // when esc key is pressed..
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setFullScreen(false);
        editor.plugins.fullscreen.isFullscreen(false);
      }
    });
  };
    
  const handleEditorChange = (content: string, editor: MyEditor) => {
    if (onEditorChange) {
      onEditorChange(content);
    }
  };
  
  const handleExecCommand = (event:EditorEvent<any>, editor: MyEditor) => {
    // const isFullscreen = editor.execCommand('mceFullScreen', false);

    if (event.command) {
      switch (event.command) {
        case 'mceFullScreen':
          setFullScreen(editor.plugins.fullscreen.isFullscreen());
          editor.plugins.fullscreen.isFullscreen(true);
          break;
        default:
          break;
      }
    }
  }
  
  return (
    <Box width="100%" sx={{ backgroundColor: 'rgba(10, 25, 60)', minHeight: 'calc(100vh - 40px)' }} mt={0}>
      <Editor
        key={`editor-${theme.palette.mode}-${fullScreen ? 'full' : 'normal'}`}
        apiKey={apiKey}
        initialValue={initial || ''}
        onInit={handleInit}
        init={{
          height: height,
          menubar: false,
          resize: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'anchor',
            'searchreplace', 'visualblocks', 'code', 'fullscreen', 'pagebreak',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'writermode'
          ],
          toolbar: [
            'undo redo | styles | editimage | bold italic backcolor | removeformat | help',
            'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table',
            'fontfamily fontsize | code | pagebreak | writermode',
          ],
          skin: theme.palette.mode === 'dark' ? 'oxide-dark' : undefined,
          font_family_formats: familyFonts,
          content_style: `@import url('${getFontsCSS()}');`,
          onchange: "myCustomOnChangeHandler",
          external_plugins: {
            'writermode': '/tinymce/plugins/writermodePlugin.js',
          },
          content_css: fullScreen ? '/tinymce/css/writemode.css' : (theme.palette.mode === 'dark' ? 'dark' : undefined),
          font_size_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
        }}
        onEditorChange={handleEditorChange}
        onExecCommand={(event, editor) => handleExecCommand(event, editor)}
      />
    </Box>
  );
};

export default TinyEditor;
