// Project/AddCollaboratorDialog.tsx
import React, { useState } from 'react';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from '@mui/material';
import useDialogUI from '../theme/useDialogUI';
import axios from 'axios';
import { ProjectState } from './ProjectTypes';
import { UserState } from '../redux/userSlice';

type AddCollaboratorDialogProps = {
  open: boolean;
  onClose: () => void;
  currentProject: ProjectState;
  user: UserState;
};

const AddCollaboratorDialog: React.FC<AddCollaboratorDialogProps> = ({ open, onClose, user, currentProject }) => {
  const { DialogActionButtons } = useDialogUI();
  const [searchText, setSearchText] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | false>(false);

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
    const postUrl = process.env.REACT_APP_API_URL + '/project/' + currentProject.id + '/addCollaborator';
    const payload = {
      search: searchText,
      projectId: currentProject.id,
    };

    axios.post(postUrl, payload, { headers: { Authorization: AuthStr } })
      .then((response) => {
        console.log(response.data);
        setSearching(false);
        
        if (response.data.success) {
          onClose();
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        setSearching(false);
        setError('An error occurred while adding collaborator.');
      }
    );
  };

  const FormBox = ({ children }: { children: React.ReactNode }) => (
    <Box
      mb={2}
      p={2}
      borderRadius={'.25rem'} borderColor="primary.contrastText" sx={{
        borderStyle: 'solid',
        borderWidth: '1px',
        backgroundColor: '#6A6A6A',
      }}>
      {children}
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'md'} PaperProps={{ style: { height: '80vh' }}}>
      <DialogTitle>Add Collaborator to Project</DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormBox>
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
            </FormBox>
          </Grid>
        </Grid>
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
