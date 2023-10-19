// Browser/ProjectActionBar.tsx
import { Box } from "@mui/material";
import React from "react";
import { EditButton, RefreshButton } from "./ItemActionButtons";
import { ProjectState } from "../Project/ProjectTypes";

type ProjectActionBarProps = {
  onEditClick: () => void;
  onRefreshClick: () => void;
  currentProject: ProjectState;
};

const ProjectActionBar = ({ onEditClick, onRefreshClick, currentProject }: ProjectActionBarProps) => {
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
      {(currentProject && currentProject.id) && <RefreshButton action={handleRefreshClick} />}

    </Box>
  );
};

export default ProjectActionBar;
