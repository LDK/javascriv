import { useTheme, Typography, Divider, Grid } from "@mui/material";
import { ThemeToggleSwitch } from "../Header/Header";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../redux/themeSlice";
import AppScreen from "../Components/Screen";
import { getActiveScreen, setScreen } from "../redux/appSlice";

export type MainMenuScreenProps = {
  appMenuButtons: JSX.Element[];
};

const MainMenuScreen = ({ appMenuButtons }: MainMenuScreenProps) => {
  const theme = useTheme();
  const isDark = (theme.palette.mode === 'dark');

  const dispatch = useDispatch();
  const activeScreen = useSelector(getActiveScreen);

  console.log('activeScreen', activeScreen);

  const toggleTheme = (event:React.ChangeEvent<HTMLInputElement>, checked:boolean) => {
    const mode = checked ? 'light' : 'dark';
    dispatch(setTheme(mode));
    document.querySelector('html')?.setAttribute('data-theme', mode);
  }

  const onClose = () => {
    if (activeScreen === 'mainMenuMobile') {
      dispatch(setScreen(null));
    }
  }

  return (
    <AppScreen
      name="mainMenuMobile"
      onClose={onClose}
      title="Main Menu"
      id="main-menu-mobile"
    >
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

    </AppScreen>
  );
}

export default MainMenuScreen;