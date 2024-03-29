import { Dialog, DialogContent, DialogActions, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { ProjectState } from "../Project/ProjectTypes";
import useProject from "../Project/useProject";
import { selectProjectTitle, setCollaborators, setFiles, setOpenFilePath, setProjectId, setProjectSettings, setProjectTitle } from "../redux/projectSlice";
import useUser from "../User/useUser";

type OpenProjectDialogProps = {
  onClose: () => void;
  project?: ProjectState;
}

const OpenProjectDialog = ({ onClose, project }: OpenProjectDialogProps) => {
  const dispatch = useDispatch();
  const currentTitle = useSelector(selectProjectTitle);

  const { user } = useUser();
  const { saveProject } = useProject({});

  if (!project) {
    return null;
  }

  const handleOpenProject = () => {
    let files = project.files;

    // go through files array and set initialContent to content
    // Also iterate through folders and set initialContent to content on children
    const setInitialContent = (files: ProjectState['files']) => {
      files.forEach(file => {
        if (file.type === 'folder' && file.children) {
          setInitialContent(file.children);
        } else if (file.type === 'file') {
          file.initialContent = file.content;
        }
      });
    };
    
    setInitialContent(files);

    dispatch(setFiles(files));
    dispatch(setOpenFilePath(project.openFilePath || '/'));
    dispatch(setProjectTitle(project.title || 'Untitled'));
    dispatch(setProjectSettings(project.settings || {}));
    dispatch(setProjectId(project.id));
    dispatch(setCollaborators(project.collaborators || []));
    onClose();
  };

  const handleSaveAndOpenProject = () => {
    saveProject({ user, project });
    handleOpenProject();
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent>
        <Typography fontWeight={500}>
          Open {project.title || 'this project'} and close {currentTitle || 'the current project'}?
        </Typography>
        <Typography variant="subtitle1">
          You have unsaved changes.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <CancelButton onClick={onClose} />
        <ConfirmButton onClick={handleSaveAndOpenProject} label="Save Changes and Open Project" />
        <ConfirmButton onClick={handleOpenProject} label="Open and Discard Changes" />
      </DialogActions>
    </Dialog>
  );
}

export default OpenProjectDialog;