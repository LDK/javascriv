import { Dialog, DialogContent, DialogContentText, DialogActions, useTheme, Typography, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import { ProjectListing } from "./ProjectTypes";
import axios from "axios";
import useUser from "../User/useUser";
import { isFunction } from "@mui/x-data-grid/internals";

type LeaveProjectDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  project?: ProjectListing;
  callback?: () => void;
}
  
const LeaveProjectDialog = ({ open, setOpen, onClose, project, callback }: LeaveProjectDialogProps) => {
  const theme = useTheme();
  const { user } = useUser({});

  const [projectName, setProjectName] = useState<string>(project?.title || '');

  useEffect(() => {
    if (open && project) {
      setProjectName(project.title || '');
    }
  }, [open, project]);

  if (!user || !user.token) {
    return null;
  }

  const AuthStr = `Bearer ${user.token}`;

  const handleLeaveClick = () => {
    // console.log('rename project', project?.id, projectName);
    if (!project || !user || !user.token) {
      return;
    }

    const deleteUrl = `${process.env.REACT_APP_API_URL}/project/${project?.id}/collaborator/${user.id}`;
  
    axios.delete(deleteUrl, { headers: { Authorization: AuthStr } }).then(res => {
      if (isFunction(callback)) {
        callback();
      }
    });

    
    setOpen(false);
  };

  const mode = theme.palette.mode;

  if (!project) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">Confirm Leaving</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you really want to leave the project <Typography component="span" fontWeight={700}>{project.title}</Typography>?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleLeaveClick} {...{ mode }} disabled={!projectName} label="Leave Project" />
      </DialogActions>    
    </Dialog>
  );
}

export default LeaveProjectDialog;