import { Box, useTheme, Typography, Divider, Grid } from "@mui/material";
import { UserState } from "../redux/userSlice";

export type MainMenuScreenProps = {
  open: boolean;
  onClose: () => void;
  user: UserState;
};

const MainMenuScreen = ({ open, onClose, user }: MainMenuScreenProps) => {

  const theme = useTheme();
  const isDark = (theme.palette.mode === 'dark');

  const heights = {
    xs: 'calc(100vh - 56px)',
    sm: 'calc(100vh - 64px)',
  };

  return (
    <Box width="100%" position="relative" overflow={{ overflowY: 'scroll', overflowX: 'hidden' }} height={heights} p={4} display={ open ? 'block' : 'none' } sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}>
      <Typography mb={1}>User Settings</Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>User Details</Typography>
        </Grid>

        <Grid item xs={12} md={4}>

        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>Default Publishing Options</Typography>

        </Grid>
      </Grid>

    </Box>
  );
}

export default MainMenuScreen;