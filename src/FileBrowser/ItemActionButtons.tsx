// Browser/ItemActionButtons.tsx

import { IconButton, SvgIconTypeMap, Tooltip } from "@mui/material";
import { Delete, Edit, ArrowUpward, ArrowDownward, MoreVert } from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

type ActionButtonProps = {
  action: (event: React.MouseEvent) => void;
};

type ActionButtonWrapperProps = ActionButtonProps & {
  title: string;
  Component: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; };
};

const ActionButton = ({ action, title, Component }: ActionButtonWrapperProps) => (
  <Tooltip title={title}>
    <IconButton size="small" edge="end" onClick={action}>
      <Component fontSize="small" />
    </IconButton>
  </Tooltip>
);

export const DeleteButton = ({ action }: ActionButtonProps) => (
  <ActionButton title="Delete" action={action} Component={Delete} />
);

export const EditButton = ({ action }: ActionButtonProps) => (
  <ActionButton title="Rename" action={action} Component={Edit} />
);

export const UpButton = ({ action }: ActionButtonProps) => (
  <ActionButton title="Move Up" action={action} Component={ArrowUpward} />
);

export const DownButton = ({ action }: ActionButtonProps) => (
  <ActionButton title="Move Down" action={action} Component={ArrowDownward} />
);

export const MoreButton = ({ action }: ActionButtonProps) => (
  <ActionButton title="More" action={action} Component={MoreVert} />
);
