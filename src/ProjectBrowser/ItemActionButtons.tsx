// Browser/ItemActionButtons.tsx

import { IconButton, SvgIconTypeMap, Tooltip } from "@mui/material";
import { FolderSharedTwoTone as Collab, DeleteTwoTone as Delete, DriveFileRenameOutlineTwoTone as Edit, ContentCopyTwoTone as Duplicate, ArrowUpward, ArrowDownward, MoreVert, Refresh } from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

type ActionButtonProps = {
  action: (event: React.MouseEvent) => void;
  disabled?: boolean;
};

type ActionButtonWrapperProps = ActionButtonProps & {
  title: string;
  Component: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; };
};

const ActionButton = ({ action, title, Component, disabled }: ActionButtonWrapperProps) => (
  <Tooltip title={title}>
    <span>
      <IconButton size="small" edge="end" onClick={action} disabled={disabled}>
        <Component fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export const DeleteButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="Delete" {...{ action, disabled }} Component={Delete} />
);

export const CollabButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="Manage Collaborators" {...{ action, disabled }} Component={Collab} />
);

export const EditButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="Rename"  {...{ action, disabled }} Component={Edit} />
);

export const DuplicateButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="Duplicate"  {...{ action, disabled }} Component={Duplicate} />
);

export const RefreshButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="Refresh"  {...{ action, disabled }} Component={Refresh} />
);

export const UpButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="Move Up"  {...{ action, disabled }} Component={ArrowUpward} />
);

export const DownButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="Move Down"  {...{ action, disabled }} Component={ArrowDownward} />
);

export const MoreButton = ({ action, disabled }: ActionButtonProps) => (
  <ActionButton title="More"  {...{ action, disabled }} Component={MoreVert} />
);
