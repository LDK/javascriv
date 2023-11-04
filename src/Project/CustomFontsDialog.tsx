import { Dialog, DialogContent, DialogContentText, DialogActions, useTheme, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { ConfirmButton } from "../Components/DialogButtons";
import { SetOpenFunction } from "../ProjectBrowser/useBrowserDialog";
import axios from "axios";
import useUser from "../User/useUser";
import { isFunction } from "@mui/x-data-grid/internals";
import { DeleteButton } from "../ProjectBrowser/ItemActionButtons";
import { UserState } from "../redux/userSlice";
import AddFontDialog from "./AddFontDialog";
import DeleteFontDialog from "./DeleteFontDialog";
import EditFontDialog from "./EditFontDialog";
import { fonts } from "pdfmake/build/pdfmake";

type CustomFontsDialogProps = {
  open: boolean;
  setOpen : (arg: boolean) => void;
  onClose: () => void;
  callback?: () => void;
}

export type CustomFont = {
  user: UserState;
  name: string;
  regular?: string;
  bold?: string;
  italic?: string;
  boldItalic?: string;
  id: number;
};

const CustomFontsDialog = ({ open, setOpen, onClose, callback }: CustomFontsDialogProps) => {
  const theme = useTheme();
  const { user } = useUser({});
  const AuthStr = `Bearer ${user.token}`;

  const [fontsData, setFontsData] = useState<CustomFont[]>(user?.fonts || []);
  const [addFontOpen, setAddFontOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState<CustomFont | false>(false);
  const [editOpen, setEditOpen] = useState<CustomFont | false>(false);

  const fetchFonts = () => {
    console.log('fetch fonts');
    if (!user || !open) {
      return;
    }
    axios.get(`${process.env.REACT_APP_API_URL}/user/fonts`, { headers: { Authorization: AuthStr } }).then(res => {
      setFontsData(res.data);
    });
  };

  useEffect(() => {
    if (open && user) {
      console.log('user and open', fontsData);
      if (!fontsData || !fontsData.length) {
        fetchFonts();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, fontsData]);

  const handleSaveClick = () => {
    if (!user || !user.token) {
      return;
    }
    
    setOpen(false);
  };

  const mode = theme.palette.mode;

  const AddFontButton = () => <Button onClick={(e) => {
    e.currentTarget.blur(); // Remove focus from the button
    setAddFontOpen(true);
  }}>Add Font</Button>;

  const handleAdd = () => {
    setAddFontOpen(false);
    if (callback && isFunction(callback)) {
      callback();
    }
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    if (callback && isFunction(callback)) {
      callback();
    }
  }

  const handleEdit = () => {
    setEditOpen(false);
    if (callback && isFunction(callback)) {
      callback();
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText>
          Custom Fonts
        </DialogContentText>

        {(!fontsData) ? <Typography>No fonts have been added yet.</Typography> : (
          <ul>
            {fontsData.map((font, i) => (
              <li key={i}>{font.name} <DeleteButton action={(e) => { 
                e.stopPropagation();
                setDeleteOpen(font);
              }} /></li>
            ))}
          </ul>
        )}

        <AddFontButton />
      </DialogContent>

      <DialogActions>
        <ConfirmButton onClick={handleSaveClick} {...{ mode }} label="Done" />
      </DialogActions>

      <AddFontDialog 
        {...{user}}
        open={addFontOpen}
        onClose={handleAdd} 
      />

      <DeleteFontDialog
        {...{user}}
        font={deleteOpen || undefined}
        open={Boolean(deleteOpen)}
        onClose={handleDelete}
        setOpen={setDeleteOpen as SetOpenFunction}
      />

      <EditFontDialog
        {...{user}}
        font={editOpen || undefined}
        open={Boolean(editOpen)}
        onClose={handleEdit}
        setOpen={setEditOpen as SetOpenFunction}
      />
    </Dialog>
  );
}

export default CustomFontsDialog;