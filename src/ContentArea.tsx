import { Box, Grid, Typography, useTheme } from "@mui/material";
import TinyEditor, { TinyEditorProps } from "./Editor/Editor";
import ManageProjectsScreen, { ManageProjectsDialogProps } from "./ManageProjectsScreen";
import UserSettingsScreen, { UserSettingsScreenProps } from "./ProjectBrowser/UserSettingsScreen";
import ProjectSettingsScreen, { ProjectSettingsDialogProps } from "./ProjectSettingsScreen";
import { UserState } from "./redux/userSlice";
import { ProjectFile } from "./Project/ProjectTypes";
import { findItemByPath } from "./redux/projectSlice";

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
};

const ContentArea = ({ projectSettingsOpen, manageProjectsOpen, userSettingsOpen, user, manageProjectsParams, editorParams, userSettingsParams, projectSettingsParams, openFilePath, items }: ContentAreaProps) => {
  const openItem = openFilePath ? findItemByPath(items, openFilePath.split('/')) : null;
  const isFolder = openItem?.type === 'folder';

  const theme = useTheme();

  const cardBgColor = theme.palette.mode === 'dark' ? theme.palette.primary.light : 'white';

  console.log('ContentArea', { openFilePath, openItem, isFolder });

  const CorkboardView = () => {
    return (
      <Box p={4} sx={{ overflowY: 'scroll' }} height="calc(100% - 50px)" display="block" position="relative">
        <Grid container spacing={2}>
          {openItem?.children?.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box bgcolor={cardBgColor} p={0} boxShadow={2} borderRadius=".5rem" overflow="hidden">
                <Box p={1} bgcolor={theme.palette.primary.main} color={theme.palette.primary.contrastText}>
                  <Typography variant="body2" fontWeight={700} component="h3" gutterBottom>
                    {item.name}
                  </Typography>
                </Box>

                <Box p={2} height={160} overflow={'hidden'} position="relative">
                  {item.content && <div dangerouslySetInnerHTML={{ __html: item.content }} />}

                {/* Absolutely positioned overlay that starts transparent at the top and fades to cardBgColor at the very bottom.. top 90% should be transparent before the gradient begins */}
                <Box position="absolute" top={0} left={0} width="100%" height="100%" bgcolor="transparent" sx={{ backgroundImage: `linear-gradient(to bottom, transparent 60%, ${cardBgColor})` }} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box px={0}>
      <Box p={0} m={0} display={ (projectSettingsOpen || manageProjectsOpen || userSettingsOpen || isFolder) ? 'none' : 'block' }>
        <TinyEditor {...editorParams} />
      </Box>
      { isFolder && <CorkboardView /> }

      <ProjectSettingsScreen {...projectSettingsParams} />

      <ManageProjectsScreen {...manageProjectsParams} />

      { (!user || !user.id || !userSettingsOpen) ? null :
        <UserSettingsScreen {...userSettingsParams} />
      }
    </Box>
  );
};

export default ContentArea;