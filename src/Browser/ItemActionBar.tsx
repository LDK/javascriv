// Browser/ItemActionBar.tsx
import { Box } from "@mui/material";
import { Menu, MenuItem } from '@mui/material';
import React, { useState } from "react";
import { BrowserItem } from "../redux/filesSlice";
import { EditButton, UpButton, DownButton, DeleteButton, MoreButton } from "./ItemActionButtons";

const ItemActionBar = ({ item }:{ item:BrowserItem }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    // Handle duplicate action here
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

  return (
    <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center", visibility: "hidden" }}>
      <EditButton action={handleIconClick} />
      <UpButton action={handleIconClick} />
      <DownButton action={handleIconClick} />
      <DeleteButton action={handleIconClick} />
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
  );
};

export default ItemActionBar;