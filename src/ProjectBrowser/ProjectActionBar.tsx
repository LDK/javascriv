// Browser/ProjectActionBar.tsx
import { Box } from "@mui/material";
import React from "react";
import { CloseButton, EditButton, RefreshButton } from "./ItemActionButtons";
import { ProjectState } from "../Project/ProjectTypes";

type ProjectActionBarProps = {
  onEditClick: () => void;
  onRefreshClick: () => void;
  currentProject: ProjectState;
  onClose?: () => void;
};

const ProjectActionBar = ({ onEditClick, onRefreshClick, currentProject, onClose }: ProjectActionBarProps) => {
  const handleIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Handle the click event for each icon, e.g., delete, edit, move up, move down, and more
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEditClick();
  };

  const handleRefreshClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Reload project from server
    onRefreshClick();
  };

  const handleClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClose && onClose();
  }

  return (
    <Box 
      onClick={handleIconClick}
      ml="auto"
      display="flex"
      alignItems="center"
      position="absolute"
      textAlign="right"
      width={{ xs: 'auto', md: "3rem" }}
      right={{ xs: '1rem', md: ".5rem"}}
      top={{ xs: '.5rem', md: '.5rem' }}
      className="project-action-bar"
    >
      <EditButton action={handleEditClick} />
      {(currentProject && currentProject.id) && <RefreshButton action={handleRefreshClick} />}
      {onClose && <CloseButton action={handleClose} />}
    </Box>
  );
};

export default ProjectActionBar;
