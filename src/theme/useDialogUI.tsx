import { Button, DialogActions, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, useTheme } from "@mui/material";

export type ColorVariant = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | undefined;

export default function useDialogUI() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const fieldColor:ColorVariant = dark ? 'info' : 'primary';
  const labelColor:ColorVariant = dark ? 'success' : 'primary';

  type ButtonProps = {
    onClick?: () => void;
    label?: string;
    disabled?: boolean;
    mode?: 'dark' | 'light';
  };

  const CancelButton = ({ onClick, label } : ButtonProps) => (
    <Button {...{ onClick }} variant={ dark ? 'outlined' : 'contained' } color={ dark ? 'warning' : 'error' } sx={{ mr: 1 }}>{ label || 'Cancel' }</Button>
  );
  
  const ConfirmButton = ({ onClick, label, disabled } : ButtonProps) => (
    <Button variant="contained" color="success" {...{ disabled, onClick }} type="submit">{ label || 'OK' }</Button>
  )
  
  type DialogActionButtonsProps = {
    onCancel: () => void;
    onConfirm: () => void;
    confirmDisabled?: boolean;
    cancelLabel?: string;
    confirmLabel?: string;
  };

  const DialogActionButtons = ({ onCancel, onConfirm, confirmDisabled, cancelLabel, confirmLabel } : DialogActionButtonsProps) => (
    <DialogActions sx={{ px: 3, pb: 2, pt:0 }}>
      <CancelButton onClick={onCancel} mode={dark ? 'dark' : 'light'} label={cancelLabel} />
      <ConfirmButton onClick={onConfirm} mode={dark ? 'dark' : 'light'} {...{ disabled: confirmDisabled }} label={confirmLabel} />
    </DialogActions>
  );

  type MuiRadioGroupProps = {
    name: string;
    label: string;
    defaultValue?: string;
    options: { label: string; value: string }[];
  }

  const MuiRadioGroup = ({ radioGroup }: { radioGroup: MuiRadioGroupProps }) => (
    <FormControl sx={{ mt: 2 }}>
      <FormLabel id="export-format-group-label" color={labelColor}>{ radioGroup.label }</FormLabel>
      <RadioGroup
        row
        color={fieldColor}
        aria-labelledby={radioGroup.name+'-label'}
        defaultValue={radioGroup.defaultValue}
        name={radioGroup.name}
      >
        {
          radioGroup.options.map((option) => (
            <FormControlLabel key={option.value} value={option.value} control={<Radio color={fieldColor} />} label={option.label} />
          ))
        }
      </RadioGroup>
    </FormControl>
  );

  return { fieldColor, labelColor, dark, CancelButton, ConfirmButton, DialogActionButtons, MuiRadioGroup };
}

