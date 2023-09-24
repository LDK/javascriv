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

export interface XmlIndex {
  [id:string]: string;
}

export type UseProjectProps = {
  handleEditorChange?:((content: string) => void)
  saveCallback?: () => void;
  setSaving?: (saving: boolean) => void;
};

const useProject = ({ handleEditorChange, saveCallback, setSaving }: UseProjectProps) => {
  const dispatch = useDispatch();
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const [opening, setOpening] = useState<ProjectState | undefined>(undefined);
  const [reloading, setReloading] = useState<ProjectState | undefined>(undefined);

  const currentProject = useSelector(getCurrentProject);

  const { ImportButton, ImportDialog, importProjectFromJson, importProjectFromScrivenerZip, importingPath } = useProjectImport({ handleEditorChange, saveCallback, setSaving });

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
        console.log('loadProject response', response);
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

  const saveProject = async ({ user, project }:{ user:UserState, project: ProjectState }) => {
    if (!user || !user.token) {
      return;
      // Eventually we should probably prompt the user to log in or create an account
    }

    const isCollaborator = Boolean(project.creator) && project.creator !== user.id;
    
    const headers = { headers: { Authorization: 'Bearer ' + user.token } };
    const postUrl = `${process.env.REACT_APP_API_URL}/project` + (project.id ? `/${project.id}` : '');

    const payload = {...project, creator: user.id };

    const saveResponse = await axios.post(postUrl, payload, headers)
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

  return {
    opening, setOpening, importProjectFromJson, handleUpload, 
    ExportOptions: ExportDialog, setExportOptionsOpen, ExportButton, 
    ImportOptions: ImportDialog, ImportButton, 
    setNewProjectOpen, newProjectOpen, 
    currentProject, loadProject, saveProject,
    reloading, setReloading, importingPath
  };
};

export default useProject;