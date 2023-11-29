// Project/AddCollaboratorDialog.tsx
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, TextField, Typography } from '@mui/material';
import useDialogUI from '../theme/useDialogUI';
import axios from 'axios';
import { ProjectListing, ProjectState } from './ProjectTypes';
import { UserState } from '../redux/userSlice';

type AddCollaboratorDialogProps = {
  open: boolean;
  onClose: () => void;
  currentProject?: ProjectState | ProjectListing;
  user: UserState;
};

const AddCollaboratorDialog: React.FC<AddCollaboratorDialogProps> = ({ open, onClose, user, currentProject }) => {
  const { DialogActionButtons } = useDialogUI();
  const [searchText, setSearchText] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | false>(false);

  useEffect(() => {
    console.log('AddCollaboratorDialog open', open);
  }, [open]);


  if (!user || !user.token) {
    return null;
  }

  if (!currentProject || !currentProject.id) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    setSearching(true);

    const AuthStr = 'Bearer ' + user.token;
    const patchUrl = process.env.REACT_APP_API_URL + '/project/' + currentProject.id + '/collaborator';

    const payload = {
      search: searchText
    };

    axios.patch(patchUrl, payload, { headers: { Authorization: AuthStr } })
      .then((response) => {
        setSearching(false);
        
        if (response.data.success) {
          onClose();
        } else {
          setError(response.data.message);
        }
      })
      .catch(() => {
        setSearching(false);
        setError('An error occurred while adding collaborator.');
      }
    );
  };

  return (
    <Dialog id="add-collab-dialog" open={open} onClose={handleClose} fullWidth={true} maxWidth={'sm'} PaperProps={{ style: { height: '40vh' }}}>
      <DialogTitle>Add Collaborator to Project</DialogTitle>
      <Divider />
      <DialogContent>
          <Typography mb={1}>Enter the username or e-mail address of the user you wish to invite to collaborate.</Typography>

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Username or E-mail Address"
            type="text"
            fullWidth
            disabled={searching}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
      </DialogContent>

      <DialogActionButtons
        padding
        onCancel={handleClose}
        onConfirm={handleConfirm}
        confirmLabel="Add Collaborator"
        confirmDisabled={searching || !searchText}
      />

      <Box className="dialog-overlay" sx={{ display: searching ? 'flex' : 'none' }}
        position="absolute" top="0" left="0" width="100%" height="100%" bgcolor="rgba(0,0,0,0.5)"
        alignItems="center" justifyContent="center" zIndex={1000}
      >
        <CircularProgress color="info" />
      </Box>
    </Dialog>
  );
};

export default AddCollaboratorDialog;
