// Browser/ItemActionBar.tsx
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { Menu, MenuItem } from '@mui/material';
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { BrowserItem, deleteItem } from "../redux/filesSlice";
import { EditButton, UpButton, DownButton, DeleteButton, MoreButton } from "./ItemActionButtons";

type ItemActionBarProps = {
  item: BrowserItem;
  onEditClick: () => void;
  onDuplicate: () => void;
};

const ItemActionBar = ({ item, onEditClick, onDuplicate }: ItemActionBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch();

  const handleMoreClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDuplicate = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDuplicate();
  };

  const handleMoveTo = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    // Handle move to action here
  };

  const handleIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Handle the click event for each icon, e.g., delete, edit, move up, move down, and more
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEditClick();
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteItem(item.path));
    setDeleting(false);
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleting(true);
  };

  const handleDeleteCancel = () => {
    setDeleting(false);
  };

  return (
    <>
      <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center", visibility: "hidden" }}>
        <EditButton action={handleEditClick} />
        <UpButton action={handleIconClick} />
        <DownButton action={handleIconClick} />
        <DeleteButton action={handleDeleteClick} />
        <MoreButton action={handleMoreClick} />


        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                zIndex: 0,
                transform: 'translateY(-50%) rotate(45deg)',
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
          <MenuItem onClick={handleMoveTo}>Move to...</MenuItem>
        </Menu>
      </Box>

      <Dialog
        open={deleting}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to delete {item.path}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ItemActionBar;
