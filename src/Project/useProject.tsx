// Project/useProject.tsx

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentProject, setFiles, setProjectCreator, setProjectId } from "../redux/projectSlice";
import { ProjectListing, ProjectState } from "./ProjectTypes";
import axios from "axios";
import { UserState } from "../redux/userSlice";
import useProjectImport from "./useProjectImport";
import useProjectExport from "./useProjectExport";
import { exportProjectToJson, exportProjectToHtml } from "./projectUtils";
import { Button, Divider, FormControl, InputLabel, ListSubheader, MenuItem, Select } from "@mui/material";

export interface XmlIndex {
  [id:string]: string;
}

export type UseProjectProps = {
  handleEditorChange?:((content: string) => void)
  saveCallback?: () => void;
};

const useProject = ({ handleEditorChange, saveCallback }: UseProjectProps) => {
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const [opening, setOpening] = useState<ProjectState | undefined>(undefined);
  const [reloading, setReloading] = useState<ProjectState | undefined>(undefined);

  const currentProject = useSelector(getCurrentProject);

  const { ImportButton, ManageProjectsButton, ImportDialog, importProjectFromJson, importProjectFromScrivenerZip, importingPath } = useProjectImport({ handleEditorChange });

  const NewProjectButton = ({ text, label, callback }:{ text?: true, label?: string, callback?: () => void }) => {
    const handleClick = (e:React.MouseEvent<HTMLButtonElement | HTMLLIElement>) => {
      e.currentTarget.blur(); // Remove focus from the button
      if (callback) {
        callback();
      } else {
        setNewProjectOpen(true);
      }
    }

    if (!text) {
      return (
        <Button onClick={handleClick}
         color="primary" variant="text"
        >
          { label || 'New Project' }
        </Button>
      );
    } else {
      return (
        <MenuItem onClick={handleClick}>
          { label || 'New Project' }
        </MenuItem>
      );
    }
};

  const handleExportReady = (name:string, extension: string) => {
    switch (extension) {
      case 'json':
        exportProjectToJson(name);
      break;
      case 'html':
        exportProjectToHtml(name);
      break;
    }
  }
  
  const { ExportButton, ExportDialog, setExportOptionsOpen } = useProjectExport({ handleExportReady });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target ? event.target.files?.[0] : null;
  
    if (!file) return;
  
    switch (file.type) {
      case 'application/zip':
        importProjectFromScrivenerZip(file);
      break;

      case 'application/json':
        importProjectFromJson(file);
      break;
    }

    // Reset the file input value so the same file can be imported again if needed
    if (event.target) {
      event.target.value = '';
    }

  };
 
  const loadProject = (project:ProjectListing, token:string, immediate?:boolean) => {
    const AuthStr = 'Bearer ' + token;

    if (setSaving) {
      setSaving(false);
    }

    axios.get(`${process.env.REACT_APP_API_URL}/project/${project.id}`, { headers: { Authorization: AuthStr } })
      .then((response) => {
        if (!immediate) {
          setOpening(response.data);
        } else {
          setReloading(response.data);
        }
      })
      .catch((error) => {
        console.log('error', error);
      }
    );
  };

  const loadProjectById = (id:number, token:string, immediate?:boolean) => {
    const AuthStr = 'Bearer ' + token;

    if (setSaving) {
      setSaving(false);
    }

    axios.get(`${process.env.REACT_APP_API_URL}/project/${id}`, { headers: { Authorization: AuthStr } })
      .then((response) => {
        if (!immediate) {
          setOpening(response.data);
        } else {
          setReloading(response.data);
        }
      })
      .catch((error) => {
        console.log('error', error);
      }
    );
  }


  const saveProject = async ({ user, project }:{ user:UserState, project: ProjectState }) => {
    if (!user || !user.token) {
      return;
      // Eventually we should probably prompt the user to log in or create an account
    }

    // const isCollaborator = Boolean(project.creator) && project.creator !== user.id;
    
    const headers = { headers: { Authorization: 'Bearer ' + user.token } };
    const postUrl = `${process.env.REACT_APP_API_URL}/project` + (project.id ? `/${project.id}` : '');

    const payload = {...project, creator: user.id };

    const action = project.id ? axios.patch : axios.post;

    const saveResponse = await action(postUrl, payload, headers)
      .then((response) => {
        if (setSaving) { setSaving(false); }

        if (response.data && response.data.id) {
          const savedProject = response.data as ProjectState;
          dispatch(setProjectId(savedProject.id));

          if (savedProject.creator) {
            dispatch(setProjectCreator(savedProject.creator));
          }

          if (savedProject.files) {
            dispatch(setFiles(savedProject.files));
          }

          if (saveCallback) {
            saveCallback();
          }
        }
        return response;
      })
      .catch((error) => {
        console.log('error', error);
        return error;
      }
    );

    return saveResponse;
  };

  type ProjectSelectorProps = {
    user: UserState;
    callback: (arg:ProjectListing, token: string) => void;
    handleEditorChange: (content: string) => void;
    importCallback: () => void;
    newCallback: () => void;
    manageCallback: () => void;
  };
  
  const ProjectSelector:React.FC<any> = ({ user, callback, handleEditorChange, importCallback, manageCallback, newCallback }:ProjectSelectorProps) => {
    const { projects, token } = user;
    
    if (!projects || !token) {
      return null;
    }

    const totalProjectCount = (projects.Created?.length || 0) + (projects.Collaborator?.length || 0);

    let viewAll:(null | JSX.Element) = null;

    if ((projects.Created && projects.Created.length > 5) || (projects.Collaborator && projects.Collaborator.length > 5)) {
      viewAll = <ManageProjectsButton callback={manageCallback} text={true} label={`View all ${totalProjectCount} projects...`} />;
    }

    return (
      <FormControl sx={{ my: 0, mr: 2, p:0, minWidth: 120 }}>
      <InputLabel htmlFor="grouped-select">Projects</InputLabel>
      <Select defaultValue="" id="grouped-select" label="Grouping" variant="outlined">
        {projects && Object.keys(projects).map((group) => {
          if (!projects[group as keyof typeof projects].length) {
            return null;
          }
          return (
            <div key={group}>
              <ListSubheader>{group} Projects</ListSubheader>
              {projects[group as keyof typeof projects].slice(0,5).map((project) => (
                <MenuItem key={project.id} onClick={() => callback(project, token)}>{project.title}</MenuItem>
              ))}
            </div>
          );
        })}

        {viewAll}
  
        <Divider />
  
        <NewProjectButton text={true} callback={newCallback} />
        <ImportButton callback={importCallback} text={true} label="Import Project" />
        <ManageProjectsButton callback={manageCallback} text={true} label="Manage Projects" />
      </Select>
    </FormControl>
    )
  };
  
  return {
    opening, setOpening, saving, setSaving, importProjectFromJson, handleUpload, 
    ExportOptions: ExportDialog, setExportOptionsOpen, ExportButton, 
    ImportOptions: ImportDialog, ImportButton, 
    setNewProjectOpen, newProjectOpen, 
    currentProject, loadProject, loadProjectById, saveProject,
    reloading, setReloading, importingPath,
    NewProjectButton, ProjectSelector
  };
};

export default useProject;