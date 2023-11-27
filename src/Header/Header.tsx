import React, { useState } from 'react';
import { AppBar, Box, Switch, SxProps, Theme, Toolbar, Typography, useTheme } from '@mui/material';
import Sticky from 'react-stickynode';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../redux/themeSlice';
import { RootState } from '../redux/store';
import MoonIcon from '@mui/icons-material/Brightness2';
import SunIcon from '@mui/icons-material/Brightness7';
import LoginIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import MenuRounded from '@mui/icons-material/MenuRounded';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTreeTwoTone';

import LoginRegisterDialog from './LoginRegisterDialog';
import useUser from '../User/useUser';
import { ProjectState } from '../Project/ProjectTypes';
import useAppMenu from '../useAppMenu';

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

type ThemeToggleProps = {
  isDarkMode: boolean;
  toggleTheme: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  display?: {
    xs?: 'none' | 'flex';
    sm?: 'none' | 'flex';
    md?: 'none' | 'flex';
    lg?: 'none' | 'flex';
    xl?: 'none' | 'flex';
  };
};

export const ThemeToggleSwitch: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme, display }) => {
  return (
    <Box display={display || { xs: 'none', md: 'flex' }} alignItems="center" mr={4}>
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
  manageCallback: () => void;
  newCallback: () => void;
  ProjectSelector: React.FC<any>;
  settingsCallback?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  browserOpen: boolean;
  setBrowserOpen: (open: boolean) => void;
};

const Header: React.FC<any> = ({ browserOpen, setBrowserOpen, loadProject, mobileMenuOpen, setMobileMenuOpen, settingsCallback, appMenuButtons, importCallback, manageCallback, newCallback, handleEditorChange, ProjectSelector }:HeaderProps) => {
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

  return (
    <Sticky innerZ={2}>
      <AppBar elevation={0} sx={{ backgroundColor: theme.palette.primary.main, textAlign: 'right', alignItems: 'flex-end' }}>
        <Typography pl={3} pt={{ xs: 1, md: 1}} component="h1" fontSize={{ xs: '1.5rem', md: '2.125rem' }} position="absolute" top={0} left={0} color={theme.palette.text.primary}>javaScriv</Typography>

        <Toolbar>
          {!user ? null : <ProjectSelector {...{ user, importCallback, newCallback, manageCallback }} callback={loadProject} />}

          <ThemeToggleSwitch {...{ isDarkMode, toggleTheme }} />

          <Box p={0} m={0} alignItems="center" display={{ xs: "none", md: "flex" }} mr={1}>
            <IconButton title={`Main Menu`} icon={<MenuRounded />} clickAction={handleOpenAppMenu} />
            <AppMenu buttons={appMenuButtons} />
          </Box>

          <Box p={0} m={0} alignItems="center" display={{ xs: "flex", md: "none" }} mr={1}>
            <IconButton title={`Files in Project`} icon={<AccountTreeIcon color={browserOpen ? 'warning' : 'action'} sx={{ mr: 1 }} />} clickAction={() => { setBrowserOpen(!browserOpen) }} />

            <IconButton title={`Mobile Menu`} icon={mobileMenuOpen ? <CloseIcon /> : <MenuRounded />} clickAction={() => { setMobileMenuOpen(!mobileMenuOpen) }} />
          </Box>

          {!user.id && <IconButton icon={<LoginIcon />} clickAction={() => setLoginOpen(true)} />}
          {user.id && <IconButton title={`Logged in as ${user.username}`} icon={<ProfileIcon />} clickAction={handleOpenUserMenu} />}

          <UserMenu {...{settingsCallback}} />
        </Toolbar>
        {!user.id && <LoginRegisterDialog open={loginOpen} onClose={() => setLoginOpen(false)} />}
      </AppBar>
    </Sticky>
  );
};

export default Header;
