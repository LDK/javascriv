import { Box, useTheme, Typography, Divider, Grid } from "@mui/material";
import { UserState } from "../redux/userSlice";
import { ReactNode } from "react";

export type MainMenuScreenProps = {
  open: boolean;
  onClose: () => void;
  appMenuButtons: ReactNode[];
};

const MainMenuScreen = ({ open, onClose, appMenuButtons }: MainMenuScreenProps) => {

  const theme = useTheme();
  const isDark = (theme.palette.mode === 'dark');

  const heights = {
    xs: 'calc(100vh - 56px)',
    sm: 'calc(100vh - 64px)',
  };

  return (
    <Box width="100%" position="relative" overflow={{ overflowY: 'scroll', overflowX: 'hidden' }} height={heights} p={4} display={{ xs: open ? 'block' : 'none', md: 'none' }} sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}>
      <Typography mb={1}>Main Menu</Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={0}>
        {appMenuButtons.map((button, index) => (
          <Grid item xs={6} sm={4} key={index} px={0} mx={0}>
            {button}
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}

export default MainMenuScreen;