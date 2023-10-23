import { Button } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getFullTree } from "../Convert/scrivener/scrivener";
import { findItemByPath, setFiles, setOpenFilePath, setProjectTitle, setProjectSettings, setProjectId } from "../redux/projectSlice";
import ImportOptions, { ImportingOptions } from "./ImportOptions";
import { ProjectFile, ProjectSettings, ProjectState } from "./ProjectTypes";
import { parseZipFile, renameTwins } from "./projectUtils";
import { UseProjectProps } from "./useProject";
import { MenuItem } from "@mui/material";

type UseProjectImportProps = Omit<UseProjectProps, 'saveCallback' | 'setSaving'>;

const useProjectImport = ({ handleEditorChange }: UseProjectImportProps) => {
  const dispatch = useDispatch();

  const [importOptionsOpen, setImportOptionsOpen] = useState(false);
  const [importingPath, setImportingPath] = useState<string[] | null>(null);
  const [importingFiles, setImportingFiles] = useState<ProjectFile[] | false>(false);
  const [importingTitle, setImportingTitle] = useState<string>('');
  const [importingContent, setImportingContent] = useState<string | null>(null);
  const [importingSettings, setImportingSettings] = useState<ProjectSettings>({});
  const [importingId, setImportingId] = useState<number | undefined>(undefined);

  type ImportButtonProps = {
    callback: () => void;
    variant?: 'text' | 'outlined' | 'contained';
    label?: string;
    text?: true;
  }

  const ImportButton = ({ callback, variant, label, text }: ImportButtonProps) => {
    const handleClick = () => {
      callback();
      setImportOptionsOpen(true);
    };

    // if text, use MenuItem
    if (text) {
      return (
        <MenuItem onClick={handleClick}>
          {label || 'Import'}
        </MenuItem>
      )
    }
    else {
      return (
        <Button onClick={handleClick} color="primary" variant={variant || 'text'}>
          {label || 'Import'}
        </Button>
      )
    }
  };

  const ManageProjectsButton = ({ callback, variant, label, text }: ImportButtonProps) => {
    const handleClick = () => {
      callback();
      setImportOptionsOpen(true);
    };

    // if text, use MenuItem
    if (text) {
      return (
        <MenuItem onClick={handleClick}>
          {label || 'Manage Projects'}
        </MenuItem>
      )
    }
    else {
      return (
        <Button onClick={handleClick} color="primary" variant={variant || 'text'}>
          {label || 'Manage Projects'}
        </Button>
      )
    }
  };

  const importProjectFromJson = (file:File) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result;

        if (typeof content === 'string') {
          const importedProject:ProjectState = JSON.parse(content);

          if (importedProject) {
            const projectFiles = renameTwins(importedProject.files);

            if (importedProject.openFilePath && projectFiles) {
              setImportingPath(importedProject.openFilePath.split('/'));
              setImportingFiles(projectFiles);

              const newItem = findItemByPath(projectFiles, importedProject.openFilePath.split('/'));

              if (newItem && newItem.content) {
                setImportingContent(newItem.content);
              }
            }

            if (importedProject.settings) {
              setImportingSettings(importedProject.settings);
            }

            if (importedProject.title) {
              setImportingTitle(importedProject.title);
            } else {
              setImportingTitle('New Project');
            }

            if (importedProject.id) {
              setImportingId(importedProject.id);
            } else {
              setImportingId(undefined);
            }

          }

        }
      } catch (error) {
        setImportingPath(null);
        setImportingFiles(false);
        setImportingContent(null);
        setImportingTitle('');
        setImportingSettings({});
        setImportingId(undefined);

        console.error('Error importing project:', error);
      }
    };
    reader.readAsText(file);
  };
  
  const handleImportClose = () => {
    setImportOptionsOpen(false);
    setImportingContent(null);
    setImportingFiles(false);
    setImportingPath(null);
  };

  const handleImportReady = (options:ImportingOptions) => {
    if (options.items) {
      dispatch(setFiles(options.items));

      if (importingPath) {
        const openItem = findItemByPath(options.items, importingPath);
        if (openItem) {
          dispatch(setOpenFilePath(importingPath.join('/')));

          if (importingContent && handleEditorChange) {
            handleEditorChange(importingContent);
          }

        } else {
          dispatch(setOpenFilePath(''));

          if (handleEditorChange) {
            handleEditorChange('');
          }
        }
      }

      if (options.title || importingTitle) {
        dispatch(setProjectTitle(options.title || importingTitle));
      } else {
        dispatch(setProjectTitle('New Project'));
      }

      if (importingSettings) {
        dispatch(setProjectSettings(importingSettings));
      } else {
        dispatch(setProjectSettings({}));
      }

      if (importingId) {
        dispatch(setProjectId(importingId));
      } else {
        dispatch(setProjectId(undefined));
      }
    }

    handleImportClose();
  }

  const ImportDialog = () => (
    <ImportOptions 
      files={importingFiles || []}
      title={importingTitle || 'New Project'}
      onReady={handleImportReady}
      optionsOpen={Boolean(importOptionsOpen && importingFiles)}
      onClose={handleImportClose}
     />
  );

  const importProjectFromScrivenerZip = async (file: File) => {
    const keyFiles = await parseZipFile(file);

    if (keyFiles['indexes'] && keyFiles['scrivx']) {
      const fullTree = await getFullTree(keyFiles['scrivx'], keyFiles['indexes']);
      const newPath = fullTree[0]?.path.split('/').filter((item) => item.length) || [];
      setImportingPath(newPath);
      setImportingFiles(fullTree);
      setImportingSettings({});
      const newItem = findItemByPath(fullTree, newPath);

      if (newItem && newItem.content) {
        setImportingContent(newItem.content);
      }

    }
  }

  return {
    importProjectFromJson, handleImportClose, handleImportReady, ImportDialog, setImportOptionsOpen, ImportButton, ManageProjectsButton, importProjectFromScrivenerZip, importingPath
  };

}

export default useProjectImport;