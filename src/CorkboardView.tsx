import { Autocomplete, Box, Card, Divider, Grid, TextField, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getProjectSettings, setProjectSettings } from "./redux/projectSlice";
import useDialogUI from "./theme/useDialogUI";
import { useEffect, useState } from "react";
import { EditorFont, editorFonts } from "./Editor/EditorFonts";
import { usePublishingOptions } from "./Publish/PublishOptions";
import { Project, ProjectFile, ProjectSettings } from "./Project/ProjectTypes";

import * as DOMPurify from 'dompurify';
import { FolderTwoTone, LaunchTwoTone } from "@mui/icons-material";

type CorkboardProps = {
  open: boolean;
  folder?: ProjectFile;
  handleDocumentClick: (item: ProjectFile) => void;
  setCorkboard: (corkboard?: ProjectFile) => void;
};

const CorkboardView = ({ open, folder, handleDocumentClick, setCorkboard }:CorkboardProps) => {
  const projectSettings = useSelector(getProjectSettings);
  const [font, setFont] = useState<EditorFont>(projectSettings?.font as EditorFont || { name: 'Roboto', value: 'Roboto' });
  const [fontSize, setFontSize] = useState<number>(projectSettings?.fontSize as number || 12);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (projectSettings.font && projectSettings.font !== font.name) {
      setFont(projectSettings.font as EditorFont);
    }

    if (projectSettings.fontSize && projectSettings.fontSize !== fontSize) {
      setFontSize(projectSettings.fontSize as number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSettings, open]);
 
  const PreviewBox = ({content}:{content?:string}) => {
    const clean = content ? DOMPurify.sanitize(content) : '<p>(Empty file)</p>';
    return (
      <div dangerouslySetInnerHTML={{ __html: clean }} />
    );
  };

  return (
    <Box width="100%" position="relative" overflow={{ overflowY: 'scroll', overflowX: 'hidden' }} height="calc(100vh - 64px)" p={4} display={ open ? 'block' : 'none' } sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}>
        <Typography mb={1}>{folder?.name}</Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {
          folder?.children?.map((child, i) => {
            return (
            <Grid item xs={12} md={6} key={`corkboard-${i}`}>
              <Card sx={{ 
                p: 2, 
                cursor: 'pointer', 
                maxHeight: '300px', 
                overflowY: 'hidden',
                position: 'relative',
                '&::after': child.type === 'folder' ? undefined : { // Adding the pseudo-element
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '75%', // Adjust the height based on your needs
                  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))'
                }
              }} onClick={() => {
                if (child.type === 'folder') {
                  setCorkboard(child);
                } else {
                  handleDocumentClick(child);
                }
              }}>
                {child.name}
                <Divider sx={{ my: 1 }} />
                {child.type === 'folder' ? (
                  <Typography variant="body2" color="text.secondary">
                    <FolderTwoTone /> {child.children?.length} items
                  </Typography>
                ) : <PreviewBox content={child.content} />
                }
                <LaunchTwoTone sx={{ position: 'absolute', right: '1rem', bottom: '1rem', display: 'block', zIndex: 2 }} />
              </Card>
            </Grid>
            )
          })}
        </Grid>
    </Box>
  );
}

export default CorkboardView;

