import { Box, BoxProps, Divider, Typography, useTheme } from "@mui/material";
import useDialogUI from "../theme/useDialogUI";
import { useSelector } from "react-redux";
import { ScreenName, getActiveScreen } from "../redux/appSlice";

export type ScreenProps = {
  onClose: () => void;
  children?: React.ReactNode;
  title: string;
  name: ScreenName;
  id: string;
} & ({
  buttons: true;
  handleConfirm: () => void;
  handleClose: () => void;
} | {
  buttons?: false;
  handleConfirm?: undefined;
  handleClose?: undefined;

});

const AppScreen = ({ name, id, onClose, handleConfirm, handleClose, children, title, buttons }:ScreenProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { DialogActionButtons } = useDialogUI();
  const activeScreen = useSelector(getActiveScreen);
  const open = (activeScreen === name);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  });

  const screenProps:BoxProps = {
    id,
    zIndex: 5,
    width: "100%",
    height: "calc(100vh - 64px)",
    p: 4,
    position: "relative",
    overflow: { overflowY: 'scroll', overflowX: 'hidden' },
    display: open ? 'block' : 'none',
    sx: { backgroundColor: theme.palette.grey[isDark ? 800 : 100] }
  };

  return (
    <Box {...screenProps}>
      <Typography mb={1}>{title}</Typography>

      <Divider sx={{ mb: 2 }} />

      {children}

      <Box position="absolute" bottom="2rem" width="100%" right="2rem" textAlign="right">
          {buttons && <DialogActionButtons
            onCancel={handleClose}
            onConfirm={handleConfirm}
          />}
      </Box>
    </Box>
  );
}

export default AppScreen;

