import { Dialog, DialogContent, DialogContentText, DialogActions, useTheme, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../Components/DialogButtons";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import axios from "axios";
import useUser from "../User/useUser";
import { isFunction } from "@mui/x-data-grid/internals";
import { CustomFont } from "./CustomFontsDialog";

type EditFontDialogProps = {
  open: boolean;
  setOpen: SetOpenFunction;
  onClose: () => void;
  font?: CustomFont;
  callback?: (id?: number) => void;
}
  
const EditFontDialog = ({ open, setOpen, onClose, font, callback }: EditFontDialogProps) => {
  const theme = useTheme();
  const { user } = useUser({});
  const AuthStr = `Bearer ${user.token}`;

  const [fontName, setFontName] = useState<string>(font?.name || '');

  const handleSaveClick = () => {
    // console.log('rename project', project?.id, projectName);
    if (!font || !font.id || !user || !user.token) {
      return;
    }

    const patchUrl = `${process.env.REACT_APP_API_URL}/font/${font.id}`;
  
    axios.patch(patchUrl, { headers: { Authorization: AuthStr } }).then(res => {
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
      <DialogTitle id="alert-dialog-title">Edit Font</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Editing
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleSaveClick} {...{ mode }} disabled={!fontName} label="Edit Project" />
      </DialogActions>    
    </Dialog>
  );
}

export default EditFontDialog;