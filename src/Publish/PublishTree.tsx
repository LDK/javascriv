// Publish/PublishTree.tsx
import React, { useEffect, useState } from 'react';
import TreeView from '@mui/lab/TreeView';
import { BrowserItem } from '../redux/filesSlice';
import PublishTreeItem from './PublishTreeItem';
import { MinusSquare, PlusSquare } from './IconFunctions';

export interface PublishItem extends Omit<BrowserItem, 'children'> {
  included: boolean;
  children: PublishItem[];
}

export interface FilteredFileTreeProps {
  items: BrowserItem[];
  onCheck: (updatedItems: PublishItem[]) => void;
}

const PublishTree: React.FC<FilteredFileTreeProps> = ({ items: browserItems, onCheck }) => {
  const convertToPublishItems = (items: BrowserItem[]): PublishItem[] => {
    return items
      .filter((child) => child.subType !== 'image' && child.subType !== 'other')
      .map((item) => {
        const publishItem: PublishItem = {
          ...item,
          included: true,
          children: item.children ? convertToPublishItems(item.children) : [],
        };
        return publishItem;
      });
  };
  
  const [publishItems, setPublishItems] = useState<PublishItem[]>(() => convertToPublishItems(browserItems));

  useEffect(() => {
    setPublishItems(convertToPublishItems(browserItems));
    // eslint-disable-next-line
  }, [browserItems]);

  function hasDocumentChild(pi:PublishItem):boolean {
    return pi.children.some((child) => {
      if (child.type === 'folder') {
        return hasDocumentChild(child);
      }
      return (child.included && child.type === 'file' && child.subType && child.subType === 'document');
    })
  };

  // By default we expand all folders that are included and contain included documents
  const defaultExpanded:string[] = React.useMemo(
    () => publishItems.flatMap((item) => {
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

  return (
    <TreeView
      defaultExpanded={defaultExpanded}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<div style={{ width: 24 }} />}
    >
      {publishItems.map((item) => (
        <PublishTreeItem
          key={item.path}
          item={item}
          isGreyed={false}
          onCheck={onCheck}
          publishItems={publishItems}
          setPublishItems={setPublishItems}
        />
      ))}
    </TreeView>
  );
};

export default PublishTree;