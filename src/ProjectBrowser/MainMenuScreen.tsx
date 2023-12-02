import { Box, useTheme, Typography, Divider, Grid } from "@mui/material";
import { ThemeToggleSwitch } from "../Header/Header";
import { useDispatch } from "react-redux";
import { setTheme } from "../redux/themeSlice";

export type MainMenuScreenProps = {
  open: boolean;
  onClose: () => void;
  appMenuButtons: JSX.Element[];
};

const MainMenuScreen = ({ open, onClose, appMenuButtons }: MainMenuScreenProps) => {
  const theme = useTheme();
  const isDark = (theme.palette.mode === 'dark');

  const heights = {
    xs: 'calc(100vh - 56px)',
    sm: 'calc(100vh - 64px)',
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  });

  const dispatch = useDispatch();

  const toggleTheme = (event:React.ChangeEvent<HTMLInputElement>, checked:boolean) => {
    const mode = checked ? 'light' : 'dark';
    dispatch(setTheme(mode));
    document.querySelector('html')?.setAttribute('data-theme', mode);
  }

  return (
    <Box id="mobile-menu-screen" zIndex={6} width="100%" top={{ xs: '56px' }} position={{ xs: 'absolute' }} overflow={{ overflowY: 'scroll', overflowX: 'hidden' }} height={heights} p={4} display={ open ? 'block' : 'none' } sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}>
      <Typography mb={1}>Main Menu</Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={0}>
        {appMenuButtons.map((button, index) => (
          <Grid item xs={6} key={index} px={0} mx={0}>
            {button}
          </Grid>
        ))}

        <Grid item xs={12} mt={2}>
          <Typography mb={1}>Theme</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={6} sm={4} px={0} mx={0}>
          <ThemeToggleSwitch {...{ isDarkMode: isDark, toggleTheme, display: { xs: "flex", md: "none" } }} />
        </Grid>
      </Grid>

    </Box>
  );
}

export default MainMenuScreen;