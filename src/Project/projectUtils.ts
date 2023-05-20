import { BrowserItem } from "../redux/filesSlice";

// Subroutine that iterates through children, children's children, etc.
// It updates each item's path so that it begins with the content of `parentPath`
// and then adds the rest of the path to the end of it.

// For example, if the parentPath is '/srcRenamed' and the child's path is '/src/components/MyComponent',
// then the child's path will be updated to '/srcRenamed/components/MyComponent'

export const renameChildrenPaths = (children: BrowserItem[] | undefined, parentPath: string): BrowserItem[] | undefined => {
  const parentLevel = parentPath.split('/').length;

  return children?.map(child => {
    let childPathArray = child.path.split('/');
    let childRelativePathArray = childPathArray.slice(parentLevel);

    const newPath = [...parentPath.split('/'), ...childRelativePathArray].join('/');

    let newChildren = child.children;

    if (newChildren) {
      newChildren = renameChildrenPaths(child.children, newPath);
    }

    return {...child, path: newPath, children: newChildren};
  });
}

// Iterate through all items, recursively, and find any siblings with the same path and/or same name
// If any are found, rename them with a number appended to the end
export const renameTwins = (items: BrowserItem[]): BrowserItem[] => {
  const processedPaths: string[] = [];

  return items.map((item) => {
    const defaultItemName = item.name || 'Untitled';
    let itemName = defaultItemName;
    let newPath = item.path;
    let itemChildren = item.children ? renameTwins(item.children) : undefined;

    if (!processedPaths.includes(newPath)) {
      processedPaths.push(newPath);
    } else {
      // We need to add a suffix such as (1), (2), etc. to the path and name.
      let suffix = 1;

      while (processedPaths.includes(newPath)) {
        itemName = defaultItemName + ' (' + suffix + ')';
        newPath = item.path + ' (' + suffix + ')';
        suffix++;
      }

      processedPaths.push(newPath);
      itemChildren = renameChildrenPaths(itemChildren, newPath);
    }

    let newItem: BrowserItem = {
      type: item.type,
      name: itemName,
      path: newPath,
      children: itemChildren
    };

    if (item.subType === 'document') {
      newItem.subType = 'document';
      newItem.content = item.content;
      newItem.initialContent = item.initialContent;
    }

    return newItem;
  });
}
