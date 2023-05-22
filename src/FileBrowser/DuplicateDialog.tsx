import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, FormControl, InputLabel, MenuItem, Select, useTheme } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { renameChildrenPaths } from "../Project/projectUtils";
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
 
  const theme = useTheme();

  const suggestedFilename = (srcPath:string) => {
    const srcName = srcPath.split('/').pop();
    return `Copy of ${srcName}`;
  }

  const initialName = sourceFilePath.split('/').pop();
  const [itemName, setItemName] = useState<string>(suggestedFilename(sourceFilePath));

  let initialParent:string = findParentFolder(sourceFilePath.split('/'));

  if (initialParent.startsWith('/')) {
    initialParent = initialParent.slice(1);
  }

  const item = findItemByPath(items, sourceFilePath.split('/'));
  const sourceContent = item?.content;

  const [parentFolder, setParentFolder] = useState<string | null>(initialParent);

  useEffect(() => {
    setItemName(suggestedFilename(sourceFilePath));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilePath]);

  useEffect(() => {
    if (!open && openFolder) {
      let newFolder = openFolder;

      if (newFolder.startsWith('/')) {
        newFolder = newFolder.slice(1);
      }
  
      setParentFolder(newFolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFolder]);
  
  const handleDuplicateClick = () => {
    let sourceChildren = item?.children;

    if (itemName !== initialName) {
      const itemPath = `${parentFolder}/${itemName}`;
      sourceChildren = renameChildrenPaths(sourceChildren, itemPath);
    }

    handleCreateNewFile(parentFolder, itemName, sourceContent, sourceChildren)
  };

  const mode = theme.palette.mode;

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
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleDuplicateClick} {...{ mode }} disabled={!itemName || !parentFolder} label="Create Duplicate" />
      </DialogActions>
    </Dialog>
  );
}

export default DuplicateDialog;