// MyEditor.tsx

import { AtomicBlockUtils, EditorState } from 'draft-js';
import React from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { BrowserItem } from './filesSlice';

type MyEditorProps = {
  editor: React.RefObject<Editor>;
  editorState: EditorState;
  onChange: (state: EditorState) => void;
};


export function insertImage(
  editorState: EditorState,
  src: string,
  targetBlockKey?: string,
  targetOffset?: number
) {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

  let newEditorState;

  if (targetBlockKey !== undefined && targetOffset !== undefined) {
    const selectionState = editorState.getSelection().merge({
      anchorKey: targetBlockKey,
      anchorOffset: targetOffset,
      focusKey: targetBlockKey,
      focusOffset: targetOffset,
    });

    newEditorState = EditorState.forceSelection(editorState, selectionState);
  } else {
    newEditorState = editorState;
  }

  return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
}

const MyEditor = ({ editor, editorState, onChange }:MyEditorProps) => {
  return (
    <Editor
      ref={editor}
      editorState={editorState}
      onEditorStateChange={onChange}
      toolbar={{
        options: [
          'inline',
          'blockType',
          'fontSize',
          'list',
          'textAlign',
          'colorPicker',
          'link',
          'emoji',
          'image',
          'remove',
          'history',
        ],
      }}
    />
  )
};

export default MyEditor;