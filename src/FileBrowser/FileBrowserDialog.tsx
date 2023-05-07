import { Dialog, DialogContent, DialogContentText, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem, BrowserItem, selectFiles } from "../redux/filesSlice";
import { FileType, findParentFolder, ROOTFOLDER, SubType } from "./FileBrowser";

type NewFileDialogProps = {
  open: boolean;
  onClose: () => void;
  openFilePath: string;
  openFolder: string;
  fileType: "file" | "folder" | null;
  subType: "document" | "image" | null;
  setOpen : React.Dispatch<React.SetStateAction<{ fileType: FileType; subType: SubType; } | false>>;
  setOpenFolder: React.Dispatch<React.SetStateAction<string>>;
}

// Recursively iterate through all items and add folders to the itemsFolders array, 
// as well as their children folders and grand-children folders, etc.
// Handles any level of folder depth, recursively.

const getFolders = (itemPool: BrowserItem[], level?: number) => {
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
}
  
const NewFileDialog = ({ 
    open, setOpen, onClose, fileType, subType, openFilePath, openFolder, setOpenFolder 
  }: NewFileDialogProps) => {

  const items = useSelector(selectFiles);
  const itemName = fileType === 'file' ? subType as string : 'folder';
  const [newItemName, setNewItemName] = useState('');
  const [parentFolder, setParentFolder] = useState(openFolder);

  const dispatch = useDispatch();
  
  const handleCreateNewFile = () => {
    const newPath = `${parentFolder}/${newItemName}`.replace('<root>','');
    
    const newItem:BrowserItem = {
      name: newItemName,
      path: newPath,
      type: fileType as 'file' | 'folder',
      subType: subType || undefined,
    };

    dispatch(addItem({path: newPath, item: newItem}));

    setOpen(false);
  };

  useEffect(() => {
    const newFolder = findParentFolder(items, openFilePath?.split('/') || []);
    if (newFolder !== openFolder) {
      setOpenFolder(newFolder);
      if (!open) {
        setParentFolder(newFolder);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFilePath]);

  useEffect(() => {
    if (!open) {
      setParentFolder(openFolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFolder]);
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText>
          Please enter the name of the new {itemName} and select the parent folder.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="parent-folder-label">Parent Folder</InputLabel>
          <Select
            labelId="parent-folder-label"
            value={parentFolder}
            defaultValue={openFolder}
            label="Parent Folder"
            onChange={(e) => setParentFolder(e.target.value)}
          >
            <MenuItem value={ROOTFOLDER}>
              <em>{ROOTFOLDER}</em>
            </MenuItem>

            {getFolders(items).map((item) => {
              if (item.type === 'folder') {
                return (
                  <MenuItem key={item.path} value={item.path}>{item.name}</MenuItem>
                );
              }
              return null;
            })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateNewFile}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewFileDialog;