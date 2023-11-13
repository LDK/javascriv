import { Autocomplete, Box, Divider, Grid, TextField, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getProjectSettings, setProjectSettings } from "./redux/projectSlice";
import useDialogUI from "./theme/useDialogUI";
import { useEffect, useState } from "react";
import { EditorFont, editorFonts } from "./Editor/EditorFonts";
import { usePublishingOptions } from "./Publish/PublishOptions";
import { ProjectSettings, PublishOptions } from "./Project/ProjectTypes";
import SettingBox from "./Components/SettingBox";

type ProjectSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ProjectSettingsScreen = ({ open, onClose }:ProjectSettingsDialogProps) => {
  const projectSettings = useSelector(getProjectSettings);
  const [font, setFont] = useState<EditorFont>(projectSettings?.font as EditorFont || { name: 'Roboto', value: 'Roboto' });
  const [fontSize, setFontSize] = useState<number>(projectSettings?.fontSize as number || 12);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { DialogActionButtons } = useDialogUI();
  const dispatch = useDispatch();

  const {
    PageBreaksSelect, PageNumberPositionSelect, DisplayDocumentTitlesSelect, IncludeToCSelect,
    pageBreaks, pageNumberPosition, includeToC, displayDocumentTitles,
    setPageBreaks, setPageNumberPosition, setIncludeToC, setDisplayDocumentTitles
  } = usePublishingOptions(projectSettings as PublishOptions);

  useEffect(() => {
    if (projectSettings.font && projectSettings.font !== font.name) {
      setFont(projectSettings.font as EditorFont);
    }

    if (projectSettings.fontSize && projectSettings.fontSize !== fontSize) {
      setFontSize(projectSettings.fontSize as number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSettings, open]);

  const handleConfirm = () => {
    const newSettings:ProjectSettings = { pageBreaks, pageNumberPosition, includeToC, displayDocumentTitles, font, fontSize };
    dispatch(setProjectSettings(newSettings));
    onClose();
  };

  const handleClose = () => {
    if (projectSettings.font && projectSettings.font !== font.name) {
      setFont(projectSettings.font as EditorFont);
    }

    if (projectSettings.fontSize && projectSettings.fontSize !== fontSize) {
      setFontSize(projectSettings.fontSize as number);
    }

    if (projectSettings.pageBreaks && projectSettings.pageBreaks !== pageBreaks) {
      setPageBreaks(projectSettings.pageBreaks as string);
    }

    if (projectSettings.pageNumberPosition && projectSettings.pageNumberPosition !== pageNumberPosition) {
      setPageNumberPosition(projectSettings.pageNumberPosition as string);
    }

    if (projectSettings.includeToC !== includeToC) {
      setIncludeToC(Boolean(projectSettings.includeToC));
    }

    if (projectSettings.displayDocumentTitles && projectSettings.displayDocumentTitles !== displayDocumentTitles) {
      setDisplayDocumentTitles(Boolean(projectSettings.displayDocumentTitles));
    }
    onClose();
  };

  return (
    <Box width="100%" position="relative" overflow={{ overflowY: 'scroll', overflowX: 'hidden' }} height="calc(100vh - 64px)" p={4} display={ open ? 'block' : 'none' } sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}>
        <Typography mb={1}>Project Settings</Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>Font Options</Typography>
            <SettingBox>
              <Typography mb={1}>Default Font</Typography>
              <Autocomplete
                value={font}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFont(newValue);
                  }
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
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
                options={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]}
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
            <Typography variant="subtitle2" mb={2} fontSize={14} fontWeight={600}>Publishing Options</Typography>
            <SettingBox>
              <PageBreaksSelect />
              <PageNumberPositionSelect />
              <DisplayDocumentTitlesSelect />
              <IncludeToCSelect />
            </SettingBox>
          </Grid>
        </Grid>

        <Box position="absolute" bottom="2rem" width="100%" right="2rem" textAlign="right">
          <DialogActionButtons
            onCancel={handleClose}
            onConfirm={handleConfirm}
          />
        </Box>
    </Box>
  );
}

export default ProjectSettingsScreen;

