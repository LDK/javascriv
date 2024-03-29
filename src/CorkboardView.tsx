import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import { ProjectFile } from "./Project/ProjectTypes";
import { KeyboardDoubleArrowRightTwoTone as GoIcon } from "@mui/icons-material";
import { FolderCopyTwoTone as FolderIcon, DescriptionTwoTone as DocIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { selectOpenFolders, setAdding, setOpenFolders } from "./redux/projectSlice";

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
    <Grid item xs={12} sm={6} lg={4} key={index}>
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

        <Box sx={{ pointerEvents: 'none' }} className="go-button-wrapper show-mobile" position="absolute" bottom={0} left={0} width="100%" pt={1} pb={0} pr={1} textAlign={'right'} bgcolor={theme.palette[`itemBar${item.type === 'file' ? 'Document' : 'Folder'}`].main} color={theme.palette.primary.contrastText} onClick={(e) => {
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
  const dispatch = useDispatch();
  const theme = useTheme();

  return (
    <Box id="corkboard-view" zIndex={4} p={4} sx={{ overflowY: 'scroll' }} height="calc(100vh - 60px)" display="block" position="relative">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={700} component="h2" mb={0}>
            Folder: {folder.name}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <Typography sx={{ cursor: 'pointer' }} m={0} p={0} onClick={() => {
            dispatch(setAdding({ type: 'file', subType: 'document' }));
          }}>
            <DocIcon /> Add a new document
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <Typography sx={{ cursor: 'pointer' }} m={0} p={0} onClick={() => {
            dispatch(setAdding({ type: 'folder' }));
          }}>
            <FolderIcon /> Add a new folder
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ width: '100%', my: 2 }} />

          <Typography variant="body1" component="p" mb={0}>
            Folder contents
          </Typography>

          <Typography variant="body1" component="p" mb={2}>
            {folder.path} -- {folder.children?.length} items
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>

        </Grid>
      </Grid>

      <Box p={0} m={0}>
        <Grid container spacing={2} className="folder-contents" maxHeight={{xs: '280px', md: '500px', lg: 'unset' }} sx={{ overflowY: {
          xs: 'scroll',
          lg: 'unset'},
          position: 'relative',
          pb: 2
        }}>
          {folder?.children?.map((item, index) => <CorkboardCard {...{ item, index, key: `folder-card-${index}`, handleDocumentClick }} />)}
        </Grid>
        <Box zIndex={2} position="absolute" display={{ md: 'none' }} className="overlay" bottom="0" left="0" width="100%" height="100%" bgcolor="transparent" sx={{ backgroundImage: `linear-gradient(to bottom, transparent 70%, ${theme.palette.background.default})`, pointerEvents: 'none' }} />
      </Box>
    </Box>
  );
};

export default CorkboardView;