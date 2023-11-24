import { Box, Grid, Typography, useTheme } from "@mui/material";
import TinyEditor, { TinyEditorProps } from "./Editor/Editor";
import ManageProjectsScreen, { ManageProjectsDialogProps } from "./ManageProjectsScreen";
import UserSettingsScreen, { UserSettingsScreenProps } from "./ProjectBrowser/UserSettingsScreen";
import ProjectSettingsScreen, { ProjectSettingsDialogProps } from "./ProjectSettingsScreen";
import { UserState } from "./redux/userSlice";
import { ProjectFile } from "./Project/ProjectTypes";
import { findItemByPath } from "./redux/projectSlice";
import CorkboardView from "./CorkboardView";

type ContentAreaProps = {
  projectSettingsOpen: boolean;
  manageProjectsOpen: boolean;
  userSettingsOpen: boolean;
  editorParams: TinyEditorProps;
  projectSettingsParams: ProjectSettingsDialogProps;
  manageProjectsParams: ManageProjectsDialogProps;
  userSettingsParams: UserSettingsScreenProps;
  user: UserState;
  openFilePath: string | null;
  items: ProjectFile[];
  handleDocumentClick: (item: ProjectFile) => void;
};

const ContentArea = ({ handleDocumentClick, projectSettingsOpen, manageProjectsOpen, userSettingsOpen, user, manageProjectsParams, editorParams, userSettingsParams, projectSettingsParams, openFilePath, items }: ContentAreaProps) => {
  const openItem = openFilePath ? findItemByPath(items, openFilePath.split('/')) : null;
  const isFolder = openItem?.type === 'folder';

  return (
    <Box px={0}>
      <Box p={0} m={0} display={ (projectSettingsOpen || manageProjectsOpen || userSettingsOpen || isFolder) ? 'none' : 'block' }>
        <TinyEditor {...editorParams} />
      </Box>

      { isFolder && <CorkboardView {...{handleDocumentClick}} folder={openItem} /> }

      <ProjectSettingsScreen {...projectSettingsParams} />

      <ManageProjectsScreen {...manageProjectsParams} />

      { (!user || !user.id || !userSettingsOpen) ? null :
        <UserSettingsScreen {...userSettingsParams} />
      }
    </Box>
  );
};

export default ContentArea;