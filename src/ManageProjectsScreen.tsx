import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { getProjectSettings } from "./redux/projectSlice";
import { useEffect, useState } from "react";
import { EditorFont } from "./Editor/EditorFonts";
import { UserState } from "./redux/userSlice";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ProjectListing } from "./Project/ProjectTypes";
import { CollabButton, DeleteButton, DuplicateButton, EditButton } from "./ProjectBrowser/ItemActionButtons";

type ManageProjectsDialogProps = {
  open: boolean;
  onClose: () => void;
  user: UserState;
};

const ManageProjectsScreen = ({ open, onClose, user }:ManageProjectsDialogProps) => {
  const { projects, token } = user;
    
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

  if (!projects || !token || !open) {
    return null;
  }

  const handleRename = (id: number) => {
    console.log(`Renaming project with ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Deleting project with ID: ${id}`);
  };

  const formatDateString = (dateString: string):string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  }
  
  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'ID', width: 60 },
    { field: 'title', headerName: 'Title', width: 200,
      renderCell: (params) => (
        // <Box p={0} m={0}>
          <Typography fontWeight={700}>
            {params.value}
          </Typography>
        // </Box>
      ) 
    },
    { field: 'lastEdited', headerName: 'Last Edited', width: 150,
      renderCell: (params) => (
        // <Box p={0} m={0}>
          <Typography fontWeight={700}>
            {formatDateString(params.value as string).split(', ')[0].replace(',','')}<br />
            {formatDateString(params.value as string).split(', ')[1]}<br />
          </Typography>
        // </Box>
      ) 
    },
    { field: 'lastEditor', headerName: 'Last Editor', width: 100,
      renderCell: (params) => (
        // <Box p={0} m={0}>
          <Typography fontWeight={700}>
            {params.value.username}
          </Typography>
        // </Box>
      ) 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      valueGetter: (params) => params.id,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-between">
          <EditButton action={(e) =>{ e.stopPropagation(); handleRename(params.value)}} />
          <DeleteButton action={(e) =>{ e.stopPropagation(); handleDelete(params.value)}} />
          <DuplicateButton action={(e) =>{ e.stopPropagation(); handleDelete(params.value)}} />
          <CollabButton action={(e) =>{ e.stopPropagation(); handleDelete(params.value)}} />
        </Box>
      )
  }
  ];

  const ProjectsTable = ({ label, projectList }: { label: string, projectList: ProjectListing[] }) => (
    <Box>
      <Typography mb={1}>{label}</Typography>
      <Grid container maxWidth="xl" spacing={2}>
        <Grid item xs={12} key={`project-manager-created`}>
          <DataGrid
              sx={{
                "& .MuiDataGrid-columnHeaderTitle": {
                  whiteSpace: "normal",
                  lineHeight: "normal"
                },
                "& .MuiDataGrid-columnHeader": {
                  // Forced to use important since overriding inline styles
                  height: "unset !important"
                },
                "& .MuiDataGrid-columnHeaders": {
                  // Forced to use important since overriding inline styles
                  maxHeight: "168px !important"
                }
              }}
            checkboxSelection
            columns={columns}
            rows={projectList.map((project) => ({ id: project.id, title: project.title, lastEdited: project.lastEdited, lastEditor: project.lastEditor }))}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'Mui-even' : 'Mui-odd'
            }
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box width="100%" position="relative" overflow={{ overflowY: 'scroll', overflowX: 'hidden' }} height="calc(100vh - 64px)" p={4} display={ open ? 'block' : 'none' } sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}>
        <Typography mb={2} fontWeight={700}>Manage Projects</Typography>

        <Divider sx={{ mb: 2 }} />

        {Boolean(projects.Created.length) && <ProjectsTable label="Created Projects" projectList={projects.Created} />}
        {Boolean(projects.Collaborator.length) && <ProjectsTable label="Collaborating Projects" projectList={projects.Collaborator} />}


    </Box>
  );
}

export default ManageProjectsScreen;
