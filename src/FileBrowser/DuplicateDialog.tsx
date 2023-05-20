import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { findItemByPath } from "../redux/filesSlice";
import { FileType, findParentFolder, ROOTFOLDER, SubType } from "./FileBrowser";
import useBrowserDialog, { getFolders, SetOpenFunction } from "./useBrowserDialog";

type DuplicateDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  sourceFilePath: string;
  fileType: FileType;
  subType: SubType;
  openFolder: string | null;
  setOpenFolder: Dispatch<SetStateAction<string | null>>;
}
  
const DuplicateDialog = ({ open, setOpen, onClose, sourceFilePath, openFolder }: DuplicateDialogProps) => {
  const { items, itemType, handleCreateNewFile } = useBrowserDialog(sourceFilePath, setOpen);
 
  const suggestedFilename = (srcPath:string) => {
    const srcName = srcPath.split('/').pop();
    return `Copy of ${srcName}`;
  }

  console.log('sourceFilePath', sourceFilePath);

  const [itemName, setItemName] = useState<string>(suggestedFilename(sourceFilePath));
  const initialParent:string = findParentFolder(sourceFilePath.split('/'));

  const item = findItemByPath(items, sourceFilePath.split('/'));
  const sourceContent = item?.content;
  const sourceChildren = item?.children;

  const [parentFolder, setParentFolder] = useState<string | null>(initialParent);

  useEffect(() => {
    const newFolder = findParentFolder(sourceFilePath?.split('/') || []);
    setParentFolder(newFolder);
    setItemName(suggestedFilename(sourceFilePath));
    console.log('newFolder', newFolder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilePath]);

  useEffect(() => {
    if (!open && openFolder) {
      setParentFolder(openFolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFolder]);
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText>
          Please enter the name of the new {itemType} and select the parent folder.
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel id="parent-folder-label">Parent Folder</InputLabel>
          <Select
            labelId="parent-folder-label"
            value={parentFolder}
            defaultValue={openFolder}
            label="Parent Folder"
            onChange={(e) => setParentFolder(e.target.value) }
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
        <Button onClick={() => handleCreateNewFile(parentFolder, itemName, sourceContent, sourceChildren)} 
        disabled={!itemName || !parentFolder}>
          Create Duplicate
        </Button>

      </DialogActions>
    </Dialog>
  );
}

export default DuplicateDialog;