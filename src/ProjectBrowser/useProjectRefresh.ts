import { useState, useRef, useCallback, KeyboardEventHandler, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectProjectTitle, setProjectTitle } from "../redux/projectSlice";

export default function useProjectRefresh() {
  const [renaming, setRenaming] = useState(false);
  const title = useSelector(selectProjectTitle);

  const renameInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handleProjectRename = () => {
    // Call your renaming function here
    const newName = renameInputRef.current?.value || title;
    dispatch(setProjectTitle(newName));
    setRenaming(false);
  };

  const handleRenameBlur = () => {
    handleProjectRename();
  };
  const handleEditClick = useCallback(() => {
    setRenaming(true);
  }, [setRenaming]);

  const handleRenameKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      handleProjectRename();
    }
  };

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renaming]);

  return { renaming, title, renameInputRef, handleEditClick, handleRenameBlur, handleRenameKeyPress };
}

