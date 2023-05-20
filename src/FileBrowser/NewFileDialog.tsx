import { Dialog, DialogContent, DialogContentText, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions, Button, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem, BrowserItem, findItemByPath, selectFiles } from "../redux/filesSlice";
import { FileType, findParentFolder, ROOTFOLDER, SubType } from "./FileBrowser";
import { getFolders, SetOpenFunction } from "./useBrowserDialog";

type NewFileDialogProps = {
  open: boolean;
  onClose: () => void;
  openFilePath: string;
  openFolder: string | null;
  fileType: FileType;
  subType: SubType;
  setOpen : SetOpenFunction;
  setOpenFolder: React.Dispatch<React.SetStateAction<string | null>>;
}

const NewFileDialog = ({ 
    open, setOpen, onClose, fileType, subType, openFilePath, openFolder, setOpenFolder 
  }: NewFileDialogProps) => {

  const items = useSelector(selectFiles);
  const itemName = fileType === 'file' ? subType as string : 'folder';
  const [newItemName, setNewItemName] = useState('');
  const [parentFolder, setParentFolder] = useState<string | null>(openFolder);
  const [siblings, setSiblings] = useState<BrowserItem[]>([]);
  const [hasTwin, setHasTwin] = useState(false);
  const [disabledReason, setDisabledReason] = useState<string>('');
  const submitDisabled = !newItemName || hasTwin;

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
    if (submitDisabled) {
      if (!newItemName) {
        setDisabledReason('Please enter a name');
      } else if (hasTwin) {
        setDisabledReason(`A ${itemName} with this name already exists`);
      }
    } else {
      setDisabledReason('');
    }
  }, [hasTwin, itemName, newItemName, submitDisabled]);

  useEffect(() => {
    const newFolder = findParentFolder(openFilePath?.split('/') || []);
    if (newFolder !== openFolder) {
      setOpenFolder(newFolder);
      if (!open) {
        setParentFolder(newFolder);
      }
    }
  }, [openFilePath, open, openFolder, setOpenFolder]);

  useEffect(() => {
    if (!open) {
      setParentFolder(openFolder);
    }
  }, [open, openFolder, setParentFolder]);

  useEffect(() => {
    const parentItem = findItemByPath(items, parentFolder?.split('/') || []);

    if (parentItem) {
      setSiblings(parentItem.children || []);
    }
  }, [parentFolder, items]);

  useEffect(() => {
    if (siblings.length) {  
      const existing = siblings.find(s => s.name === newItemName);
      setHasTwin(Boolean(existing));
    } else {
      setHasTwin(false);
    }
  }, [newItemName, siblings]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please enter the name of the new {itemName} and select the parent folder.
        </DialogContentText>
        <TextField
          sx={{ my : 1 }}
          color="info"
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          required={true}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <FormControl fullWidth margin="dense" color="info">
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
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="warning" sx={{ mr: 1 }}>Cancel</Button>

        <Tooltip title={disabledReason || ''}>
          <span>
            <Button variant="contained" color="success" disabled={submitDisabled} onClick={handleCreateNewFile} type="submit">Create</Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

export default NewFileDialog;