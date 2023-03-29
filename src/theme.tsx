// theme.tsx
import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      // Calm blue color, chosen for a professional appearance and readability.
      main: '#5c6bc0',
    },
    secondary: {
      // Soft orange color, chosen for a subtle contrast to the primary color, used for accents and highlights.
      main: '#ffab91',
    },
    background: {
      // Light gray color, chosen for a neutral and gentle background that's easy on the eyes.
      default: '#f5f5f5',
      // White color, used for paper elements and containers for better visual separation.
      paper: '#ffffff',
    },
    text: {
      // Dark gray color, chosen for readability against the light background.
      primary: '#424242',
      // Medium gray color, used for less important text elements, providing a visual hierarchy.
      secondary: '#757575',
    },
    success: {
      // Green color, typically associated with success messages or positive actions.
      main: '#4caf50',
    },
    warning: {
      // Yellow color, typically associated with warning messages or cautionary actions.
      main: '#ff9800',
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
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      // Warm orange color, chosen for a vivid and dynamic appearance, providing good contrast with the dark background.
      main: '#ff9800',
    },
    secondary: {
      // Bright blue color, chosen for a striking contrast to the primary color, used for accents and highlights.
      main: '#29b6f6',
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
      // Green color, adjusted for dark mode readability.
      main: '#81c784',
    },
    warning: {
      // Yellow color, adjusted for dark mode readability.
      main: '#ffb74d',
    },
    error: {
      // Red color, adjusted for dark mode readability.
      main: '#e57373',
    },
    info: {
      // Blue color, adjusted for dark mode readability.
      main: '#64b5f6',
    },
  },
});

export { lightTheme, darkTheme };
