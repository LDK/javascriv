import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";

type AppMenuProps = {
  buttons: JSX.Element[];
}

export default function useAppMenu({ buttons }:AppMenuProps) {
  const [anchorElApp, setAnchorElApp] = useState<HTMLElement | null>(null);

  const handleOpenAppMenu = (event:React.MouseEvent) => {
    setAnchorElApp(event.currentTarget as HTMLElement);
  };
  
  const handleCloseAppMenu = () => {
    setAnchorElApp(null);
  };
  
  const menuItems = buttons.map((button:JSX.Element, index) => (
    <MenuItem key={index} onClick={handleCloseAppMenu} sx={{ py: 0 }}>
      {button}
    </MenuItem>
  ));

  const AppMenu:React.FC<any> = () => (
    <Menu
      id="menu-appbar"
      anchorEl={anchorElApp}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={Boolean(anchorElApp)}
      onClose={handleCloseAppMenu}
      sx={{
        display: { xs: 'block' },
        py: 0
      }}
    >
      {menuItems}
    </Menu>
  );

  return { AppMenu, handleOpenAppMenu, handleCloseAppMenu };
}

