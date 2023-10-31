import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { UserState } from "./redux/userSlice";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
import { ProjectListing } from "./Project/ProjectTypes";
import { CollabButton, DeleteButton, DuplicateButton, EditButton, LaunchButton } from "./ProjectBrowser/ItemActionButtons";
import DuplicateProjectDialog from "./Project/DuplicateProjectDialog";
import { SetOpenFunction } from "./ProjectBrowser/useBrowserDialog";
import RenameProjectDialog from "./Project/RenameProjectDialog";
import DeleteProjectDialog from "./Project/DeleteProjectDialog";
import ProjectCollabsDialog from "./Project/ProjectCollabsDialog";

type ManageProjectsDialogProps = {
  open: boolean;
  onClose: () => void;
  user: UserState;
  loadProject: (arg:ProjectListing, token: string) => void;
  getProjectListings: (arg: boolean) => void;

};

const ManageProjectsScreen = ({ open, onClose, user, loadProject, getProjectListings }:ManageProjectsDialogProps) => {
  const { projects, token } = user;

  const [duplicateOpen, setDuplicateOpen] = useState<ProjectListing | false>(false);
  const [renameOpen, setRenameOpen] = useState<ProjectListing | false>(false);
  const [deleteOpen, setDeleteOpen] = useState<ProjectListing | false>(false);
  const [collabOpen, setCollabOpen] = useState<ProjectListing | false>(false);

  const [sort, setSort] = useState<GridSortModel>([{ field: 'lastEdited', sort: 'desc' }]);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!projects || !token || !open) {
    return null;
  }

  const handleRename = (id: number) => {
    const project = findProjectListing(id);
    setRenameOpen(project || false);
  };

  const handleCollab = (id: number) => {
    const project = findProjectListing(id);
    setCollabOpen(project || false);
  };

  const handleLaunch = (id: number) => {
    const project = findProjectListing(id);
    loadProject(project, token);
    onClose();
  }

  const handleDelete = (id: number) => {
    const project = findProjectListing(id);
    setDeleteOpen(project || false);
  };

  const findProjectListing = (id: number) => {
    return (projects.Created.find((project) => project.id === id) || projects.Collaborator.find((project) => project.id === id)) as ProjectListing;
  }

  const handleDuplicate = (id: number) => {
    const project = findProjectListing(id);
    setDuplicateOpen(project || false);
  };

  const formatDateString = (dateString: string):string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  }
  
  const columns: GridColDef[] = [
    { 
      field: 'title', headerName: 'Title', width: 200,
      renderCell: (params) => (
        <Typography fontWeight={700}>
          {params.value}
        </Typography>
      ) 
    },
    { field: 'lastEdited', headerName: 'Last Edited', width: 150,
      renderCell: (params) => (
        <Typography fontWeight={700}>
          {formatDateString(params.value as string).split(', ')[0].replace(',','')}<br />
          {formatDateString(params.value as string).split(', ')[1]}<br />
        </Typography>
      ) 
    },
    { field: 'lastEditor', headerName: 'Last Editor', width: 100,
      renderCell: (params) => (
        <Typography fontWeight={700}>
          {params.value.username}
        </Typography>
      ) 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      sortable: false,
      valueGetter: (params) => params.id,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-between">
          <LaunchButton action={(e) =>{ e.stopPropagation(); handleLaunch(params.value) }} />
          <EditButton action={(e) =>{ e.stopPropagation(); handleRename(params.value)}} />
          <DeleteButton action={(e) =>{ e.stopPropagation(); handleDelete(params.value)}} />
          <DuplicateButton action={(e) =>{ e.stopPropagation(); handleDuplicate(params.value)}} />
          <CollabButton action={(e) =>{ e.stopPropagation(); handleCollab(params.value)}} />
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
            onSortModelChange={(model) => {
              setSort(model);
            }}
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
            
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
              sorting: {
                sortModel: sort
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
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

      <DuplicateProjectDialog
        open={Boolean(duplicateOpen)}
        project={duplicateOpen || undefined}
        setOpen={setDuplicateOpen as SetOpenFunction}
        onClose={() => { setDuplicateOpen(false); }}
        callback={(() => { getProjectListings(true) })}
      />

      <RenameProjectDialog
        open={Boolean(renameOpen)}
        project={renameOpen || undefined}
        setOpen={setRenameOpen as SetOpenFunction}
        onClose={() => { setRenameOpen(false); }}
        callback={(() => { getProjectListings(true) })}
      />

      <ProjectCollabsDialog
        open={Boolean(collabOpen)}
        project={collabOpen || undefined}
        setOpen={setCollabOpen as SetOpenFunction}
        onClose={() => { setCollabOpen(false); getProjectListings(true); }}
        
      />

      <DeleteProjectDialog
        open={Boolean(deleteOpen)}
        project={deleteOpen || undefined}
        setOpen={setDeleteOpen as SetOpenFunction}
        onClose={() => { setDeleteOpen(false); }}
        callback={(() => { getProjectListings(true) })}
      />
    </Box>
  );
}

export default ManageProjectsScreen;
