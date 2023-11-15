import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { ProjectFile } from "../Project/ProjectTypes";
import { setFiles, setFontOptions, setOpenFilePath, setProjectId, setProjectSettings, setProjectTitle, setPublishOptions } from "../redux/projectSlice";
import useUser from "../User/useUser";

type NewProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  setEditorContent: (content: string) => void;
};

const NewProjectDialog = ({ open, onClose, setEditorContent }: NewProjectDialogProps) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [disabledReason, setDisabledReason] = useState<string>('');
  const submitDisabled = !newProjectName;

  const { user } = useUser();

  const dispatch = useDispatch();
  
  const handleCreateNewProject = () => {

    const newPath = "Untitled";

    const newItem:ProjectFile = {
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
    dispatch(setProjectTitle(newProjectName));
    dispatch(setProjectId(undefined));
    dispatch(setProjectSettings({}));

    if (user.publishingOptions) {
      dispatch(setPublishOptions(user.publishingOptions));
    }

    if (user.fontOptions) {
      dispatch(setFontOptions(user.fontOptions));
    }

    setEditorContent('');
    handleClose();
  };

  const handleOpen = () => {
    setNewProjectName('');
    setDisabledReason('');
  }

  const handleClose = () => {
    onClose();
  }

  useEffect(() => {
    if (open) {
      handleOpen();
    }
  }, [open]);

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
        <CancelButton onClick={handleClose} />

        <Tooltip title={disabledReason || ''}>
          <span>
            <ConfirmButton disabled={submitDisabled} onClick={handleCreateNewProject} label="Create" />
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

export default NewProjectDialog;