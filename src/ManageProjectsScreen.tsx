import { Box, Divider, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { UserState } from "./redux/userSlice";
import { GridColDef, GridRenderCellParams, GridSortDirection } from "@mui/x-data-grid";
import { ProjectListing, ProjectState } from "./Project/ProjectTypes";
import { CollabButton, DeleteButton, DuplicateButton, EditButton, LaunchButton, LeaveButton } from "./ProjectBrowser/ItemActionButtons";
import DuplicateProjectDialog from "./Project/DuplicateProjectDialog";
import { SetOpenFunction } from "./ProjectBrowser/useBrowserDialog";
import RenameProjectDialog from "./Project/RenameProjectDialog";
import DeleteProjectDialog from "./Project/DeleteProjectDialog";
import ProjectCollabsDialog from "./Project/ProjectCollabsDialog";
import ProjectsTable from "./Project/ProjectsTable";
import { isFunction } from "@mui/x-data-grid/internals";
import LeaveProjectDialog from "./Project/LeaveProjectDialog";
import { ConfirmButton } from "./Components/DialogButtons";
import { useDispatch } from "react-redux";
import { setProjectId } from "./redux/projectSlice";

export type ManageProjectsDialogProps = {
  open: boolean;
  onClose: () => void;
  user: UserState;
  loadProject: (arg:ProjectListing, token: string) => void;
  getProjectListings: (arg: boolean) => void;
  currentProject?: ProjectState;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: string;
  activeValue: string;
};

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, activeValue, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== activeValue}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === activeValue && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

type ActionFieldsProps = {
  actions: string[];
  handleLaunch?: (id: number) => void;
  handleRename?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleDuplicate?: (id: number) => void;
  handleCollab?: (id: number) => void;
  handleLeave?: (id: number) => void;
}

const actionField = (params:ActionFieldsProps) => {
  const { actions, handleLaunch, handleRename, handleDelete, handleDuplicate, handleCollab, handleLeave } = params;
  return {
    field: 'actions',
    headerName: 'Actions',
    width: 250,
    sortable: false,
    valueGetter: (params:GridRenderCellParams) => params.id,
    renderCell: (params:GridRenderCellParams) => (
      <Box display="flex" justifyContent="space-between">
        {(actions.includes('launch') && isFunction(handleLaunch)) && <LaunchButton action={(e) =>{ e.stopPropagation(); handleLaunch(params.value) }} />}
        {(actions.includes('rename') && isFunction(handleRename)) && <EditButton action={(e) =>{ e.stopPropagation(); handleRename(params.value)}} />}
        {(actions.includes('delete') && isFunction(handleDelete)) && <DeleteButton action={(e) =>{ e.stopPropagation(); handleDelete(params.value)}} />}
        {(actions.includes('duplicate') && isFunction(handleDuplicate)) && <DuplicateButton action={(e) =>{ e.stopPropagation(); handleDuplicate(params.value)}} />}
        {(actions.includes('collab') && isFunction(handleCollab)) && <CollabButton action={(e) =>{ e.stopPropagation(); handleCollab(params.value)}} />}
        {(actions.includes('leave') && isFunction(handleLeave)) && <LeaveButton action={(e) =>{ e.stopPropagation(); handleLeave(params.value)}} />}
      </Box>
    )
  };

}

const ManageProjectsScreen = ({ open, onClose, user, loadProject, getProjectListings, currentProject }:ManageProjectsDialogProps) => {
  const { projects, token } = user;

  const [duplicateOpen, setDuplicateOpen] = useState<ProjectListing | false>(false);
  const [renameOpen, setRenameOpen] = useState<ProjectListing | false>(false);
  const [deleteOpen, setDeleteOpen] = useState<ProjectListing | false>(false);
  const [collabOpen, setCollabOpen] = useState<ProjectListing | false>(false);
  const [leaveOpen, setLeaveOpen] = useState<ProjectListing | false>(false);
  const [activeTab, setActiveTab] = useState<string>('created');

  const theme = useTheme();
  const dispatch = useDispatch();

  const isDark = theme.palette.mode === 'dark';

  const handleRename = (id: number) => {
    const project = findProjectListing(id);
    setRenameOpen(project || false);
  };

  const handleCollab = (id: number) => {
    const project = findProjectListing(id);
    setCollabOpen(project || false);
  };

  const handleLeave = (id: number) => {
    const project = findProjectListing(id);
    setLeaveOpen(project || false);
  };

  const handleLaunch = (id: number) => {
    const project = findProjectListing(id);
    if (project && token) {
      loadProject(project, token);
    }
    onClose();
  }

  const handleDelete = (id: number) => {
    const project = findProjectListing(id);
    setDeleteOpen(project || false);
  };

  const handleDuplicate = (id: number) => {
    const project = findProjectListing(id);
    setDuplicateOpen(project || false);
  };

  const creatorColumns: GridColDef[] = [
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
          {params.value && params.value.username}
        </Typography>
      ) 
    },
    actionField({ actions: ['launch', 'rename', 'delete', 'duplicate', 'collab'], handleLaunch, handleRename, handleDelete, handleDuplicate, handleCollab })
  ];

  if (!projects || !token || !open) {
    return null;
  }

  const findProjectListing = (id: number) => {
    return (projects.Created.find((project) => project.id === id) || projects.Collaborator.find((project) => project.id === id)) as ProjectListing;
  }

  const formatDateString = (dateString: string):string => {
    if (!dateString) return ('');
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  }
  
  const defaultSort = [{
    field: 'lastEdited',
    sort: 'desc' as GridSortDirection,
  }];

  // slice off the last entry (actions and replace it with a new call to actionField)
  const collabColumns = creatorColumns.slice(0, creatorColumns.length - 1);
  collabColumns.push(actionField({ actions: ['launch', 'leave'], handleLaunch, handleLeave }))

  return (
    <Box width="100%"  height="calc(100vh - 64px)" p={4} 
      zIndex={5}
      position={{ xs: "absolute", lg: "relative"}}
      top={{ xs: '56px', sm: 0 }} left={0}
      overflow={{ overflowY: 'scroll', overflowX: 'hidden' }}
      display={ open ? 'block' : 'none' }
      sx={{ backgroundColor: theme.palette.grey[isDark ? 800 : 100] }}
    >
      <Typography mb={2} fontWeight={700}>Manage Projects</Typography>

      <Divider sx={{ mb: 2 }} />

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="Projects">
        <Tab label="Created Projects" value="created" />

        <Tab label="Collaborating Projects" value="collab" />
      </Tabs>

      <CustomTabPanel value="created" index={0} activeValue={activeTab}>
        <ProjectsTable id="created"
          initSort={defaultSort}
          columns={creatorColumns}
          label="Created Projects"
          projectList={projects.Created}
          emptyText="You have not created any projects."
        />
      </CustomTabPanel>
      
      <CustomTabPanel value="collab" index={1} activeValue={activeTab}>
        <ProjectsTable id="collab"
          label="Collaborating Projects"
          projectList={projects.Collaborator} 
          columns={collabColumns}
          initSort={defaultSort}
          emptyText="You are not currently collaborating on any projects."
        />
      </CustomTabPanel>

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

      <LeaveProjectDialog
        open={Boolean(leaveOpen)}
        project={leaveOpen || undefined}
        setOpen={setLeaveOpen as SetOpenFunction}
        onClose={() => { setLeaveOpen(false); getProjectListings(true); }}
        callback={() => { getProjectListings(true) }}
      />

      <DeleteProjectDialog
        open={Boolean(deleteOpen)}
        project={deleteOpen || undefined}
        setOpen={setDeleteOpen as SetOpenFunction}
        onClose={() => { setDeleteOpen(false); }}
        callback={((deletedId?:number) => {
          if (currentProject && deletedId && currentProject.id === deletedId) {
            dispatch(setProjectId(undefined));
          }
          getProjectListings(true);
        })}
      />

        <Box position="absolute" bottom="2rem" width="100%" right="2rem" textAlign="right">
          <ConfirmButton onClick={onClose} {...{ mode: theme.palette.mode }} label="Done" />
        </Box>

    </Box>
  );
}

export default ManageProjectsScreen;
