import { Box, useTheme } from "@mui/material";

const SettingBox = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isDark = (theme.palette.mode === 'dark');

  return (
    <Box
      mb={2}
      p={2}
      borderRadius={'.25rem'} borderColor="primary.contrastText" sx={{
        borderStyle: 'solid',
        borderWidth: '1px',
        backgroundColor: theme.palette.grey[isDark ? 600 : 300],
      }}>
      {children}
    </Box>
  );
};

export default SettingBox;