// theme.tsx
import { createTheme, Palette, PaletteColor, ThemeOptions } from '@mui/material/styles';
import { PaletteOptions, PaletteColorOptions } from '@mui/material';

interface ExtendedThemeOptions extends ThemeOptions {
  palette?: PaletteOptions;
}

declare module '@mui/material/styles' {
  interface Palette {
    browserTray: Palette['primary'];
    documentCard: Palette['primary'];
    folderCard: Palette['primary'];
    itemBarDocument: Palette['primary'];
    itemBarFolder: Palette['primary'];
    folderCardHeader: Palette['primary'];
    documentCardHeader: Palette['primary'];
  }
  interface PaletteOptions {
    browserTray: PaletteOptions['primary'];
    documentCard: PaletteOptions['primary'];
    folderCard: PaletteOptions['primary'];
    itemBarDocument: PaletteOptions['primary'];
    itemBarFolder: PaletteOptions['primary'];
    folderCardHeader: PaletteOptions['primary'];
    documentCardHeader: PaletteOptions['primary'];
  }
}
export type ThemeName = 'light' | 'dark';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    hd: true;
  }
}

const darkThemeOptions:ExtendedThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      // Calm blue color, chosen for a professional appearance and readability.
      main: '#4f5fd5',
    },
    browserTray: {
      // A dark neutral blue, in line with our other blues
      main: '#2c3b7d',
    },
    documentCard: {
      // A dark neutral blue, in line with our other blues
      main: '#2c3b7d',
    },
    folderCard: {
      // A dark neutral green, in line with our other blues
      main: '#2c7d3b',
    },
    documentCardHeader: {
      // A dark neutral blue, in line with our other blues
      main: '#4f5fd5',
    },
    folderCardHeader: {
      // A dark neutral green, in line with our other blues
      main: '#1fa54f',
    },
    itemBarDocument: {
      main: '#374295',
    },
    itemBarFolder: {
      main: '#379542',
    },
    secondary: {
      // Calm blue color, chosen for a professional appearance and readability.
      main: '#4f5fd5',
    },
    background: {
      // Dark gray color, chosen for a modern and focused appearance that reduces eye strain in low-light environments.
      default: '#303030',
      // Slightly lighter gray color, used for paper elements and containers for better visual separation.
      paper: '#424242',
    },
    text: {
      // White color, chosen for readability against the dark background.
      primary: '#ffffff',
      // Light gray color, used for less important text elements, providing a visual hierarchy.
      secondary: '#e0e0e0',
    },
    success: {
      // Green color, typically associated with success messages or positive actions.
      main: '#60ff82',
    },
    warning: {
      // Yellow color, adjusted for dark mode readability.
      main: 'rgba(255,165,0)',
    },
    error: {
      // Red color, typically associated with error messages or negative actions.
      main: '#f44336',
    },
    info: {
      // Blue color, typically associated with informational messages or neutral actions.
      main: '#2196f3',
    },
  }
};

const lightThemeOptions:ExtendedThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      // Calm blue color, chosen for a professional appearance and readability.
      main: '#8babf1',
    },
    secondary: {
      // Bright blue color, chosen for a striking contrast to the primary color, used for accents and highlights.
      main: '#fcc9b5',
    },
    // A neutral but light "sandy" color
    browserTray: {
      main: '#e6daa8',
    },
    // A neutral but light "sandy" color
    documentCard: {
      main: '#ffffff',
    },
    // A neutral but light "sandy" color
    folderCard: {
      main: '#ffffff',
    },
    // A neutral but light "sandy" color
    documentCardHeader: {
      main: '#8babf1',
    },
    // A neutral but light "sandy" color
    folderCardHeader: {
      main: '#86c4b8',
    },
    // A neutral but light "sandy" color
    itemBarDocument: {
      main: '#7a9ae0',
    },
    itemBarFolder: {
      main: '#75b3a7',
    },
    background: {
      // Light gray color, chosen for a neutral and gentle background that's easy on the eyes.
      default: '#b3c7f7',
      // White color, used for paper elements and containers for better visual separation.
      paper: '#ffffff',
      
    },
    text: {
      // Dark gray color, chosen for readability against the light background.
      primary: '#303030',
      // Medium gray color, used for less important text elements, providing a visual hierarchy.
      secondary: '#757575',
    },
    success: {
      // Green color, adjusted for readability.
      main: '#20aa20',
    },
    warning: {
      // Yellow color, typically associated with warning messages or cautionary actions.
      main: '#faaf90',
    },
    error: {
      // Red color, adjusted for dark mode readability.
      main: '#bb2222',
    },
    info: {
      // Blue color, adjusted for dark mode readability.
      main: '#eafaff',
    },
  },
};

const baseThemeOptions:ExtendedThemeOptions = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          justifyContent: 'start',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          fontWeight: 600,
          fontSize: '.9rem',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      hd: 1800
    }
  }
};

export const lightTheme = createTheme({ ...baseThemeOptions, ...lightThemeOptions });
export const darkTheme = createTheme({ ...baseThemeOptions, ...darkThemeOptions });


export type ExtendedPalette = Palette & { tray: PaletteColor };