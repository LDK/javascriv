// FileTree/FileTreeItem.tsx
import { TransitionProps } from '@mui/material/transitions';
import { TreeItem, treeItemClasses, TreeItemProps } from "@mui/lab";
import { alpha, Checkbox, Collapse, styled, Typography, useTheme } from "@mui/material";
import { animated, useSpring } from '@react-spring/web';
import { FileTreeItem } from './FileTree';

function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: 'translate3d(20px,0,0)',
    },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
  <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

export type FileTreeItemProps = {
  item: FileTreeItem;
  isGreyed: boolean;
  onCheck: (updatedItems: FileTreeItem[]) => void;
  treeItems: FileTreeItem[];
  setTreeItems: (items: FileTreeItem[]) => void;
};

const CheckboxTreeItem: React.FC<FileTreeItemProps> = ({ item, isGreyed, onCheck, treeItems, setTreeItems }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const updatedItems = updateTreeItems(treeItems, item.path, checked);
    setTreeItems(updatedItems);
    onCheck(updatedItems);
  };

  const updateTreeItems = (
    items: FileTreeItem[],
    targetPath: string,
    included: boolean
  ): FileTreeItem[] => {
    return items.map((i) => {
      if (i.path === targetPath) {
        return { ...i, included, children: updateTreeItems(i.children, targetPath, included) };
      } else {
        return { ...i, children: updateTreeItems(i.children, targetPath, included) };
      }
    });
  };

  return (
    <StyledTreeItem
      key={item.path}
      nodeId={item.path}
      label={
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Checkbox
            checked={item.included}
            disabled={isGreyed}
            onChange={handleCheck}
            size="small"
            color={mode === 'dark' ? 'info' : 'primary'}
          />
          <Typography variant="body2" pt={1}>{item.name}</Typography>
        </div>
      }
    >
      {item.children.map((child) => (
        <CheckboxTreeItem
          key={child.path}
          item={child}
          isGreyed={isGreyed || !item.included}
          {...{ onCheck, treeItems, setTreeItems }}
        />
      ))}
    </StyledTreeItem>
  );
};

export default CheckboxTreeItem;