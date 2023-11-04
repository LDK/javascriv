// Project/AddFontDialog.tsx
import React, { useState } from 'react';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, TextField, Typography } from '@mui/material';
import useDialogUI from '../theme/useDialogUI';
import axios from 'axios';
import { ProjectListing, ProjectState } from './ProjectTypes';
import { UserState } from '../redux/userSlice';

type AddFontDialogProps = {
  open: boolean;
  onClose: () => void;
  user: UserState;
};

const AddFontDialog: React.FC<AddFontDialogProps> = ({ open, onClose, user }) => {
  const { DialogActionButtons } = useDialogUI();
  const [name, setName] = useState<string>('');
  const [regular, setRegular] = useState<string>('');
  const [bold, setBold] = useState<string>('');
  const [italic, setItalic] = useState<string>('');
  const [boldItalic, setBoldItalic] = useState<string>('');
  const [error, setError] = useState<string | false>(false);

  if (!user || !user.token) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    const AuthStr = 'Bearer ' + user.token;
    const postUrl = process.env.REACT_APP_API_URL + '/font';

    const payload = {
      name, regular, bold, italic, boldItalic
    };

    axios.post(postUrl, payload, { headers: { Authorization: AuthStr } })
      .then((response) => {
        
        if (response.data.success) {
          onClose();
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        setError('An error occurred while adding font.');
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'sm'} PaperProps={{ style: { height: '80vh' }}}>
      <DialogTitle>Add Custom Font</DialogTitle>
      <Divider />
      <DialogContent>
        <Typography mb={1}>Enter a name and the URLs for the various formats of the font.</Typography>

        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Font Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          autoFocus
          margin="dense"
          id="regular"
          label="Font URL (regular)"
          type="text"
          fullWidth
          value={regular}
          onChange={(e) => setRegular(e.target.value)}
        />

        <TextField
          autoFocus
          margin="dense"
          id="bold"
          label="Font URL (bold)"
          type="text"
          fullWidth
          value={bold}
          onChange={(e) => setBold(e.target.value)}
        />

        <TextField
          autoFocus
          margin="dense"
          id="italic"
          label="Font URL (italic)"
          type="text"
          fullWidth
          value={italic}
          onChange={(e) => setItalic(e.target.value)}
        />

        <TextField
          autoFocus
          margin="dense"
          id="bolditalic"
          label="Font URL (bold italic)"
          type="text"
          fullWidth
          value={boldItalic}
          onChange={(e) => setBoldItalic(e.target.value)}
        />
      </DialogContent>

      <DialogActionButtons
        padding
        onCancel={handleClose}
        onConfirm={handleConfirm}
        confirmLabel="Add Font"
      />

    </Dialog>
  );
};

export default AddFontDialog;
