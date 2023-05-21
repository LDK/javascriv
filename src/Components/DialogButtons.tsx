import { Button } from "@mui/material";

export const CancelButton = ({ onClick, label } : { onClick: () => void; label?: string }) => (
  <Button {...{ onClick }} variant="outlined" color="warning" sx={{ mr: 1 }}>{ label || 'Cancel' }</Button>
);

export const ConfirmButton = ({ onClick, label, disabled } : { onClick?: () => void; label?: string; disabled?: boolean; }) => (
  <Button variant="contained" color="success" {...{ disabled, onClick }} type="submit">{ label || 'OK' }</Button>
)

