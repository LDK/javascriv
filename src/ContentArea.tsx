import { Box } from "@mui/material";
import TinyEditor, { TinyEditorProps } from "./Editor/Editor";
import ManageProjectsScreen, { ManageProjectsDialogProps } from "./Screens/ManageProjectsScreen";
import UserSettingsScreen from "./Screens/UserSettingsScreen";
import ProjectSettingsScreen from "./Screens/ProjectSettingsScreen";
import { UserState } from "./redux/userSlice";
import { ProjectFile } from "./Project/ProjectTypes";
import { findItemByPath } from "./redux/projectSlice";
import CorkboardView from "./CorkboardView";
import MainMenuScreen from "./Screens/MainMenuScreen";
import MobileProjectBrowser from "./Project/MobileProjectBrowser";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { getActiveScreen } from "./redux/appSlice";

type ContentAreaProps = {
  editorParams: TinyEditorProps;
  manageProjectsParams: ManageProjectsDialogProps;
  user: UserState;
  openFilePath: string | null;
  items: ProjectFile[];
  handleDocumentClick: (item: ProjectFile) => void;
  appMenuButtons: JSX.Element[];
  mobileBrowser: JSX.Element;
  browserOpen: boolean;
  setBrowserOpen: (open: boolean) => void;
};

const ContentArea = ({ browserOpen, setBrowserOpen, handleDocumentClick, mobileBrowser, user, manageProjectsParams, editorParams, openFilePath, items, appMenuButtons }: ContentAreaProps) => {
  const openItem = openFilePath ? findItemByPath(items, openFilePath.split('/')) : null;
  const isFolder = openItem?.type === 'folder';

  const activeScreen = useSelector(getActiveScreen);
  const hideEditor = (isFolder || Boolean(activeScreen));

  const handleMobileBrowserClose = useCallback(() => {
    setBrowserOpen(false);
  }, [setBrowserOpen]);

  return (
    <Box px={0}>
      <Box p={0} m={0} display={hideEditor ? 'none' : 'block' }>
        <TinyEditor {...editorParams} />
      </Box>

      { (isFolder && !Boolean(activeScreen)) && <CorkboardView {...{handleDocumentClick}} folder={openItem} /> }

      <ProjectSettingsScreen />
      <ManageProjectsScreen {...manageProjectsParams} />
      <MainMenuScreen {...{ appMenuButtons }} />
      <UserSettingsScreen />

      <MobileProjectBrowser open={browserOpen} onClose={handleMobileBrowserClose} files={items} {...{ mobileBrowser }} />
</Box>
  );
};

export default ContentArea;