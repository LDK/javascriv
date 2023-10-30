import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, useTheme, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import { Project, ProjectListing } from "./ProjectTypes";
import axios from "axios";
import useUser from "../User/useUser";
import { isFunction } from "@mui/x-data-grid/internals";

type RenameProjectDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  project?: ProjectListing;
  callback?: () => void;
}
  
const RenameProjectDialog = ({ open, setOpen, onClose, project, callback }: RenameProjectDialogProps) => {

  const theme = useTheme();
  const { user } = useUser();
  const AuthStr = `Bearer ${user.token}`;

  const [projectName, setProjectName] = useState<string>(project?.title || '');

  const handleRenameClick = () => {
    // console.log('rename project', project?.id, projectName);
    if (!project || !user || !user.token) {
      return;
    }

    const patchUrl = `${process.env.REACT_APP_API_URL}/project/${project?.id}/rename`;
  
    axios.patch(patchUrl, { title: projectName }, { headers: { Authorization: AuthStr } }).then(res => {
      console.log('rename response', res.data);
      if (isFunction(callback)) {
        callback();
      }
    });

    
    setOpen(false);
  };

  useEffect(() => {
    if (open && project) {
      setProjectName(project.title || '');
    }
  }, [open, project]);

  const mode = theme.palette.mode;


  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText>
          Please enter a new name for this project.
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleRenameClick} {...{ mode }} disabled={!projectName} label="Rename Project" />
      </DialogActions>    
    </Dialog>
  );
}

export default RenameProjectDialog;