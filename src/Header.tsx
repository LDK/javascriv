// Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import Sticky from 'react-stickynode';

const Header: React.FC = () => {
  return (
    <Sticky innerZ={2}>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div" py={0}>
            My Application
          </Typography>
        </Toolbar>
      </AppBar>
    </Sticky>
  );
};

export default Header;
