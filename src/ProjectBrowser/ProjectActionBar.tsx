// Browser/ProjectActionBar.tsx
import { Box } from "@mui/material";
import React, { useState } from "react";
import { EditButton } from "./ItemActionButtons";

type ProjectActionBarProps = {
  onEditClick: () => void;
};

const ProjectActionBar = ({ onEditClick }: ProjectActionBarProps) => {
  const handleIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Handle the click event for each icon, e.g., delete, edit, move up, move down, and more
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEditClick();
  };

  return (
    <Box 
      onClick={handleIconClick}
      ml="auto"
      display="flex"
      alignItems="center"
      position="absolute"
      textAlign="right"
      width="3rem"
      right="1rem"
      top="0"
    >
      <EditButton action={handleEditClick} />
    </Box>
  );
};

export default ProjectActionBar;
