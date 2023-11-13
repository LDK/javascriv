import { Menu, Typography, Divider, MenuItem, useTheme } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, getActiveUser, setUserProjects } from "../redux/userSlice";
import { resetProject, setFiles, setProjectId } from "../redux/projectSlice";
import { isFunction } from "@mui/x-data-grid/internals";

export default function useUser () {
  const user = useSelector(getActiveUser);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);

  const getProjectListings = (force?:boolean) => {
    if (user && user.token && (!user.projects || force)) {
      const AuthStr = 'Bearer ' + user.token;
      axios.get(`${process.env.REACT_APP_API_URL}/user/projects`, { headers: { Authorization: AuthStr } })
        .then((response) => {

          const payload = {
            Created: response.data.createdProjects,
            Collaborator: response.data.collaboratorProjects,
          };
          dispatch(setUserProjects(payload));
          // TODO: save projects on user slice, use these to populate project selector in app header
        })
        .catch((error) => {
          console.log(error);
        });
  
    }
  }

  useEffect(() => {
    getProjectListings();
   // TODO eventually: if user logs out while working as collaborator, load empty project
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    getProjectListings(true);
   // TODO eventually: if user logs out while working as collaborator, load empty project
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenUserMenu = (event:React.MouseEvent) => {
    setAnchorElUser(event.currentTarget as HTMLElement);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(resetProject());
    handleCloseUserMenu();
  }

  const UserMenu:React.FC<any> = ({settingsCallback}:{settingsCallback?: () => void}) => {
    
    const handleSettings = () => {
      handleCloseUserMenu();
      console.log('handle settings', settingsCallback);
      if (settingsCallback && isFunction(settingsCallback)) {
        settingsCallback();
      }
    }
  
      return (
    <Menu
    id="menu-appbar"
    anchorEl={anchorElUser}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    keepMounted
    transformOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    open={Boolean(anchorElUser)}
    onClose={handleCloseUserMenu}
    sx={{
      display: { xs: 'block' },
      py: 0
    }}
  >
    <Typography variant="body2" sx={{ px: 2, py: 1, color: theme.palette.text.primary }}>Hello {user.username}!</Typography>

    <Divider sx={{ my: 1 }} />

    <MenuItem onClick={handleLogout}>Sign out</MenuItem>
    <MenuItem onClick={handleSettings}>User Settings</MenuItem>
  </Menu>

  )};

  return { user, getProjectListings, UserMenu, handleOpenUserMenu, handleCloseUserMenu, handleLogout };
}

