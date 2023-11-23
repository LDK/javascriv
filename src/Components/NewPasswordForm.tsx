import { Box, DialogActions, SxProps, TextField, TextFieldVariants, Tooltip, Typography } from '@mui/material';
import * as yup from 'yup';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import useDialogUI from '../theme/useDialogUI';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { isFunction } from '@mui/x-data-grid/internals';
import { CancelButton, ConfirmButton } from './DialogButtons';

type NewPasswordOptions = {
  inputVariant?: TextFieldVariants;
  buttonVariant?: "contained" | "outlined" | "text";
  buttonSx?: SxProps;
  callback: (data: any) => void;
  onCancel?: () => void;
  loading: boolean;
  token: string;
};

const NewPasswordForm = ({ onCancel, token, callback, ...options }: NewPasswordOptions) => {
  const inputVariant:TextFieldVariants = options.inputVariant || "outlined";
  const { DialogActionButtons } = useDialogUI();

  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  useEffect(() => {
    const pwChanged = Boolean(newPassword.length || newPasswordConfirm.length);
    const passwordLengthError = 'Password must be at least 8 characters long.';
    const passwordMatchError = 'Passwords do not match.';
    const noPasswordError = 'Please enter a password.';

    if (newPassword.length < 8 && pwChanged) {
      if (!formErrors.includes(passwordLengthError)) {
        setFormErrors([...formErrors, passwordLengthError]);
      }
    } else if (formErrors.includes(passwordLengthError)) {
      setFormErrors(formErrors.filter(err => err !== passwordLengthError));
    }

    if (pwChanged && newPassword !== newPasswordConfirm) {
      if (!formErrors.includes(passwordMatchError)) {
        setFormErrors([...formErrors, passwordMatchError]);
      }
    } else if (formErrors.includes(passwordMatchError)) {
      setFormErrors(formErrors.filter(err => err !== passwordMatchError));
    }

    if (!pwChanged) {
      if (!formErrors.includes(noPasswordError)) {
        setFormErrors([...formErrors, noPasswordError]);
      }
    } else if (formErrors.includes(noPasswordError)) {
      setFormErrors(formErrors.filter(err => err !== noPasswordError));
    }
  }, [newPassword, newPasswordConfirm, formErrors]);

  type NewPasswordPayload = {
    newPassword?: string;
    newPasswordConfirm?: string;
  }

  const schema = yup.object().shape({
    newPassword: yup.string().required(),
    newPasswordConfirm: yup.string().required(),
  });

  const methods = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = (data: any) => {
    const AuthStr = `Bearer ${token}`;
    const postUrl = `${process.env.REACT_APP_API_URL}/user/new-password`;

    axios.post(postUrl, data, { headers: { Authorization: AuthStr } }).then(res => {
      if (res.data.id && res.data.token) {
        callback(res.data);
      }
    })
    .catch(err => {
      console.log('err', err);
    });
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "start" }} textAlign="left">
          <Typography variant="body2" sx={{ marginBottom: "1rem" }}>Enter and confirm your new password below.</Typography>

          <TextField
              sx={{ mb: 2 }}
              fullWidth
              id="settings-new-password"
              label="New Password"
              value={newPassword}
              type="password"
              autoComplete="new-password"
              inputProps={{ 
                id: 'settings-new-password',
                minLength: 8,
                autoComplete: 'new-password'
              }}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <TextField
              fullWidth
              id="settings-new-password-confirm"
              label="Confirm New Password"
              value={newPasswordConfirm}
              type="password"
              autoComplete="new-password"
              inputProps={{ 
                id: 'settings-new-password-confirm',
                minLength: 8,
                autoComplete: 'new-password'
              }}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />

          <DialogActions sx={{ px: 0, py: 3, textAlign: 'right', width: '100%' }}>
            <CancelButton onClick={onCancel} />
            <Tooltip title={formErrors.length ? formErrors.join("\n") : ''}>
              <span>
                <ConfirmButton 
                  disabled={Boolean(formErrors.length)} 
                  onClick={() => { onSubmit({ newPassword, newPasswordConfirm }) }}
                  label="Change Password" 
                />
              </span>
            </Tooltip>
          </DialogActions>

        </Box>
      </form>
    </FormProvider>
  );
}

export default NewPasswordForm;