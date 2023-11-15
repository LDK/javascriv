import { Button } from "@mui/material";
import { useState } from "react";
import PublishOptionsDialog from "./PublishOptions";
import { PublishOptions } from "../Project/ProjectTypes";

const usePublishing = (settings?:PublishOptions) => {
  const [publishOptionsOpen, setPublishOptionsOpen] = useState(false);

  const PublishButton = ({ variant }: { variant?: 'text' | 'outlined' | 'contained' }) => (
    <Button onClick={() => { setPublishOptionsOpen(true) }} color="primary" variant={variant || "text"}>
      Publish
    </Button>
  );

  const OptionsDialog = () => (
    <PublishOptionsDialog {...{ settings }} optionsOpen={publishOptionsOpen} onClose={() => { setPublishOptionsOpen(false) }} />
  );

  return { PublishButton, PublishOptionsDialog: OptionsDialog };
};

export default usePublishing;