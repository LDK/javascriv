import { Dialog, DialogContent, DialogContentText, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions, Tooltip } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { ProjectFile } from "../Project/ProjectTypes";
import { addItem, findItemByPath, getOpenFolder, selectFiles, setContent, setOpenFilePath, setOpenFolder } from "../redux/projectSlice";
import { FileType, findParentFolder, ROOTFOLDER, SubType } from "./ProjectBrowser";
import { getFolders } from "./useBrowserDialog";
import { Editor } from "tinymce";

type NewFileDialogProps = {
  open: boolean;
  onClose: () => void;
  openFilePath: string;
  fileType: FileType;
  subType: SubType;
  editor: Editor;
}

const NewFileDialog = ({ 
    open, onClose, fileType, subType, openFilePath, editor 
  }: NewFileDialogProps) => {

  const openFolder = useSelector(getOpenFolder) || null;

  const items = useSelector(selectFiles);
  const itemName = fileType === 'file' ? subType as string : 'folder';
  const [newItemName, setNewItemName] = useState('');
  const [parentFolder, setParentFolder] = useState<string | null>(openFolder);
  const [siblings, setSiblings] = useState<ProjectFile[]>([]);
  const [hasTwin, setHasTwin] = useState(false);
  const [disabledReason, setDisabledReason] = useState<string>('');
  const submitDisabled = !newItemName || hasTwin;

  const dispatch = useDispatch();
  
  const handleCreateNewFile = () => {
    const newPath = `${parentFolder}/${newItemName}`.replace('<root>/','').replace('<root>', '')
    
    const newItem:ProjectFile = {
      name: newItemName,
      path: newPath,
      type: fileType as 'file' | 'folder',
      subType: subType || undefined,
      content: fileType === 'file' ? '<p></p>' : undefined,
    };

    dispatch(addItem({path: newPath, item: newItem}));
    dispatch(setOpenFilePath(newPath));
    handleClose();
  };

  const handleClose = () => {
    onClose();
  }

  const handleOpen = useCallback(() => {
    setNewItemName('');
    setDisabledReason('');
    setParentFolder(openFolder);
    setHasTwin(false);
    setSiblings([]);
  }, [openFolder]);

  useEffect(() => {
    if (open) {
      handleOpen();
    }
  }, [open, handleOpen]);

  useEffect(() => {
    if (submitDisabled) {
      if (!newItemName) {
        setDisabledReason('Please enter a name');
      } else if (hasTwin) {
        setDisabledReason(`A ${itemName} with this name already exists`);
      }
    } else {
      setDisabledReason('');
    }
  }, [hasTwin, itemName, newItemName, submitDisabled]);

  useEffect(() => {
    const openItem = openFilePath ? findItemByPath(items, openFilePath.split('/')) : null;
    let newFolder = openItem?.type === 'folder' ? openItem.path : findParentFolder(openFilePath?.split('/') || []);

    if (newFolder.startsWith('/')) {
      newFolder = newFolder.slice(1);
    }

    if (newFolder !== openFolder) {
      console.log('setting open folder', newFolder, 'from', openFolder);
      dispatch(setOpenFolder(newFolder));
      if (!open) {
        setParentFolder(newFolder);
      }
    }
  }, [openFilePath, open, openFolder, dispatch, items]);

  useEffect(() => {
    if (!open) {
      setParentFolder(openFolder);
    }
  }, [open, openFolder, setParentFolder]);

  useEffect(() => {
    if (open) {
      // Update the content in the file tree of the open path
      const existing = findItemByPath(items, openFilePath.split('/'));
      const content = editor.getContent();

      if (existing && content && content !== existing.content) {
        dispatch(setContent({path: openFilePath, content: editor.getContent()}));
      }
    }
  }, [open, editor, dispatch, items, openFilePath]);

  useEffect(() => {
    const parentItem = findItemByPath(items, parentFolder?.split('/') || []);

    if (parentItem) {
      setSiblings(parentItem.children || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentFolder, open]);

  useEffect(() => {
    if (siblings.length) {  
      const existing = siblings.find(s => s.name === newItemName);
      setHasTwin(Boolean(existing));
    } else {
      setHasTwin(false);
    }
  }, [newItemName, siblings, open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please enter the name of the new {itemName} and select the parent folder.
        </DialogContentText>
        <TextField
          sx={{ my : 1 }}
          color="info"
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          required={true}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <FormControl fullWidth margin="dense" color="info">
          <InputLabel id="parent-folder-label">Parent Folder</InputLabel>
          <Select
            labelId="parent-folder-label"
            value={parentFolder}
            defaultValue={openFolder}
            label="Parent Folder"
            onChange={(e) => setParentFolder(e.target.value)}
          >
            <MenuItem value={ROOTFOLDER}>
              <em>{ROOTFOLDER}</em>
            </MenuItem>

            {getFolders(items).map((item) => {
              if (item.type === 'folder') {
                return (
                  <MenuItem key={item.path} value={item.path}>{item.name}</MenuItem>
                );
              }
              return null;
            })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <CancelButton onClick={handleClose} />

        <Tooltip title={disabledReason || ''}>
          <span>
            <ConfirmButton disabled={submitDisabled} onClick={handleCreateNewFile} label="Create" />
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

export default NewFileDialog;