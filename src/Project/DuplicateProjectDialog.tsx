import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, useTheme, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { FileType, SubType, findParentFolder } from "../ProjectBrowser/ProjectBrowser";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import { Project, ProjectListing } from "./ProjectTypes";
import axios from "axios";
import useUser from "../User/useUser";

type DuplicateProjectDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  project?: ProjectListing;
  callback: () => void;
}
  
const DuplicateProjectDialog = ({ open, setOpen, onClose, project }: DuplicateProjectDialogProps) => {

  const theme = useTheme();
  const { user } = useUser({});
  const AuthStr = `Bearer ${user.token}`;

  const suggestedTitle = (projectTitle:string) => {
    const srcName = projectTitle;
    return `Copy of ${srcName}`;
  }

  const [projectName, setProjectName] = useState<string>(suggestedTitle(project?.title || ''));
  const [projectData, setProjectData] = useState<Project | null>(null);

  const handleDuplicateClick = () => {
    // console.log('duplicate project', project?.id, projectName);
    if (!project || !user || !user.token || !projectData) {
      return;
    }

    const postUrl = `${process.env.REACT_APP_API_URL}/project/${project?.id}/duplicate`;
  
    axios.post(postUrl, { title: projectName, files: projectData.files || [] }, { headers: { Authorization: AuthStr } });
    setOpen(false);
  };

  useEffect(() => {
    if (open && project) {
      setProjectName(suggestedTitle(project.title || ''));
      if (!projectData || projectData.id !== project.id) {
        axios.get(`${process.env.REACT_APP_API_URL}/project/${project.id}`, { headers: { Authorization: AuthStr } }).then(res => {
          setProjectData(res.data);
          console.log('got project data', res.data);
        });
      }
    }
  }, [open, project]);

  const mode = theme.palette.mode;

  let dialogContent = <Typography>Loading project data...</Typography>;

  if (projectData) {
    dialogContent = (<>
      <DialogContent>
        <DialogContentText>
          Please enter a name for the duplicate project.
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
        <ConfirmButton onClick={handleDuplicateClick} {...{ mode }} disabled={!projectName} label="Create duplicate project" />
      </DialogActions>    
    </>);
  }
  
  return (
    <Dialog open={open} onClose={onClose}>
      {dialogContent}
    </Dialog>
  );
}

export default DuplicateProjectDialog;