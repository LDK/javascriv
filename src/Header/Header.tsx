import React, { useState } from 'react';
import { AppBar, Box, Divider, FormControl, InputLabel, ListSubheader, MenuItem, Select, Switch, Toolbar, Typography, useTheme } from '@mui/material';
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
import { ProjectListing, ProjectState } from '../Project/ProjectTypes';
import { UserState } from '../redux/userSlice';
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

const ProjectSelector:React.FC<any> = ({ user, callback }: { user: UserState, callback: (arg:ProjectListing, token: string) => void }) => {
  const { projects, token } = user;
  
  if (!projects || !token) {
    return null;
  }

  return (
    <FormControl sx={{ my: 0, mr: 2, p:0, minWidth: 120 }}>
    <InputLabel htmlFor="grouped-select">Projects</InputLabel>
    <Select defaultValue="" id="grouped-select" label="Grouping" variant="outlined">
      {projects && Object.keys(projects).map((group) => {
        if (!projects[group as keyof typeof projects].length) {
          return null;
        }
        return (
          <div key={group}>
            <ListSubheader>{group} Projects</ListSubheader>
            {projects[group as keyof typeof projects].map((project) => (
              <MenuItem key={project.id} onClick={() => callback(project, token)}>{project.title}</MenuItem>
            ))}
          </div>
        );
      })}

      <Divider />

      <MenuItem onClick={() => console.log('new project')}>New Project</MenuItem>
      <MenuItem onClick={() => console.log('import project')}>Import Project</MenuItem>        
    </Select>
  </FormControl>
  )
};

type HeaderProps = { 
  loadProject: (arg:ProjectState, token: string) => void;
  appMenuButtons: JSX.Element[];
};

const Header: React.FC<any> = ({ loadProject, appMenuButtons }:HeaderProps) => {
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
      <AppBar sx={{ backgroundColor: theme.palette.primary.main, textAlign: 'right', alignItems: 'flex-end' }}>
        <Typography pl={3} pt={1} component="h1" variant="h4" position="absolute" top={0} left={0} color={theme.palette.text.primary}>javaScriv</Typography>

        <Toolbar>
          {!user ? null : <ProjectSelector {...{ user }} callback={loadProject} />}

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
