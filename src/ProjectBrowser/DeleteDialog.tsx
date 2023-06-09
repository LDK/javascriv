import { Dialog, DialogContent, DialogContentText, DialogActions, Button, DialogTitle } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { findItemByPath } from "../redux/projectSlice";
import { findParentFolder } from "./ProjectBrowser";
import useBrowserDialog, { SetOpenFunction } from "./useBrowserDialog";

type DeleteDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  sourceFilePath: string;
  openFolder: string | null;
  setOpenFolder: Dispatch<SetStateAction<string | null>>;
}
  
const DeleteDialog = ({ open, setOpen, onClose, sourceFilePath, openFolder }: DeleteDialogProps) => {
  const { items, handleDeleteFile } = useBrowserDialog(sourceFilePath, setOpen);
 
  const item = findItemByPath(items, sourceFilePath.split('/'));
  
  const initialParent:string = findParentFolder(sourceFilePath.split('/'));
  const [parentFolder, setParentFolder] = useState<string | null>(initialParent);

  useEffect(() => {
    const newFolder = findParentFolder(sourceFilePath?.split('/') || []);
    setParentFolder(newFolder);
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you really want to delete {item.name}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>

        <Button autoFocus color="primary" disabled={!item.name || !parentFolder} onClick={
          () => handleDeleteFile(sourceFilePath)
        } >
          Delete
        </Button>

      </DialogActions>
    </Dialog>
  );
}

export default DeleteDialog;