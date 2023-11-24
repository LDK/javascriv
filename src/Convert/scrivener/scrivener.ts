// Convert/scrivener/scrivener.ts
import { ProjectFile } from '../../Project/ProjectTypes';
import { parseSearchIndexes, ScrivenerDocument } from './scrivenerIndexes';
import { ScrivenerBinder, ScrivenerBinderItem, scrivxToObject } from './scrivenerTree';

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

export function scrivenerBinderToBrowserItems(binder: ScrivenerBinder, basePath: string = ''): ProjectFile[] {
  const browserItems: ProjectFile[] = [];

  function nl2br(str:string):string {
    return (str + '').replace(/(\r\n|\n\r|\r|\n)/g, '<br>');
  }
  
  const traverseAndConvert = (items: ScrivenerBinderItem[], currentPath: string): ProjectFile[] => {
    const folderTypes = ['DraftFolder', 'Folder'];
    const textTypes = ['Document', 'Text'];
    const allowedTypes = [...folderTypes, ...textTypes];

    const processedPaths:string[] = [];

    return items
      .filter((item) => allowedTypes.includes(item.Type))
      .map((item) => {
        const defaultItemName = item.Title || 'Untitled';
        let itemName = defaultItemName;
        let newPath = currentPath + '/' + itemName;

        // remove leading slash
        if (newPath[0] === '/') {
          newPath = newPath.slice(1);
        }

        if (!processedPaths.includes(newPath)) {
          processedPaths.push(newPath);
        } else {
          // We need to add a suffix such as (1), (2), etc. to the path and name.
          let suffix = 1;

          while (processedPaths.includes(newPath)) {
            itemName = defaultItemName + ' (' + suffix + ')';
            newPath = currentPath + '/' + itemName;
            suffix++;
          }

          processedPaths.push(newPath);
        }

        let newBrowserItem: ProjectFile = {
          type: folderTypes.includes(item.Type) ? 'folder' : 'file',
          name: itemName,
          path: newPath,
        };

        const condenseSpaces = (text:string) => {
          return text.replace(/\s{2,}/g, ' ');
        };

        // Mapping of special characters to HTML entities
        const charEntityMap = {
          '’': '&rsquo;',
          '“': '&ldquo;',
          '”': '&rdquo;',
          '‘': '&lsquo;',
          '—': '&mdash;',
          '–': '&ndash;',
          '…': '&hellip;',
          '"': '&quot;',
          "'": '&apos;',
          // Add more mappings as needed
        };

        // Function to process text by replacing special characters with their HTML entities
        const processText = (text:string) => {
          return Object.entries(charEntityMap).reduce((acc, [char, entity]) => {
            return acc.replace(new RegExp(char, 'g'), entity);
          }, text);
        };

        if (textTypes.includes(item.Type)) {
          newBrowserItem.subType = 'document';
          newBrowserItem.content = Boolean(item.Content) ? `<p>${nl2br(condenseSpaces(item.Content as string))}</p>` : '';
        }

        if (item.Children) {
          if (item.Content) {
            newBrowserItem.content = `<p>${nl2br(condenseSpaces(item.Content as string))}</p>`;
            newBrowserItem.initialContent = newBrowserItem.content;
          }
          newBrowserItem.children = traverseAndConvert(item.Children, newPath);
        }

        if (newBrowserItem.content) {
          newBrowserItem.content = processText(newBrowserItem.content);
          newBrowserItem.initialContent = newBrowserItem.content;
        }

        return newBrowserItem;
      });
    // end of filtering
  };

  browserItems.push(...traverseAndConvert(binder.items, basePath));

  return browserItems;
}

export const getFullTree = async (scrivxXml:string, indexesXml:string) => {
  const binder = scrivxToObject(scrivxXml);
  const indexes = parseSearchIndexes(indexesXml);

  if (binder && indexes) {
    const fullTree = crossReferenceBinderWithIndexes(binder, indexes);
    const newTree = scrivenerBinderToBrowserItems(fullTree);
    return newTree;
  }  

  return [] as ProjectFile[];
};