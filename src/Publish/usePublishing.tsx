import { Button } from "@mui/material";
import { useState } from "react";
import PublishOptionsDialog from "./PublishOptions";

const usePublishing = () => {
  const [publishOptionsOpen, setPublishOptionsOpen] = useState(false);

  const PublishButton = ({ variant }: { variant?: 'text' | 'outlined' | 'contained' }) => (
    <Button onClick={() => { setPublishOptionsOpen(true) }} color="primary" variant={variant || "text"}>
      Publish
    </Button>
  );

  const OptionsDialog = () => (
    <PublishOptionsDialog optionsOpen={publishOptionsOpen} onClose={() => { setPublishOptionsOpen(false) }} />
  );

  return { PublishButton, PublishOptions: OptionsDialog };
};

export default usePublishing;