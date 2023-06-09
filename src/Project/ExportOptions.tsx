// Import/ImportOptions.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField } from '@mui/material';
import useDialogUI from '../theme/useDialogUI';
import { ProjectFile } from './ProjectTypes';

export interface ExportOptionsProps {
  optionsOpen: boolean;
  onClose: () => void;
  onReady: (base: string, extension: string) => void;
}

export interface ExportingOptions {
  items: ProjectFile[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ optionsOpen, onClose, onReady }) => {
  const [fileFormat, setFileFormat] = useState('json');

  const handleReady = () => {
    if (onReady) {
      const input = document.getElementById('projectFileName') as HTMLInputElement;
      onReady(input.value, fileFormat);
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
          defaultValue: fileFormat,
          onChange: (value) => setFileFormat(value),
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