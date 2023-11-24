// Editor/Editor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as MyEditor, EditorEvent } from 'tinymce';
import { Box, useTheme } from '@mui/material';
import { EditorFont, familyFonts, getFontsCSS } from './EditorFonts';
import { ProjectFile } from '../Project/ProjectTypes';

export interface TinyEditorProps {
  content: string | null;
  setEditor: (editor: MyEditor) => void;
  handleEditorChange: (content: string) => void;
  lastRevert: number;
  defaultFont?: EditorFont;
  defaultFontSize?: number;
  lockedFilePaths?: string[];
  openFilePath: string | null;
  items: ProjectFile[];
}

const apiKey = process.env.REACT_APP_TINYMCE_API_KEY;

const TinyEditor: React.FC<TinyEditorProps> = ({ lockedFilePaths, items, openFilePath, content, setEditor, handleEditorChange, lastRevert, defaultFont, defaultFontSize }) => {
  const editorRef = useRef<MyEditor | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const height="calc(100vh - 64px)";
  const theme = useTheme();

  const handleInit = (_event: any, editor: MyEditor) => {
    editorRef.current = editor;
    setEditor(editor);

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
  
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setContent(content || '');
    }
  }, [content, lastRevert]);

  const themeMode = theme.palette.mode;

  return (
    <Box width="100%" sx={{ backgroundColor: themeMode === 'light' ? theme.palette.info.light : theme.palette.info.dark, minHeight: 'calc(100vh - 40px)' }} mt={0}>
      <Editor
        key={`editor-${themeMode}-${fullScreen ? 'full' : 'normal'}`}
        apiKey={apiKey}
        initialValue={content || ''}
        onInit={handleInit}
        disabled={Boolean(openFilePath && lockedFilePaths?.includes(openFilePath))}
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
          content_style: `
            @import url('${getFontsCSS()}');
            body {
              font-family: ${defaultFont?.value || 'Roboto'}, sans-serif;
              font-size: ${defaultFontSize || 14}pt;
            }
          `,
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
