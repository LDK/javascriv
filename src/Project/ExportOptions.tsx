// Import/ImportOptions.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField } from '@mui/material';
import { BrowserItem } from '../redux/filesSlice';
import useDialogUI from '../theme/useDialogUI';

export interface ExportOptionsProps {
  optionsOpen: boolean;
  onClose: () => void;
  onReady: (value: string) => void;
}

export interface ExportingOptions {
  items: BrowserItem[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ optionsOpen, onClose, onReady }) => {
  const handleReady = () => {
    if (onReady) {
      const input = document.getElementById('projectFileName') as HTMLInputElement;
      onReady(input.value);
    }
  };

  const { fieldColor, DialogActionButtons, MuiRadioGroup } = useDialogUI();

  return (
    <Dialog open={optionsOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Export Current Project</DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Enter the file name for the exported project (do not enter extension):
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          id="projectFileName"
          label="File Name"
          color={fieldColor}
          type="text"
          fullWidth
          variant="standard"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleReady();
              onClose();
            }
          }}
        />

        <MuiRadioGroup radioGroup={{
          name: 'export-format-group',
          label: 'Format',
          defaultValue: 'json',
          options: [
            { label: 'JSON', value: 'json' },
            { label: 'HTML', value: 'html' },
          ],
        }} />
      </DialogContent>

      <DialogActionButtons onCancel={onClose} onConfirm={handleReady} confirmLabel="Ready" />

    </Dialog>
  );
};

export default ExportOptions;