import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, Button, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BrowserItem, setFiles, setOpenFilePath } from "../redux/filesSlice";

type NewProjectDialogProps = {
  open: boolean;
  onClose: () => void;
}

const NewProjectDialog = ({ open, onClose }: NewProjectDialogProps) => {

  const [newProjectName, setNewProjectName] = useState('');
  const [disabledReason, setDisabledReason] = useState<string>('');
  const submitDisabled = !newProjectName;

  const dispatch = useDispatch();
  
  const handleCreateNewProject = () => {

    const newPath = "Untitled";

    const newItem:BrowserItem = {
      type: 'file',
      subType: 'document',
      name: newPath,
      path: newPath,
      content: '<p></p>',
      initialContent: '<p></p>',
      changed: false,
    };

    const newTree = [newItem];

    dispatch(setFiles(newTree));
    dispatch(setOpenFilePath(newPath));
    onClose();
  };

  useEffect(() => {
    if (submitDisabled) {
      if (!newProjectName) {
        setDisabledReason('Please enter a name for the project.');
      }
    } else {
      setDisabledReason('');
    }
  }, [newProjectName, submitDisabled]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please enter a name for the new project.
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
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />

      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="warning" sx={{ mr: 1 }}>Cancel</Button>

        <Tooltip title={disabledReason || ''}>
          <span>
            <Button variant="contained" color="success" disabled={submitDisabled} onClick={handleCreateNewProject} type="submit">Create</Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

export default NewProjectDialog;