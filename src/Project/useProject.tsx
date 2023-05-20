// Project/useProject.tsx

import { Box, Button, Dialog, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { BrowserItem, FileTreeState, findItemByPath, setFiles, setOpenFilePath } from "../redux/filesSlice";
import { store } from "../redux/store";
import JSZip from 'jszip';
import { getFullTree } from "../Convert/scrivener/scrivener";
import ImportOptions, { ImportingOptions } from "./ImportOptions";
import { renameTwins } from "./projectUtils";

export interface XmlIndex {
  [id:string]: string;
}

const useProject = (handleEditorChange:((content: string) => void)) => {
  const dispatch = useDispatch();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importOptionsOpen, setImportOptionsOpen] = useState(false);
  const [importingPath, setImportingPath] = useState<string[] | null>(null);
  const [importingFiles, setImportingFiles] = useState<BrowserItem[] | false>(false);
  const [importingContent, setImportingContent] = useState<string | null>(null);

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
  
  const ExportDialog = () => (
    <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
    <DialogTitle>Export Current Project</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter the file name for the exported project (the extension will be hard-coded to .json):
      </DialogContentText>
      <TextField
        autoFocus
        margin="dense"
        id="projectFileName"
        label="File Name"
        type="text"
        fullWidth
        variant="standard"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            exportProject((e.target as HTMLInputElement).value);
            setExportDialogOpen(false);
          }
        }}
      />
    </DialogContent>
    <Box p={2} display="flex" justifyContent="flex-end">
      <Button onClick={() => setExportDialogOpen(false)} color="primary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          const input = document.getElementById('projectFileName') as HTMLInputElement;
          exportProject(input.value);
        }}
        color="primary"
      >
        Export
      </Button>
    </Box>
  </Dialog>
  );

  const importProjectFromJson = (file:File) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result;

        if (typeof content === 'string') {
          const importedProject:FileTreeState = JSON.parse(content);

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
            }
          }

        }
      } catch (error) {
        setImportingPath(null);
        setImportingFiles(false);
        setImportingContent(null);

        console.error('Error importing project:', error);
      }
    };
    reader.readAsText(file);
  };
  
  const exportProject = (fileName:string) => {
    // Add the .json extension if it's not already present
    if (!fileName.endsWith('.json')) {
      fileName += '.json';
    }
  
    // Use getState to grab `files` and `openFilePath` from files state
    const projectData = store.getState().files;
  
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

  const ImportButton = ({callback}: {callback: () => void}) => (
    <Button onClick={() => {
      callback();
      setImportOptionsOpen(true);
    }} color="primary" variant="contained">
      Import Project
    </Button>
  );

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
          if (importingContent) {
            handleEditorChange(importingContent);
          }
        } else {
          dispatch(setOpenFilePath(''));
          handleEditorChange('');
        }
      }
    }

    handleImportClose();
  }

  const ImportDialog = () => (
    <ImportOptions files={importingFiles || []} onReady={handleImportReady} optionsOpen={Boolean(importOptionsOpen && importingFiles)} onClose={handleImportClose} />
  );

  return { importProjectFromJson, handleUpload, ExportDialog, setExportDialogOpen, ImportButton, ImportOptions: ImportDialog  };
};

export default useProject;