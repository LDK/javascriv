import { TextField, DialogActions, Tooltip, Box, useTheme, Typography, Divider, Grid, FormControl, InputLabel, Select, MenuItem, Autocomplete } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { UserState, setUser } from "../redux/userSlice";
import SettingBox from "../Components/SettingBox";
import axios from "axios";
import { useDispatch } from "react-redux";
import { usePublishingOptions } from "../Publish/PublishOptions";
import { EditorFont, editorFonts } from "../Editor/EditorFonts";

type UserSettingsScreenProps = {
  open: boolean;
  onClose: () => void;
  user: UserState;
};

const UserSettingsScreen = ({ open, onClose, user }: UserSettingsScreenProps) => {
  const [username, setUsername] = useState<string>(user.username || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');

  const [font, setFont] = useState<EditorFont>(user.fontOptions?.font || { name: 'Roboto', value: 'Roboto' });
  const [fontSize, setFontSize] = useState<number>(user.fontOptions?.fontSize || 12);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  const theme = useTheme();
  const isDark = (theme.palette.mode === 'dark');

  const dispatch = useDispatch();

  const handleOpen = () => {
    if (formErrors.length) {
      setFormErrors([]);
    }
  }

  const handleClose = () => {
    onClose();
    setFormErrors([]);
  }

  type UserPatchPayload = {
    username?: string;
    newPassword?: string;
    newPasswordConfirm?: string;
    publishOptions?: {
      pageBreaks: string;
      pageNumberPosition: string;
      includeToC: boolean;
      displayDocumentTitles: boolean;
    };
    fontOptions?: {
      font: EditorFont;
      fontSize: number;
    };
  }

  const handleSave = () => {
    let payload:UserPatchPayload = {
      publishOptions: { 
        pageBreaks,
        pageNumberPosition,
        includeToC: Boolean(includeToC),
        displayDocumentTitles: Boolean(displayDocumentTitles)
      },
      fontOptions: {
        font,
        fontSize
      }
    };

    if (newPassword.length) {
      payload = {
        ...payload,
        newPassword,
        newPasswordConfirm
      };
    }

    if (username.length && username !== user.username) {
      payload = {
        ...payload,
        username
      };
    }

    if (!formErrors.length) {
      const AuthStr = 'Bearer ' + user.token;
      const patchUrl = `${process.env.REACT_APP_API_URL}/user`;
  
      axios.patch(patchUrl, payload, { headers: { Authorization: AuthStr } })
        .then(res => {
          if (res.data && res.data.username && res.data.token && res.data.id) {
            dispatch(setUser({
              id: res.data.id,
              username: res.data.username,
              email: res.data.email,
              publishingOptions: res.data.publishOptions,
              fontOptions: res.data.fontOptions,
              token: res.data.token
            }));
          }
          
          handleClose();
        })
        .catch(err => {
          console.error('user settings save error', err);
        }
      );
    }
  }

  const {
    PageBreaksSelect, PageNumberPositionSelect, DisplayDocumentTitlesSelect, IncludeToCSelect,
    pageBreaks, pageNumberPosition, includeToC, displayDocumentTitles,
    setPageBreaks, setPageNumberPosition, setIncludeToC, setDisplayDocumentTitles
  } = usePublishingOptions(user?.publishingOptions || undefined);

  // useEffect(() => {
  //   if (open) {
  //     handleOpen();
  //   }
  // }, [open]);
  
  useEffect(() => {
    const usernameLengthError = 'Username must be at least 3 characters long.';

    if (username.length < 3) {
      if (!formErrors.includes(usernameLengthError)) {
        setFormErrors([...formErrors, usernameLengthError]);
      }
    } else {
      if (formErrors.includes(usernameLengthError)) {
        setFormErrors(formErrors.filter(err => err !== usernameLengthError));
      }
    }
  }, [username, formErrors]);

  useEffect(() => {
    const pwChanged = Boolean(newPassword.length || newPasswordConfirm.length);
    const passwordLengthError = 'Password must be at least 8 characters long.';
    const passwordMatchError = 'Passwords do not match.';

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
  }, [newPassword, newPasswordConfirm, formErrors]);

  if (!user || !user.id) {
    return null;
  }

  const handleUsername = (e:React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <Box width="100%" position="relative" overflow={{ overflowY: 'scroll', overflowX: 'hidden' }} height="calc(100vh - 64px)" p={4} display={ open ? 'block' : 'none' } sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}>
      <Typography mb={1}>User Settings</Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>User Details</Typography>

          <SettingBox>
            <TextField
              sx={{ mb: 2 }}
              fullWidth
              id="settings-username"
              label="Username"
              value={username}
              onChange={handleUsername}
            />

            {user.email && <Typography mb={2}>E-mail: {user.email}</Typography>}

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>Change Password</Typography>

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
          </SettingBox>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>Default Font Options</Typography>
            <SettingBox>
              <Typography mb={1}>Default Font</Typography>
              <Autocomplete
                value={font}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFont(newValue);
                  }
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                options={editorFonts}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} />}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > *': { mr: 2 } }} {...props}>
                    <span style={{ fontFamily: option.value }}>{option.name}</span>
                  </Box>
                )}
              />
            </SettingBox>

            <SettingBox>
              <Typography mb={1}>Default Font Size</Typography>
              
              <Autocomplete
                value={fontSize}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFontSize(newValue);
                  }
                }}
                options={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]}
                getOptionLabel={(option) => option.toString()}
                renderInput={(params) => <TextField {...params} />}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > *': { mr: 2 } }} {...props}>
                    <span style={{ fontFamily: font.value, fontSize: option }}>{option}</span>
                  </Box>
                )}
              />

            </SettingBox>

        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>Default Publishing Options</Typography>

          <SettingBox>
            <PageBreaksSelect />
            <PageNumberPositionSelect />
            <DisplayDocumentTitlesSelect />
            <IncludeToCSelect />
          </SettingBox>

        </Grid>
      </Grid>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <CancelButton onClick={handleClose} />
        <Tooltip title={formErrors.length ? formErrors.join("\n") : ''}>
          <span>
            <ConfirmButton disabled={Boolean(formErrors.length)} onClick={handleSave} label="Save Changes" />
          </span>
        </Tooltip>
      </DialogActions>

    </Box>
  );
}

export default UserSettingsScreen;