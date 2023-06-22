// Project/useProject.tsx

import { Button } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { findItemByPath, setFiles, setOpenFilePath, setProjectSettings, setProjectTitle } from "../redux/projectSlice";
import { store } from "../redux/store";
import JSZip from 'jszip';
import { getFullTree } from "../Convert/scrivener/scrivener";
import ImportOptions, { ImportingOptions } from "./ImportOptions";
import { renameTwins } from "./projectUtils";
import ExportOptions from "./ExportOptions";
import { ProjectFile, ProjectSettings, ProjectState } from "./ProjectTypes";

export interface XmlIndex {
  [id:string]: string;
}

const useProject = (handleEditorChange:((content: string) => void)) => {
  const dispatch = useDispatch();
  const [exportOptionsOpen, setExportOptionsOpen] = useState(false);
  const [importOptionsOpen, setImportOptionsOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const [importingPath, setImportingPath] = useState<string[] | null>(null);
  const [importingFiles, setImportingFiles] = useState<ProjectFile[] | false>(false);
  const [importingTitle, setImportingTitle] = useState<string>('');
  const [importingContent, setImportingContent] = useState<string | null>(null);
  const [importingSettings, setImportingSettings] = useState<ProjectSettings>({});

  const parseZipFile = async (file: File) => {
    // Create a new instance of JSZip
    const zip = new JSZip();
  
    // Read the zip file content
    const fileData = await file.arrayBuffer();
  
    // Load the zip file content
    const loadedZip = await zip.loadAsync(fileData);
  
    let isScrivener = false;
    let keyFiles: XmlIndex = {};
  
    let i = 0;

    // Iterate through the files inside the zip
    for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
      const pathArr = relativePath.split('/').filter((item) => item.length);
      const fileName = pathArr[pathArr.length - 1];
  
      if (fileName.startsWith('._')) {
        continue;
      }
  
      if (i === 0) {
        isScrivener = fileName.endsWith('.scriv');
      }
  
      i++;

      if (isScrivener) {
        if (fileName.endsWith('.scrivx')) {
          const content = await zipEntry.async('text');
          keyFiles['scrivx'] = content;
        }
        if (fileName === 'search.indexes') {
          const content = await zipEntry.async('text');
          keyFiles['indexes'] = content;
        }
      }
    }
  
    if (isScrivener) {
      return keyFiles;
    } else {
      return {} as XmlIndex;
    }
  };
  
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
  
  const importProjectFromJson = (file:File) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result;

        if (typeof content === 'string') {
          const importedProject:ProjectState = JSON.parse(content);

          if (importedProject) {
            const projectFiles = renameTwins(importedProject.files);
            // const projectFiles = importedProject.files;

            if (importedProject.openFilePath && projectFiles) {
              setImportingPath(importedProject.openFilePath.split('/'));
              setImportingFiles(projectFiles);

              const newItem = findItemByPath(projectFiles, importedProject.openFilePath.split('/'));

              if (newItem && newItem.content) {
                setImportingContent(newItem.content);
              }

              if (importedProject.settings) {
                setImportingSettings(importedProject.settings);
              }

              if (importedProject.title) {
                setImportingTitle(importedProject.title);
              } else {
                setImportingTitle('New Project');
              }
            }
          }

        }
      } catch (error) {
        setImportingPath(null);
        setImportingFiles(false);
        setImportingContent(null);
        setImportingTitle('');

        console.error('Error importing project:', error);
      }
    };
    reader.readAsText(file);
  };
  
  const exportProjectToJson = (fileName:string) => {
    // Add the .json extension if it's not already present
    if (!fileName.endsWith('.json')) {
      fileName += '.json';
    }
  
    // Use getState to grab `files` and `openFilePath` from files state
    const projectData = store.getState().project;
  
    // Convert the project data object into a JSON-formatted string
    const jsonString = JSON.stringify(projectData, null, 2);
  
    // Create a new Blob object containing the JSON string, with the MIME type set to 'application/json'
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a new URL for the Blob
    const url = URL.createObjectURL(blob);
  
    // Create and configure a temporary anchor element to initiate the download
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
  
    // Add the anchor to the document, initiate the download, and remove the anchor
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const exportProjectToHtml = (fileName: string) => {
    // Add the .html extension if it's not already present
    if (!fileName.endsWith('.html')) {
      fileName += '.html';
    }
  
    // Use getState to grab `files` from files state
    const projectData = store.getState().project;
  
    // Recursive function to generate HTML from files
    const generateHtml = (items: ProjectFile[], depth = 1): string => {
      let html = '';
      items.forEach(item => {
        let headingLevel = depth < 6 ? depth : 6; // Heading level doesn't go beyond h6
  
        if (item.type === 'folder') {
          html += `<h${headingLevel}>${item.name}</h${headingLevel}>\n`;
          if (item.children) {
            html += generateHtml(item.children, depth + 1); // Increase depth for children
          }
        } else if (item.type === 'file' && item.subType === 'document') {
          html += `<section>\n<h${headingLevel}>${item.name}</h${headingLevel}>\n`;
          if (item.content) {
            html += item.content;
          }
          html += `</section>\n`;
        }
      });
      return html;
    };
  
    // Generate HTML content
    const htmlContent = generateHtml(projectData.files);
  
    // Create a new Blob object containing the HTML content, with the MIME type set to 'text/html'
    const blob = new Blob([htmlContent], { type: 'text/html' });
  
    // Create a new URL for the Blob
    const url = URL.createObjectURL(blob);
  
    // Create and configure a temporary anchor element to initiate the download
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
  
    // Add the anchor to the document, initiate the download, and remove the anchor
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
    
  const handleImportClose = () => {
    setImportOptionsOpen(false);
    setImportingContent(null);
    setImportingFiles(false);
    setImportingPath(null);
  };

  const handleExportClose = () => {
    setExportOptionsOpen(false);
  };

  const handleImportReady = (options:ImportingOptions) => {
    if (options.items) {
      dispatch(setFiles(options.items));

      if (importingPath) {
        const openItem = findItemByPath(options.items, importingPath);
        if (openItem) {
          dispatch(setOpenFilePath(importingPath.join('/')));
          if (importingContent) {
            handleEditorChange(importingContent);
          }
        } else {
          dispatch(setOpenFilePath(''));
          handleEditorChange('');
        }
      }

      if (importingTitle) {
        dispatch(setProjectTitle(importingTitle));
      } else {
        dispatch(setProjectTitle('New Project'));
      }
    }

    handleImportClose();
  }

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

  const ImportButton = ({callback}: {callback: () => void}) => (
    <Button onClick={() => {
      callback();
      setImportOptionsOpen(true);
    }} color="primary" variant="contained">
      Import...
    </Button>
  );

  const ExportButton = () => (
    <Button onClick={() => {
      setExportOptionsOpen(true);
    }} color="primary" variant="contained">
      Export...
    </Button>
  );

  const ImportDialog = () => (
    <ImportOptions 
      files={importingFiles || []}
      title={importingTitle || 'New Project'}
      onReady={handleImportReady}
      optionsOpen={Boolean(importOptionsOpen && importingFiles)}
      onClose={handleImportClose}
     />
  );

  const ExportDialog = () => (
    <ExportOptions 
      onReady={handleExportReady}
      optionsOpen={Boolean(exportOptionsOpen)}
      onClose={handleExportClose}
     />
  );

  return { importProjectFromJson, handleUpload, ExportOptions: ExportDialog, setExportOptionsOpen, ImportButton, ExportButton, ImportOptions: ImportDialog, setNewProjectOpen, newProjectOpen }
};

export default useProject;