// Project/ProjectSettingsDialog.tsx
import React, { useState } from 'react';
import { Autocomplete, Box, Dialog, DialogContent, DialogTitle, Divider, Grid, Select, TextField, Typography } from '@mui/material';
import useDialogUI from '../theme/useDialogUI';
import { EditorFont, editorFonts } from '../Editor/EditorFonts';
import { getProjectSettings } from '../redux/projectSlice';
import { useSelector } from 'react-redux';
import { usePublishingOptions } from '../Publish/PublishOptions';

type ProjectSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({ open, onClose }) => {
  const { DialogActionButtons } = useDialogUI();
  const projectSettings = useSelector(getProjectSettings);
  const [font, setFont] = useState<EditorFont>(projectSettings?.font as EditorFont || { name: 'Roboto', value: 'Roboto' });
  const [fontSize, setFontSize] = useState<number>(projectSettings?.fontSize as number || 12);

  const {
    PageBreaksSelect, PageNumberPositionSelect, DisplayDocumentTitlesSelect, IncludeToCSelect
  } = usePublishingOptions();

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    // TODO: handle confirm action
    onClose();
  };

  const SettingBox = ({ children }: { children: React.ReactNode }) => (
    <Box
      mb={2}
      p={2}
      borderRadius={'.25rem'} borderColor="primary.contrastText" sx={{
        borderStyle: 'solid',
        borderWidth: '1px',
        backgroundColor: '#6A6A6A',
      }}>
      {children}
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'md'} PaperProps={{ style: { height: '80vh' }}}>
      <DialogTitle>Project Settings</DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" mb={2}>Font Options</Typography>
            <SettingBox>
              <Typography mb={1}>Default Font</Typography>
              <Autocomplete
                value={font}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFont(newValue);
                  }
                }}
                options={editorFonts}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} />}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > *': { mr: 2 } }} {...props}>
                    <span style={{ fontFamily: option.value }}>{option.name}</span>
                  </Box>
                )}
              />
            </SettingBox>

            <SettingBox>
              <Typography mb={1}>Default Font Size</Typography>
              
              <Autocomplete
                value={fontSize}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFontSize(newValue);
                  }
                }}
                options={[10, 11, 12, 13, 14, 15, 16]}
                getOptionLabel={(option) => option.toString()}
                renderInput={(params) => <TextField {...params} />}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > *': { mr: 2 } }} {...props}>
                    <span style={{ fontFamily: font.value, fontSize: option }}>{option}</span>
                  </Box>
                )}
              />

            </SettingBox>

          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" mb={2} pl={2}>Publishing Options</Typography>
            <SettingBox>
              <PageBreaksSelect />
              <PageNumberPositionSelect />
              <DisplayDocumentTitlesSelect />
              <IncludeToCSelect />
            </SettingBox>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleConfirm}
      />
    </Dialog>
  );
};

export default ProjectSettingsDialog;
