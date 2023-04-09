import React, { useState } from 'react';
import { TreeItem, TreeView } from '@mui/lab';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { BrowserItem } from './filesSlice';
import { useDrag, useDrop } from 'react-dnd';

export interface FilteredFileTreeProps {
  items: BrowserItem[];
  onReorder: (draggedPath: string, targetPath: string) => void;
  onCheck: (path: string, isChecked: boolean) => void;
}

const FileTreeItem: React.FC<{
  item: BrowserItem;
  onReorder: (draggedPath: string, targetPath: string) => void;
  onCheck: (path: string, isChecked: boolean) => void;
  checkedItems: string[];
  parentChecked: boolean;
}> = ({ item, onReorder, onCheck, checkedItems, parentChecked }) => {
  const isChecked = checkedItems.includes(item.path);
  const isDisabled = !parentChecked;
  const isGreyed = isDisabled || !isChecked;
  const isFolder = item.type === 'folder';

  const [, dragRef] = useDrag(() => ({
    type: 'file',
    item,
  }));

  const [, dropRef] = useDrop(() => ({
    accept: 'file',
    drop: (draggedItem: any) => {
      onReorder(draggedItem.item.path, item.path);
    },
  }));

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheck(item.path, event.target.checked);
  };

  return (
    <div ref={(node) => dragRef(dropRef(node))} key={item.path}>
      <FormControlLabel
        sx={{ alignItems: 'flex-start' }}
        control={<Checkbox sx={{ pt: 0 }} checked={isChecked} onChange={handleCheck} disabled={isDisabled} />}
        label={
          <TreeItem  nodeId={item.path} label={<Typography style={{ fontStyle: isGreyed ? 'italic' : 'normal', color: isGreyed ? 'grey' : 'inherit' }}>{item.name}</Typography>}>
            {isFolder &&
              item.children &&
              item.children
                .filter((child) => child.subType !== 'image')
                .map((child) => (
                  <FileTreeItem key={child.path} item={child} onReorder={onReorder} onCheck={onCheck} checkedItems={checkedItems} parentChecked={isChecked} />
                ))}
          </TreeItem>
        }
      />
    </div>
  );
};

const FilteredFileTree: React.FC<FilteredFileTreeProps> = ({ items, onReorder, onCheck }) => {
  const [checkedItems, setCheckedItems] = useState<string[]>(() => items.flatMap((item) => [item.path, ...(item.children?.map((child) => child.path) ?? [])]));

  const handleCheck = (path: string, isChecked: boolean) => {
    setCheckedItems((prevCheckedItems) => {
      if (isChecked) {
        return [...prevCheckedItems, path];
      } else {
        return prevCheckedItems.filter((p) => p !== path);
      }
    });

    if (onCheck) {
      onCheck(path, isChecked);
    }
  };

  const extractFolderPaths = (items: BrowserItem[]): string[] => {
    return items.flatMap((item) => {
      if (item.type === 'folder') {
        return [item.path, ...(item.children ? extractFolderPaths(item.children) : [])];
      }
      return [];
    });
  };
  
  const allFolderPaths = extractFolderPaths(items);

  return (
    <TreeView
      expanded={allFolderPaths}
      sx={{
        maxHeight: '400px',
        overflowY: 'auto',
        '& .MuiTreeItem-root': {
          paddingBottom: 0,
          paddingTop: 0,
        },
      }}
    >
      {items
        .filter((item) => item.type === 'folder')
        .map((item) => (
          <FileTreeItem key={item.path} item={item} onReorder={onReorder} onCheck={handleCheck} checkedItems={checkedItems} parentChecked />
        ))}
    </TreeView>
  );
};

export default FilteredFileTree;
