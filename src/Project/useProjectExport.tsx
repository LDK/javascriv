import { Button } from "@mui/material";
import { useState } from "react";
import ExportOptions from "./ExportOptions";

type exportProps = {
  handleExportReady: (name:string, extension:string) => void;
};

const useProjectExport = ({ handleExportReady }: exportProps) => {
  const [exportOptionsOpen, setExportOptionsOpen] = useState(false);

  const handleExportClose = () => {
    setExportOptionsOpen(false);
  };

  const ExportButton = ({variant}: {variant?: 'text' | 'outlined' | 'contained'}) => (
    <Button onClick={() => {
      setExportOptionsOpen(true);
    }} color="primary" variant={variant || 'text'}>
      Export...
    </Button>
  );

  const ExportDialog = () => (
    <ExportOptions 
      onReady={handleExportReady}
      optionsOpen={Boolean(exportOptionsOpen)}
      onClose={handleExportClose}
     />
  );

  return {
    ExportButton, ExportDialog, setExportOptionsOpen
  };
};

export default useProjectExport;