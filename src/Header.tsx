// Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, useTheme } from '@mui/material';
import Sticky from 'react-stickynode';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { ThemeName } from './theme';

type HeaderProps = {
  handleThemeChange: (arg:ThemeName) => void;
  theme: ThemeName;
}

const Header: React.FC<HeaderProps> = ({ theme:activeTheme, handleThemeChange }) => {
  const theme = useTheme();
  
  return (
    <Sticky innerZ={2}>
      <AppBar sx={{ backgroundColor: theme.palette.primary.main }}>
        <Toolbar>
          <FormControl>
            <InputLabel id="theme-select-label">{ Boolean(activeTheme) ? '' : 'Theme' }</InputLabel>
            <Select
              variant="filled"
              sx={{ background: theme.palette.background.paper, color: theme.palette.text.primary }}
              labelId="theme-select-label"
              id="theme-select"
              value={activeTheme}
              onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
            >
              <MenuItem value={'light'}>Light</MenuItem>
              <MenuItem value={'dark'}>Dark</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
    </Sticky>
  );
};

export default Header;
