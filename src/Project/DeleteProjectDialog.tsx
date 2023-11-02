import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, useTheme, Typography, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import { Project, ProjectListing } from "./ProjectTypes";
import axios from "axios";
import useUser from "../User/useUser";
import { isFunction } from "@mui/x-data-grid/internals";

type DeleteProjectDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  project?: ProjectListing;
  callback?: (id?: number) => void;
}
  
const DeleteProjectDialog = ({ open, setOpen, onClose, project, callback }: DeleteProjectDialogProps) => {
  const theme = useTheme();
  const { user } = useUser();
  const AuthStr = `Bearer ${user.token}`;

  const [projectName, setProjectName] = useState<string>(project?.title || '');

  const handleDeleteClick = () => {
    // console.log('rename project', project?.id, projectName);
    if (!project || !user || !user.token) {
      return;
    }

    const deleteUrl = `${process.env.REACT_APP_API_URL}/project/${project.id}`;
  
    axios.delete(deleteUrl, { headers: { Authorization: AuthStr } }).then(res => {
      if (isFunction(callback)) {
        callback(project.id);
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

  if (!project) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you really want to delete {project.title}?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleDeleteClick} {...{ mode }} disabled={!projectName} label="Delete Project" />
      </DialogActions>    
    </Dialog>
  );
}

export default DeleteProjectDialog;