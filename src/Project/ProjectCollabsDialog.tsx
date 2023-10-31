import { Dialog, DialogContent, DialogContentText, DialogActions, useTheme, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { ConfirmButton } from "../Components/DialogButtons";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import { Project, ProjectListing } from "./ProjectTypes";
import axios from "axios";
import useUser from "../User/useUser";
import { isFunction } from "@mui/x-data-grid/internals";
import AddCollaboratorDialog from "./AddCollaboratorDialog";
import { DeleteButton } from "../ProjectBrowser/ItemActionButtons";
import { AppUser } from "../redux/userSlice";
import DeleteCollaboratorDialog from "./DeleteCollaboratorDialog";

type ProjectCollabsDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  project?: ProjectListing;
  callback?: () => void;
}
  
const ProjectCollabsDialog = ({ open, setOpen, onClose, project, callback }: ProjectCollabsDialogProps) => {

  const theme = useTheme();
  const { user } = useUser();
  const AuthStr = `Bearer ${user.token}`;

  const [projectData, setProjectData] = useState<Project | null>(null);
  const [addCollabOpen, setAddCollabOpen] = useState<ProjectListing | false>(false);
  const [deleteOpen, setDeleteOpen] = useState<AppUser | false>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  const fetchProject = () => {
    if (!project || !open) {
      return;
    }
    axios.get(`${process.env.REACT_APP_API_URL}/project/${project.id}`, { headers: { Authorization: AuthStr } }).then(res => {
      setProjectData(res.data);
    });
  };

  useEffect(() => {
    if (open && project) {
      if (!projectData || projectData.id !== project.id) {
        fetchProject();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project, projectData]);

  useEffect(() => {
    if (open && project && refresh) {
      fetchProject();
      setRefresh(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const handleSaveClick = () => {
    // console.log('rename project', project?.id, projectName);
    if (!project || !user || !user.token) {
      return;
    }
    
    setOpen(false);
  };

  const mode = theme.palette.mode;

  const AddCollaboratorButton = () => <Button onClick={(e) => {
    e.currentTarget.blur(); // Remove focus from the button
    setAddCollabOpen(projectData || false);
  }}>Add Collaborator</Button>;

  const handleAdd = () => {
    setAddCollabOpen(false);
    setRefresh(true);
    if (callback && isFunction(callback)) {
      callback();
    }
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    setRefresh(true);
    if (callback && isFunction(callback)) {
      callback();
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText>
          Collaborators for {`"${project?.title}"` || 'this project'}:
        </DialogContentText>

        {(!projectData || !projectData.collaborators) ? <Typography>No collaborators</Typography> : (
          <ul>
            {projectData.collaborators.map((collab, i) => (
              <li key={i}>{collab.username} <DeleteButton action={(e) => { 
                e.stopPropagation();
                setDeleteOpen(collab);
              }} /></li>
            ))}
          </ul>
        )}

        <AddCollaboratorButton />
      </DialogContent>

      <DialogActions>
        <ConfirmButton onClick={handleSaveClick} {...{ mode }} label="Done" />
      </DialogActions>

      <AddCollaboratorDialog 
        {...{user}}
        currentProject={addCollabOpen || undefined}
        open={Boolean(addCollabOpen)}
        onClose={handleAdd} 
      />

      <DeleteCollaboratorDialog
        {...{user}}
        currentProject={projectData || undefined}
        collaborator={deleteOpen || undefined}
        open={Boolean(deleteOpen)}
        onClose={handleDelete}
      />
    </Dialog>
  );
}

export default ProjectCollabsDialog;