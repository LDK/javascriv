import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectOpenFilePath, BrowserItem, saveItem, addItem, findItemByPath, selectFiles, setContent, setOpenFilePath } from "../redux/filesSlice";

interface FileBrowserProps {
  contentCallback?: (content:string) => void;
};

const useFileBrowser = ({ contentCallback }:FileBrowserProps) => {
  const [, setHasContentChanged] = useState(false);
  const openFilePath = useSelector(selectOpenFilePath);
  const dispatch = useDispatch();

  const browserItems = useSelector(selectFiles);

  const getUniqueNewDocumentName = (items: BrowserItem[]) => {
    let index = 0;
    let newName = 'New Document';

    // eslint-disable-next-line
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

  const documentClick = (documentContent: string | null, changed: boolean) => {
    if (contentCallback) {
      contentCallback(documentContent || '');
    }
    setHasContentChanged(changed);
  };

  const saveFile = (htmlContent:string) => {
    if (!openFilePath) {
      const newName = getUniqueNewDocumentName(browserItems);
      const newItem: BrowserItem = { name: newName, type: 'file', subType: 'document', content: htmlContent, path: `/${newName}` };

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
  return { saveFile, getUniqueNewDocumentName, handleFileSave, documentClick, setHasContentChanged, openFilePath, items: browserItems };
}

export default useFileBrowser;