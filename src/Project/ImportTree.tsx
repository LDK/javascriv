// Publish/PublishTree.tsx
import React from 'react';
import CheckboxTreeItem from '../FileTree/CheckboxTreeItem';
import useFileTree, { FileTreeView, FilteredFileTreeProps } from '../FileTree/FileTree';

const ImportTree: React.FC<FilteredFileTreeProps> = ({ items: browserItems, onCheck }) => {

  const { treeItems, setTreeItems, defaultExpanded } = useFileTree(browserItems);

  return (
    <FileTreeView {...{ defaultExpanded }}>
      {treeItems.map((item) => (
        <CheckboxTreeItem key={item.path}
          isGreyed={false}
          {...{ item, onCheck, treeItems, setTreeItems }}
        />
      ))}
    </FileTreeView>
  );
};

export default ImportTree;