// Project/useProject.tsx

import { Box, Button, Dialog, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FileTreeState, findItemByPath, setFiles, setOpenFilePath } from "../redux/filesSlice";
import { store } from "../redux/store";

const useProject = (handleEditorChange:((content: string) => void)) => {
  const dispatch = useDispatch();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

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
  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
  
          if (typeof content === 'string') {
            const importedProject:FileTreeState = JSON.parse(content);
  
            if (importedProject) {
              if (importedProject.openFilePath && importedProject.files) {
                dispatch(setOpenFilePath(importedProject.openFilePath));
                dispatch(setFiles(importedProject.files));
  
                const newItem = findItemByPath(importedProject.files, importedProject.openFilePath.split('/'));
  
                if (newItem && newItem.content) {
                //   documentClick(newItem.content, false);
                  handleEditorChange(newItem.content);
                }
              }
            }

          }
        } catch (error) {
          console.error('Error importing project:', error);
        }
      };
      reader.readAsText(file);
    }
  
    // Reset the file input value so the same file can be imported again if needed
    if (event.target) {
      event.target.value = '';
    }
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

  return { importProject, ExportDialog, setExportDialogOpen };
};

export default useProject;