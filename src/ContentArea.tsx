import { Box } from "@mui/material";
import TinyEditor, { TinyEditorProps } from "./Editor/Editor";
import ManageProjectsScreen, { ManageProjectsDialogProps } from "./ManageProjectsScreen";
import UserSettingsScreen, { UserSettingsScreenProps } from "./ProjectBrowser/UserSettingsScreen";
import ProjectSettingsScreen, { ProjectSettingsDialogProps } from "./ProjectSettingsScreen";
import { UserState } from "./redux/userSlice";

type ContentAreaProps = {
  projectSettingsOpen: boolean;
  manageProjectsOpen: boolean;
  userSettingsOpen: boolean;
  editorParams: TinyEditorProps;
  projectSettingsParams: ProjectSettingsDialogProps;
  manageProjectsParams: ManageProjectsDialogProps;
  userSettingsParams: UserSettingsScreenProps;
  user: UserState;
};

const ContentArea = ({ projectSettingsOpen, manageProjectsOpen, userSettingsOpen, user, manageProjectsParams, editorParams, userSettingsParams, projectSettingsParams }: ContentAreaProps) => {
  return (
    <Box px={0}>
      <Box p={0} m={0} display={ (projectSettingsOpen || manageProjectsOpen || userSettingsOpen) ? 'none' : 'block' }>
        <TinyEditor {...editorParams} />
      </Box>

      <ProjectSettingsScreen {...projectSettingsParams} />

      <ManageProjectsScreen {...manageProjectsParams} />

      { (!user || !user.id || !userSettingsOpen) ? null :
        <UserSettingsScreen {...userSettingsParams} />
      }
    </Box>
  );
};

export default ContentArea;