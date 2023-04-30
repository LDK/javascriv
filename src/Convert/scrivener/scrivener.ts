// Convert/scrivener/scrivener.ts
import { BrowserItem } from '../../redux/filesSlice';
import { loadSearchIndexesFileAndParse, parseSearchIndexes, ScrivenerDocument } from './scrivenerIndexes';
import { loadScrivxFileAndParse, ScrivenerBinder, ScrivenerBinderItem, scrivxToObject } from './scrivenerTree';

export function crossReferenceBinderWithIndexes(
  binder: ScrivenerBinder,
  indexes: Record<string, ScrivenerDocument>
): ScrivenerBinder {
  const crossReferencedBinder: ScrivenerBinder = {
    items: [],
  };

  const traverseAndUpdate = (items: ScrivenerBinderItem[]): ScrivenerBinderItem[] => {
    return items.map((item) => {
      const updatedItem: ScrivenerBinderItem = { ...item };
      if (indexes[updatedItem.UUID]) {
        updatedItem.Title = indexes[updatedItem.UUID].Title || undefined;
        updatedItem.Content = indexes[updatedItem.UUID].Text || undefined;
      }
      if (updatedItem.Children) {
        updatedItem.Children = traverseAndUpdate(updatedItem.Children);
      }
      return updatedItem;
    });
  };

  crossReferencedBinder.items = traverseAndUpdate(binder.items);

  return crossReferencedBinder;
}

export function scrivenerBinderToBrowserItems(binder: ScrivenerBinder, basePath: string = ''): BrowserItem[] {
  const browserItems: BrowserItem[] = [];

  console.log('scriv', binder);

  function nl2br(str:string):string {
    return (str + '').replace(/(\r\n|\n\r|\r|\n)/g, '<br>');
  }
  
  const traverseAndConvert = (items: ScrivenerBinderItem[], currentPath: string): BrowserItem[] => {
    const folderTypes = ['DraftFolder', 'Folder'];
    const textTypes = ['Document', 'Text'];
    const allowedTypes = [...folderTypes, ...textTypes];

    return items
      .filter((item) => allowedTypes.includes(item.Type))
      .map((item) => {
        const newPath = currentPath + '/' + item.Title;

        let newBrowserItem: BrowserItem = {
          type: folderTypes.includes(item.Type) ? 'folder' : 'file',
          name: item.Title as string,
          path: newPath,
        };

        if (textTypes.includes(item.Type)) {
          newBrowserItem.subType = 'document';
          newBrowserItem.content = Boolean(item.Content) ? nl2br(item.Content as string) : '';
          newBrowserItem.initialContent = newBrowserItem.content;
        }

        if (item.Children) {
          newBrowserItem.children = traverseAndConvert(item.Children, newPath);
        }
        console.log('new item', newBrowserItem);
        return newBrowserItem;
      });
    // end of filtering
  };

  browserItems.push(...traverseAndConvert(binder.items, basePath));

  return browserItems;
}

export const handleTest = async (callback:((tree:BrowserItem[]) => void)) => {
  // loadScrivxFileAndParse();
  const binder = await loadScrivxFileAndParse();
  const indexes = await loadSearchIndexesFileAndParse();

  if (binder && indexes) {
    const fullTree = crossReferenceBinderWithIndexes(binder, indexes);
    const newTree = scrivenerBinderToBrowserItems(fullTree);
    if (callback) {
      callback(newTree);
    }
  }  
};

export const getFullTree = async (scrivxXml:string, indexesXml:string) => {
  const binder = scrivxToObject(scrivxXml);
  const indexes = parseSearchIndexes(indexesXml);

  if (binder && indexes) {
    const fullTree = crossReferenceBinderWithIndexes(binder, indexes);
    console.log('interim tree', fullTree);
    const newTree = scrivenerBinderToBrowserItems(fullTree);
    console.log('new tree', newTree);
    return newTree;
  }  

  return [] as BrowserItem[];
};