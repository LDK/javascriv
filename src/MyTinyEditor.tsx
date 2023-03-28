import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyEditor } from 'tinymce';

interface MyTinyEditorProps {
  content: string | null;
  onEditorChange: (content: string) => void;
}

const apiKey = 'nvkvn50rzrstv9udik5clmd6ee0f8y92o1glls8m9tr7hp1l';

const MyTinyEditor: React.FC<MyTinyEditorProps> = ({ content, onEditorChange }) => {
  const editorRef = useRef<TinyEditor | null>(null);

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
    <Editor
      apiKey={apiKey}
      initialValue="<p>This is the initial content of the editor</p>"
      init={{
        height: 500,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'anchor',
          'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount',
        ],
        toolbar:
          'undo redo | styles | image | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help',
      }}
      onEditorChange={handleEditorChange}
      onInit={(evt, editor) => (editorRef.current = editor)}
    />
  );
};

export default MyTinyEditor;
