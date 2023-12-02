import { Box, Typography, Grid } from "@mui/material";
import { GridColDef, GridSortModel, DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { ProjectListing } from "./ProjectTypes";
import { useSelector } from "react-redux";
import { getActiveScreen } from "../redux/appSlice";

export type ProjectsTableProps = {
  columns: GridColDef[];
  initSort?: GridSortModel;
  label: string;
  projectList: ProjectListing[];
  id: string;
  emptyText?: string;
}

const ProjectsTable = ({ columns, initSort, label, projectList, id, emptyText }:ProjectsTableProps) => {
  const [sort, setSort] = useState<GridSortModel | undefined>(initSort || undefined);
  const activeScreen = useSelector(getActiveScreen);
  const open = (activeScreen === 'projectManagement');

  if (!projectList || projectList.length === 0) {
    return (
      <Box id={id}>
        <Typography>{emptyText || 'No projects found.'}</Typography>
      </Box>
    );
  }

  const dataGrid= (
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
  );

  return (
    <Box id={id}>
      <Typography mb={1}>{label}</Typography>
      <Grid container maxWidth="xl" spacing={2}>
        <Grid item xs={12} key={`project-manager-${id}`}>
          {open ? dataGrid : <></>}
        </Grid>
      </Grid>
    </Box>
  );
}


export default ProjectsTable;