// Publish/PublishTreeItem.tsx
import { TransitionProps } from '@mui/material/transitions';
import { TreeItem, treeItemClasses, TreeItemProps } from "@mui/lab";
import { alpha, Checkbox, Collapse, styled, Typography } from "@mui/material";
import { animated, useSpring } from '@react-spring/web';
import { PublishItem } from './PublishTree';
import { useDrag, useDrop } from 'react-dnd';

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
  item: PublishItem;
  isGreyed: boolean;
  onReorder: (draggedPath: string, targetPath: string) => void;
  onCheck: (updatedItems: PublishItem[]) => void;
  publishItems: PublishItem[];
  setPublishItems: (items: PublishItem[]) => void;
};

interface DraggedFileTreeItem {
  path: string;
}

const PublishTreeItem: React.FC<FileTreeItemProps> = ({ item, isGreyed, onReorder, onCheck, publishItems, setPublishItems }) => {
  const [, dragRef] = useDrag(() => ({
    type: 'FILE_TREE_ITEM',
    item: { path: item.path },
  }));

  const [, dropRef] = useDrop({
    accept: 'FILE_TREE_ITEM',
    drop: (draggedItem: DraggedFileTreeItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      onReorder(draggedItem.path, item.path);
    },
  });

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const updatedItems = updatePublishItems(publishItems, item.path, checked);
    setPublishItems(updatedItems);
    onCheck(updatedItems);
  };

  const updatePublishItems = (
    items: PublishItem[],
    targetPath: string,
    included: boolean
  ): PublishItem[] => {
    return items.map((i) => {
      if (i.path === targetPath) {
        return { ...i, included, children: updatePublishItems(i.children, targetPath, included) };
      } else {
        return { ...i, children: updatePublishItems(i.children, targetPath, included) };
      }
    });
  };

  return (
    <StyledTreeItem
      key={item.path}
      nodeId={item.path}
      label={
        <div style={{ display: 'flex', alignItems: 'flex-start' }}
          ref={(instance) => {
            dragRef(dropRef(instance));
          }}
        >
          <Checkbox
            checked={item.included}
            disabled={isGreyed}
            onChange={handleCheck}
            size="small"
            color="primary"
          />
          <Typography variant="body2">{item.name}</Typography>
        </div>
      }
    >
      {item.children.map((child) => (
        <PublishTreeItem
          key={child.path}
          item={child}
          isGreyed={isGreyed || !item.included}
          onReorder={onReorder}
          onCheck={onCheck}
          publishItems={publishItems}
          setPublishItems={setPublishItems}
        />
      ))}
    </StyledTreeItem>
  );
};

export default PublishTreeItem;