import { useSelector, useDispatch } from "react-redux";
import { selectFiles, BrowserItem, addItem, findItemByPath, deleteItem } from "../redux/filesSlice";

export type NewBrowserItem = Omit<BrowserItem, 'path' | 'name'>;
export type SetOpenFunction = React.Dispatch<React.SetStateAction<BrowserItem | NewBrowserItem | false>>;

// Recursively iterate through all items and add folders to the itemsFolders array, 
// as well as their children folders and grand-children folders, etc.
// Handles any level of folder depth, recursively.

export const getFolders = (itemPool: BrowserItem[], level?: number) => {
  let itemsFolders:BrowserItem[] = [];

  const lvl = level || 1;

  for (let item of itemPool) {
    if (item.type === 'folder') {
      const prefix = lvl > 0 ? "—".repeat(lvl) : '';
      itemsFolders.push({...item, name: `${prefix}${item.name}`});
      if (item.children) {
        itemsFolders = [...itemsFolders, ...getFolders(item.children, lvl + 1)];
      }
    }
  }

  return itemsFolders;
};

export default function useBrowserDialog(openFilePath: string, setOpen: SetOpenFunction) {
  const items = useSelector(selectFiles);
  // const item = items.find((item) => item.path === openFilePath);

  const item = findItemByPath(items, openFilePath.split('/'));

  const { type: fileType, subType } = item || { fileType: null, subType: null };
  const itemType = fileType === 'file' ? subType as string : 'folder';

  const dispatch = useDispatch();

  const handleCreateNewFile = (parentFolder: string | null, itemName: string, content?: string, children?: BrowserItem[]) => {
    const newPath = `${parentFolder}/${itemName}`.replace('<root>','');

    const newItem:BrowserItem = {
      name: itemName,
      path: newPath,
      type: fileType as 'file' | 'folder',
      content: content || undefined,
      subType: subType || undefined,
      children: children || undefined
    };

    dispatch(addItem({path: newPath, item: newItem}));

    setOpen(false);
  };

  const handleDeleteFile = (path: string) => {
    console.log('deleting', path);
    dispatch(deleteItem(path));

    setOpen(false);
  };

  return {
    items, itemType, handleCreateNewFile, handleDeleteFile
  };
}
