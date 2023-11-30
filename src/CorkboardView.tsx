import { Box, Grid, Typography, useTheme } from "@mui/material";
import { ProjectFile } from "./Project/ProjectTypes";
import { KeyboardDoubleArrowRightTwoTone as GoIcon } from "@mui/icons-material";
import { FolderCopyTwoTone as FolderIcon, DescriptionTwoTone as DocIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { selectOpenFolders, setOpenFolders } from "./redux/projectSlice";

type CorkboardCardProps = {
  item: ProjectFile;
  index: number;
  handleDocumentClick: (item: ProjectFile) => void;
};

const CorkboardCard = ({ item, index, handleDocumentClick }:CorkboardCardProps) => {
  const openFolders = useSelector(selectOpenFolders) || [];
  const dispatch = useDispatch();
  const theme = useTheme();

  const cardBgColor = theme.palette[`${item.type === 'file' ? 'document' : 'folder'}Card`].main;

  const addOpenFolder = (folder: string) => {
    // folder minus any leading slash
    const path = folder.replace(/^\//, '');

    if (!openFolders.includes(path)) {
      const toAdd = [path];

      // Segment folder path and add each segment to openFolders
      const segments = path.split('/');

      for (let i = 1; i < segments.length; i++) {
        const addPath = segments.slice(0, i + 1).join('/');
        if (!openFolders.includes(addPath) && !toAdd.includes(addPath)) {
          toAdd.push(addPath);
        }
      }

      dispatch(setOpenFolders([...openFolders, ...toAdd]));
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <Box className="corkboard-card" position="relative" bgcolor={cardBgColor} p={0} boxShadow={2} borderRadius=".5rem" overflow="hidden" 
        sx={{
          cursor: 'pointer'
        }}
        onClick={() => {
          handleDocumentClick(item);

          if (item.type === 'folder') {
            addOpenFolder(item.path);
          }
        }}
      >
        <Box p={1} bgcolor={theme.palette[`${item.type === 'file' ? 'document' : 'folder'}CardHeader`].main} color={theme.palette.primary.contrastText}>
          <Grid container spacing={0}>
            <Grid item xs={11}>
              <Typography variant="body2" fontWeight={700} component="h3" gutterBottom>
                {item.name}
              </Typography>
            </Grid>
            <Grid item xs={1} p={0}>
              {item.type === 'folder' ? <FolderIcon sx={{ width: '100%' }} /> : <DocIcon />}
            </Grid>
          </Grid>
        </Box>

        <Box p={2} height={150} overflow={'hidden'} position="relative">
          {item.content && <div dangerouslySetInnerHTML={{ __html: item.content }} />}

        {/* Absolutely positioned overlay that starts transparent at the top and fades to cardBgColor at the very bottom.. top 90% should be transparent before the gradient begins */}
        <Box position="absolute" top={0} left={0} width="100%" height="100%" bgcolor="transparent" sx={{ backgroundImage: `linear-gradient(to bottom, transparent 60%, ${cardBgColor})` }} />
        </Box>

        <Box className="go-button-wrapper show-mobile" position="absolute" bottom={0} left={0} width="100%" pt={1} pb={0} pr={1} textAlign={'right'} bgcolor={theme.palette[`itemBar${item.type === 'file' ? 'Document' : 'Folder'}`].main} color={theme.palette.primary.contrastText} onClick={(e) => {
          e.stopPropagation();
        }}>
          <GoIcon />
        </Box>
      </Box>
    </Grid>
  )
};
type CorkboardViewProps = {
  folder: ProjectFile;
  handleDocumentClick: (item: ProjectFile) => void;
};

const CorkboardView = ({ folder, handleDocumentClick }:CorkboardViewProps) => {
  return (
    <Box p={4} sx={{ overflowY: 'scroll' }} height="calc(100vh - 60px)" display="block" position="relative">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h5" fontWeight={700} component="h2" mb={0}>
            Folder contents: {folder.name}
          </Typography>

          <Typography variant="body1" component="p" mb={2}>
            {folder.path} -- {folder.children?.length} items
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>

        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {folder?.children?.map((item, index) => <CorkboardCard {...{ item, index, handleDocumentClick }} />)}
      </Grid>
    </Box>
  );
};

export default CorkboardView;