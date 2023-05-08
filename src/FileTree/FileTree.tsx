// FileTree/FileTree.tsx
import { TreeView } from "@mui/lab";
import React, { useEffect, useState } from "react";
import { MinusSquare, PlusSquare } from "../Publish/IconFunctions";
import { BrowserItem } from "../redux/filesSlice";

export interface FileTreeItem extends Omit<BrowserItem, 'children'> {
  included: boolean;
  children: FileTreeItem[];
}

export interface FilteredFileTreeProps {
  items: BrowserItem[];
  onCheck: (updatedItems: FileTreeItem[]) => void;
}

export const FileTreeView = ({ children, defaultExpanded }: { children: React.ReactNode; defaultExpanded: string[]; }) => (
  <TreeView
    defaultExpanded={defaultExpanded}
    defaultCollapseIcon={<MinusSquare />}
    defaultExpandIcon={<PlusSquare />}
    defaultEndIcon={<div style={{ width: 24 }} />}
  >
    {children}
  </TreeView>
);

function useFileTree(browserItems: BrowserItem[]) {
  const convertToTreeItems = (items: BrowserItem[]): FileTreeItem[] => {
    return items
      .filter((child) => child.subType !== 'image' && child.subType !== 'other')
      .map((item) => {
        const publishItem: FileTreeItem = {
          ...item,
          included: true,
          children: item.children ? convertToTreeItems(item.children) : [],
        };
        return publishItem;
      });
  };
  
  useEffect(() => {
    setTreeItems(convertToTreeItems(browserItems));
    // eslint-disable-next-line
  }, [browserItems]);

  const [treeItems, setTreeItems] = useState<FileTreeItem[]>(() => convertToTreeItems(browserItems));

  function hasDocumentChild(pi:FileTreeItem):boolean {
    return pi.children.some((child) => {
      if (child.type === 'folder') {
        return hasDocumentChild(child);
      }
      return (child.included && child.type === 'file' && child.subType && child.subType === 'document');
    })
  };

  // By default we expand all folders that are included and contain included documents
  const defaultExpanded:string[] = React.useMemo(
    () => treeItems.flatMap((item) => {
      if (item.type === 'folder' && item.included) {
        if (hasDocumentChild(item)) {
          return item.path;
        }
      }
      return ''
    }),
    // eslint-disable-next-line
    [browserItems]
  );

  return { treeItems, setTreeItems, defaultExpanded };
}

export default useFileTree;