import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, useTheme, Typography, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import axios from "axios";
import useUser from "../User/useUser";
import { isFunction } from "@mui/x-data-grid/internals";
import { CustomFont } from "./CustomFontsDialog";

type DeleteFontDialogProps = {
  open: boolean;
  setOpen : SetOpenFunction;
  onClose: () => void;
  callback?: (id?: number) => void;
  font?: CustomFont;
}
  
const DeleteFontDialog = ({ open, setOpen, onClose, callback, font }: DeleteFontDialogProps) => {
  const theme = useTheme();
  const { user } = useUser({});
  const AuthStr = `Bearer ${user.token}`;

  const [fontName, setFontName] = useState<string>(font?.name || '');

  const handleDeleteClick = () => {
    if (!user || !user.token) {
      return;
    }

    if (!font || !font.id) {
      return;
    }

    const deleteUrl = `${process.env.REACT_APP_API_URL}/font/${font.id}`;
  
    axios.delete(deleteUrl, { headers: { Authorization: AuthStr } }).then(res => {
      if (font && font.id && isFunction(callback)) {
        callback(font.id);
      }
    });

    
    setOpen(false);
  };

  useEffect(() => {
    if (open && font) {
      setFontName(font.name || '');
    }
  }, [open, font]);

  const mode = theme.palette.mode;

  if (!font) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you really want to delete custom font "{font.name}"?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleDeleteClick} {...{ mode }} disabled={!fontName} label="Delete Font" />
      </DialogActions>    
    </Dialog>
  );
}

export default DeleteFontDialog;