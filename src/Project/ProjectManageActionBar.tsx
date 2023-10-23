// Browser/ItemActionBar.tsx
import { Box } from "@mui/material";
import { Menu, MenuItem } from '@mui/material';
import React, { useState } from "react";
import { EditButton, UpButton, DownButton, DeleteButton, MoreButton } from "../ProjectBrowser/ItemActionButtons";

type ProjectActionBarProps = {
  index: number;
  count: number;
  onEditClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const ProjectManageActionBar = ({ index, onEditClick, onDuplicate, onDelete }: ProjectActionBarProps) => {
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
    onDuplicate();
  };

  const handleIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Handle the click event for each icon, e.g., delete, edit, move up, move down, and more
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEditClick();
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete();
  };

  return (
      <Box>
        basketball game

      </Box>
  );
};

export default ProjectManageActionBar;
