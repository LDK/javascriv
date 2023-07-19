import { Dialog, DialogContent, DialogActions, Button, FormControl, InputLabel, MenuItem, Select, DialogTitle } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { renameChildrenPaths } from "../Project/projectUtils";
import { findItemByPath } from "../redux/projectSlice";
import { findParentFolder, ROOTFOLDER } from "./ProjectBrowser";
import useBrowserDialog, { getFolders, SetOpenFunction } from "./useBrowserDialog";

type MoveFileDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  sourceFilePath: string;
  openFolder: string | null;
  setOpenFolder: Dispatch<SetStateAction<string | null>>;
}
  
const MoveFileDialog = ({ open, setOpen, onClose, sourceFilePath, openFolder }: MoveFileDialogProps) => {
  const { items, handleCreateNewFile, handleDeleteFile } = useBrowserDialog(sourceFilePath, setOpen);
 
  const initialParent:string = findParentFolder(sourceFilePath.split('/'));

  const item = findItemByPath(items, sourceFilePath.split('/'));
  const [itemName, setItemName] = useState<string>(item?.name || '');
  const sourceContent = item?.content;
  const sourceChildren = item?.children;
  const sourceId = item?.id;

  const [parentFolder, setParentFolder] = useState<string | null>(initialParent);

  useEffect(() => {
    const newFolder = findParentFolder(sourceFilePath?.split('/') || []);
    setParentFolder(newFolder);
    setItemName(item?.name || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilePath]);

  useEffect(() => {
    if (!open && openFolder) {
      setParentFolder(openFolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFolder]);
  
  if (!item) {
    return <></>;
  }

  const moveFile = () => {
    handleDeleteFile(sourceFilePath);
    const newChildren = renameChildrenPaths(sourceChildren, `${parentFolder}/${itemName}`);
    handleCreateNewFile(parentFolder, itemName, sourceContent, newChildren, sourceId);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle>Move File {item.name}?</DialogTitle>
        <FormControl fullWidth margin="dense">
          <InputLabel id="parent-folder-label">New Parent Folder</InputLabel>
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
        <Button onClick={moveFile}
          variant="contained"
          color="primary"
          disabled={!itemName || !parentFolder || parentFolder === sourceFilePath}
        >
          Move File
        </Button>

      </DialogActions>
    </Dialog>
  );
}

export default MoveFileDialog;