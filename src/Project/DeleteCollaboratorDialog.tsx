// Project/AddCollaboratorDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import useDialogUI from '../theme/useDialogUI';
import axios from 'axios';
import { ProjectListing, ProjectState } from './ProjectTypes';
import { AppUser, UserState } from '../redux/userSlice';

type DeleteCollaboratorDialogProps = {
  open: boolean;
  onClose: () => void;
  currentProject?: ProjectState | ProjectListing;
  user: UserState;
  collaborator?: AppUser;
};

const DeleteCollaboratorDialog: React.FC<DeleteCollaboratorDialogProps> = ({ open, onClose, user, currentProject, collaborator }) => {
  const { DialogActionButtons } = useDialogUI();
  const [error, setError] = useState<string | false>(false);

  if (!user || !user.token) {
    return null;
  }

  if (!collaborator || !collaborator.id) {
    return null;
  }

  if (!currentProject || !currentProject.id) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    const AuthStr = 'Bearer ' + user.token;
    const deleteUrl = process.env.REACT_APP_API_URL + '/project/' + currentProject.id + '/collaborator/' + collaborator.id;

    axios.delete(deleteUrl, { headers: { Authorization: AuthStr } })
      .then((response) => {        
        console.log('response', response);
        if (response.data.success) {
          onClose();
          setError(false);
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        setError('An error occurred while deleting collaborator.');
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'sm'} PaperProps={{ style: { height: '30vh' }}}>
      <DialogTitle>Remove Collaborator from Project</DialogTitle>
      <Divider />
      <DialogContent>
        Remove <Typography fontWeight={700} component="span">{collaborator.username}</Typography> as collaborator from <Typography fontWeight={700} component="span">{currentProject.title}</Typography>?
      </DialogContent>

      <DialogActionButtons
        padding
        onCancel={handleClose}
        onConfirm={handleConfirm}
        confirmLabel="Delete Collaborator"
      />

    </Dialog>
  );
};

export default DeleteCollaboratorDialog;
