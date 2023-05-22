// theme.tsx
import { createTheme, Palette, PaletteColor, ThemeOptions } from '@mui/material/styles';
import { PaletteOptions, PaletteColorOptions } from '@mui/material';

interface ExtendedPaletteOptions extends PaletteOptions {
  tray?: PaletteColorOptions;
} 

interface ExtendedThemeOptions extends ThemeOptions {
  palette?: ExtendedPaletteOptions;
}

export type ThemeName = 'light' | 'dark';

const darkThemeOptions:ExtendedThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      // Calm blue color, chosen for a professional appearance and readability.
      main: '#4f5fd5',
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
  },
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
    tray: {
      main: '#d9e4ff'
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

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
export type ExtendedPalette = Palette & { tray: PaletteColor };

