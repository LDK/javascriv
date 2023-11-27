import { Box, Grid, Typography, useTheme } from "@mui/material";
import TinyEditor, { TinyEditorProps } from "./Editor/Editor";
import ManageProjectsScreen, { ManageProjectsDialogProps } from "./ManageProjectsScreen";
import UserSettingsScreen, { UserSettingsScreenProps } from "./ProjectBrowser/UserSettingsScreen";
import ProjectSettingsScreen, { ProjectSettingsDialogProps } from "./ProjectSettingsScreen";
import { UserState } from "./redux/userSlice";
import { ProjectFile } from "./Project/ProjectTypes";
import { findItemByPath } from "./redux/projectSlice";
import CorkboardView from "./CorkboardView";
import MainMenuScreen from "./ProjectBrowser/MainMenuScreen";

type ContentAreaProps = {
  projectSettingsOpen: boolean;
  manageProjectsOpen: boolean;
  userSettingsOpen: boolean;
  mobileMenuOpen: boolean;
  editorParams: TinyEditorProps;
  projectSettingsParams: ProjectSettingsDialogProps;
  manageProjectsParams: ManageProjectsDialogProps;
  userSettingsParams: UserSettingsScreenProps;
  user: UserState;
  openFilePath: string | null;
  items: ProjectFile[];
  handleDocumentClick: (item: ProjectFile) => void;
  appMenuButtons: JSX.Element[];
};

const ContentArea = ({ handleDocumentClick, mobileMenuOpen, projectSettingsOpen, manageProjectsOpen, userSettingsOpen, user, manageProjectsParams, editorParams, userSettingsParams, projectSettingsParams, openFilePath, items, appMenuButtons }: ContentAreaProps) => {
  const openItem = openFilePath ? findItemByPath(items, openFilePath.split('/')) : null;
  const isFolder = openItem?.type === 'folder';

  const hideEditor = (mobileMenuOpen || projectSettingsOpen || manageProjectsOpen || userSettingsOpen);

  return (
    <Box px={0}>
      <Box p={0} m={0} display={hideEditor ? 'none' : 'block' }>
        <TinyEditor {...editorParams} />
      </Box>

      { isFolder && <CorkboardView {...{handleDocumentClick}} folder={openItem} /> }

      <ProjectSettingsScreen {...projectSettingsParams} />

      <ManageProjectsScreen {...manageProjectsParams} />

      <MainMenuScreen open={mobileMenuOpen} {...{ appMenuButtons }} onClose={() => {}} />

      { (!user || !user.id || !userSettingsOpen) ? null :
        <UserSettingsScreen {...userSettingsParams} />
      }
    </Box>
  );
};

export default ContentArea;