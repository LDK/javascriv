// Header.tsx
import React from 'react';
import { AppBar, Box, Switch, Toolbar, Typography, useTheme } from '@mui/material';
import Sticky from 'react-stickynode';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from './redux/themeSlice';
import { RootState } from './redux/store';
import MoonIcon from '@mui/icons-material/Brightness2';
import SunIcon from '@mui/icons-material/Brightness7';

const IconButton: React.FC<{ clickAction: () => void; icon: React.ReactNode }> = ({ clickAction, icon }) => (
  <Typography lineHeight={0} p={0} m={0} component="span" sx={{ cursor: 'pointer' }} onClick={clickAction}>
    {icon}
  </Typography>
);

const ThemeToggleSwitch: React.FC<{ isDarkMode: boolean; toggleTheme: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void }> = ({ isDarkMode, toggleTheme }) => {
  return (
    <Box display="flex" alignItems="center">
      <IconButton clickAction={() => toggleTheme({} as React.ChangeEvent<HTMLInputElement>, false)} icon={<MoonIcon />} />

      <Switch
        checked={!isDarkMode}
        onChange={toggleTheme}
        color="default"
        inputProps={{ 'aria-label': 'Toggle dark mode' }}
      />

      <IconButton clickAction={() => toggleTheme({} as React.ChangeEvent<HTMLInputElement>, true)} icon={<SunIcon />} />
    </Box>
  );
};

const Header: React.FC<any> = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const activeTheme = useSelector((state:RootState) => state.theme.active);
  const isDarkMode = (activeTheme === 'dark');

  const toggleTheme = (event:React.ChangeEvent<HTMLInputElement>, checked:boolean) => {
    dispatch(setTheme(checked ? 'light' : 'dark'));
  }

  return (
    <Sticky innerZ={2}>
      <AppBar sx={{ backgroundColor: theme.palette.primary.main, textAlign: 'right', alignItems: 'flex-end' }}>
        <Typography pl={3} pt={1} component="h1" variant="h4" position="absolute" top={0} left={0} color={theme.palette.text.primary}>javaScriv</Typography>

        <Toolbar>
          <ThemeToggleSwitch {...{ isDarkMode, toggleTheme }} />
        </Toolbar>
      </AppBar>
    </Sticky>
  );
};

export default Header;
