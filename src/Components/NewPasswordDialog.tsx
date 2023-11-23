// Header/LoginRegisterDialog.tsx
import React, { useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Divider, Grid, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { UserState, clearUser, setUser } from '../redux/userSlice';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import NewPasswordForm from './NewPasswordForm';
import { useNavigate } from 'react-router-dom';
import { resetProject } from '../redux/projectSlice';

type LoginRegisterDialogProps = {
  open: boolean;
  onClose: () => void;
  token?: string;
};

const NewPasswordDialog: React.FC<LoginRegisterDialogProps> = ({ open, onClose, token }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
    onClose();
  };

  if (!token) { return <></>; }

  dispatch(clearUser());
  dispatch(resetProject());

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'sm'}>
      <DialogTitle>Set a new password</DialogTitle>

      <Divider />

      <DialogContent sx={{ height: '65vh' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box width="100%" pt={4} pb={2}>
              <NewPasswordForm
                buttonVariant="contained"
                inputVariant="filled"
                loading={loading}
                callback={(user:UserState) => {
                  dispatch(setUser(user));
                  navigate('/');
                }}
                onCancel={handleClose}
                token={token}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default NewPasswordDialog;
