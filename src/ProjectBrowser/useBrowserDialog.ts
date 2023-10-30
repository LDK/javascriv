import { useSelector, useDispatch } from "react-redux";
import { ProjectFile, ProjectListing } from "../Project/ProjectTypes";
import { selectFiles, addItem, findItemByPath, deleteItem, setOpenFilePath } from "../redux/projectSlice";
import { RootState } from "../redux/store";

export type NewBrowserItem = Omit<ProjectFile, 'path' | 'name'>;
export type SetOpenFunction = React.Dispatch<React.SetStateAction<ProjectFile | ProjectListing | NewBrowserItem | false>>;

// Recursively iterate through all items and add folders to the itemsFolders array, 
// as well as their children folders and grand-children folders, etc.
// Handles any level of folder depth, recursively.

export const getFolders = (itemPool: ProjectFile[], level?: number) => {
  let itemsFolders:ProjectFile[] = [];

  const lvl = level || 1;

  for (let item of itemPool) {
    if (item.type === 'folder') {
      const prefix = lvl > 0 ? "—".repeat(lvl) : '';

      let newItem = {...item};
      newItem.path = item.path.startsWith('/') ? item.path.slice(1) : item.path;
      newItem.name = `${prefix}${item.name}`;
      
      itemsFolders.push(newItem);

      if (item.children) {
        itemsFolders = [...itemsFolders, ...getFolders(item.children, lvl + 1)];
      }
    }
  }

  return itemsFolders;
};

export default function useBrowserDialog(sourceFilePath: string, setOpen: SetOpenFunction) {
  const items = useSelector(selectFiles);
  const openFilePath = useSelector((state:RootState) => state.project.openFilePath);

  const item = findItemByPath(items, sourceFilePath.split('/'));

  const { type: fileType, subType } = item || { fileType: null, subType: null };
  const itemType = fileType === 'file' ? subType as string : 'folder';

  const dispatch = useDispatch();

  const handleCreateNewFile = (parentFolder: string | null, itemName: string, content?: string, children?: ProjectFile[], id?: number) => {
    const newPath = `${parentFolder}/${itemName}`.replace('<root>/','');

    const newItem:ProjectFile = {
      name: itemName,
      path: newPath,
      type: fileType as 'file' | 'folder',
      content: content || undefined,
      subType: subType || undefined,
      children: children || undefined,
      id: id
    };

    dispatch(addItem({path: newPath, item: newItem}));

    setOpen(false);
  };

  const handleDeleteFile = (path: string) => {
    dispatch(deleteItem(path));

    if (openFilePath) {
      // Both of these should remove any preceding slash
      let checkOpenPath = openFilePath.replace('<root>','');
      let checkDeletedPath = path.replace('<root>','');

      // remove preceding slash from both paths
      if (checkOpenPath[0] === '/') {
        checkOpenPath = checkOpenPath.slice(1);
      }
      if (checkDeletedPath[0] === '/') {
        checkDeletedPath = checkDeletedPath.slice(1);
      }


      if (isDescendant(checkDeletedPath, checkOpenPath)) {
        dispatch(setOpenFilePath(''));
      }
    }
    setOpen(false);
  };

  return {
    items, itemType, handleCreateNewFile, handleDeleteFile
  };
}
function isDescendant(bigPath: string, littlePath: string) {
  // returns true if littlePath is a descendant of big path
  // e.g. isDescendant('a/b/c', 'a/b/c/d/e') === true
  // e.g. isDescendant('a/b/c', 'a/b') === false
  // e.g. isDescendant('a/b/c', 'a/b/c') === false
  // e.g. isDescendant('a/b/c', 'a/b/f/g') === false

  const bigPathArray = bigPath.split('/');
  const littlePathArray = littlePath.split('/');

  if (bigPathArray.length >= littlePathArray.length) {
    return false;
  }

  for (let i = 0; i < bigPathArray.length; i++) {
    if (bigPathArray[i] !== littlePathArray[i]) {
      return false;
    }
  }
  
  return true;
}

