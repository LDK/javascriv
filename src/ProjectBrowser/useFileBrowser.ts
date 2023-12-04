import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ProjectFile } from "../Project/ProjectTypes";
import { selectOpenFilePath, saveItem, addItem, findItemByPath, selectFiles, setContent, setOpenFilePath } from "../redux/projectSlice";

interface FileBrowserProps {
  contentCallback?: (item: ProjectFile) => void;
};

const useFileBrowser = ({ contentCallback }:FileBrowserProps) => {
  const [hasContentChanged, setHasContentChanged] = useState(false);
  const openFilePath = useSelector(selectOpenFilePath);
  const dispatch = useDispatch();

  const browserItems = useSelector(selectFiles);
  
  const getUniqueNewDocumentName = (items: ProjectFile[]) => {
    let index = 0;
    let newName = 'New Document';

    // eslint-disable-next-line
    while (items.some((item) => item.name === `${newName}${index > 0 ? ` ${index}` : ''}`)) {
      index++;
    }

    return `${newName}${index > 0 ? ` ${index}` : ''}`;
  };

  const handleFileSave = (item: ProjectFile) => {
    // setHasContentChanged(false);
    if (openFilePath) {
      dispatch(saveItem({ path: openFilePath }));
    }
  };

  const documentClick = (item:ProjectFile) => {
    if (contentCallback) {
      contentCallback(item);
    }
    setHasContentChanged(item.changed || false);
  };

  const saveFile = async (htmlContent:string) => {
    if (!openFilePath) {
      const newName = getUniqueNewDocumentName(browserItems);
      const newItem: ProjectFile = { name: newName, type: 'file', subType: 'document', content: htmlContent, path: `/${newName}` };

      dispatch(addItem({ path: '', item: newItem }));
      dispatch(setOpenFilePath(newName));
      handleFileSave(newItem);
    } else {
      const payload = { path: openFilePath, content: htmlContent };
      dispatch(setContent(payload));
      const existing = findItemByPath(browserItems, openFilePath.split('/'));
      if (existing) {
        handleFileSave({ ...existing, content: htmlContent });
      }
    }
  };

  return { saveFile, getUniqueNewDocumentName, handleFileSave, documentClick, hasContentChanged, setHasContentChanged, openFilePath, items: browserItems };
}

export default useFileBrowser;