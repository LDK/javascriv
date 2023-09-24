import React, { useState } from 'react';
import { AppBar, Box, Switch, Toolbar, Typography, useTheme } from '@mui/material';
import Sticky from 'react-stickynode';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../redux/themeSlice';
import { RootState } from '../redux/store';
import MoonIcon from '@mui/icons-material/Brightness2';
import SunIcon from '@mui/icons-material/Brightness7';
import LoginIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import MenuRounded from '@mui/icons-material/MenuRounded';

import LoginRegisterDialog from './LoginRegisterDialog';
import useUser from '../User/useUser';
import { ProjectState } from '../Project/ProjectTypes';
import useAppMenu from '../useAppMenu';
import useProject from '../Project/useProject';

type IconButtonProps = {
  clickAction: (e:React.MouseEvent) => void;
  icon: React.ReactNode;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ clickAction, icon, title }) => (
  <Typography lineHeight={0} p={0} m={0} component="span" sx={{ cursor: 'pointer' }} onClick={clickAction} title={title || undefined}>
    {icon}
  </Typography>
);

const ThemeToggleSwitch: React.FC<{ isDarkMode: boolean; toggleTheme: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void }> = ({ isDarkMode, toggleTheme }) => {
  return (
    <Box display="flex" alignItems="center" mr={4}>
      <IconButton title="Dark Mode" clickAction={() => toggleTheme({} as React.ChangeEvent<HTMLInputElement>, false)} icon={<MoonIcon />} />
      <Switch
        checked={!isDarkMode}
        onChange={toggleTheme}
        color="default"
        inputProps={{ 'aria-label': 'Toggle dark mode' }}
      />
      <IconButton title="Bright Mode" clickAction={() => toggleTheme({} as React.ChangeEvent<HTMLInputElement>, true)} icon={<SunIcon />} />
    </Box>
  );
};

type HeaderProps = { 
  loadProject: (arg:ProjectState, token: string) => void;
  appMenuButtons: JSX.Element[];
  handleEditorChange: (content: string) => void;
  importCallback: () => void;
  newCallback: () => void;
};

const Header: React.FC<any> = ({ loadProject, appMenuButtons, importCallback, newCallback, handleEditorChange }:HeaderProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [loginOpen, setLoginOpen] = useState(false);

  const activeTheme = useSelector((state:RootState) => state.theme.active);
  const isDarkMode = (activeTheme === 'dark');

  const toggleTheme = (event:React.ChangeEvent<HTMLInputElement>, checked:boolean) => {
    const mode = checked ? 'light' : 'dark';
    dispatch(setTheme(mode));
    document.querySelector('html')?.setAttribute('data-theme', mode);
  }

  const { user, UserMenu, handleOpenUserMenu } = useUser();
  const { AppMenu, handleOpenAppMenu } = useAppMenu({ buttons: appMenuButtons });

  const { ProjectSelector } = useProject({ ...handleEditorChange });

  return (
    <Sticky innerZ={2}>
      <AppBar sx={{ backgroundColor: theme.palette.primary.main, textAlign: 'right', alignItems: 'flex-end' }}>
        <Typography pl={3} pt={1} component="h1" variant="h4" position="absolute" top={0} left={0} color={theme.palette.text.primary}>javaScriv</Typography>

        <Toolbar>
          {!user ? null : <ProjectSelector {...{ user, importCallback, newCallback }} callback={loadProject} />}

          <ThemeToggleSwitch {...{ isDarkMode, toggleTheme }} />

          <Box p={0} m={0} alignItems="center" display="flex" mr={1}>
            <IconButton title={`Main Menu`} icon={<MenuRounded />} clickAction={handleOpenAppMenu} />
            <AppMenu buttons={appMenuButtons} />
          </Box>

          {!user.id && <IconButton icon={<LoginIcon />} clickAction={() => setLoginOpen(true)} />}
          {user.id && <IconButton title={`Logged in as ${user.username}`} icon={<ProfileIcon />} clickAction={handleOpenUserMenu} />}
          <UserMenu />
        </Toolbar>
        {!user.id && <LoginRegisterDialog open={loginOpen} onClose={() => setLoginOpen(false)} />}
      </AppBar>
    </Sticky>
  );
};

export default Header;
