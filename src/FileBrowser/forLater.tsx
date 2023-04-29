// const addItemByPath = (tree: BrowserItem[], path: string): BrowserItem[] => {
//   const rawPath = path.indexOf('/') === 0 ? path.slice(1) : path;
//   const targetParentPath = path.split('/').slice(0, -1).join('/');

import { BrowserItem } from "../redux/filesSlice";

//   return tree.map((item) => {
//     if (item.type === 'folder' && item.children) {
//       if (item.path === targetParentPath) {
//         const newItem = findItemByPath(items, rawPath.split('/'));

//         if (newItem) {
//           return { ...item, children: [...item.children, newItem] };
//         }
//       } else {
//         return { ...item, children: addItemByPath(item.children, path) };
//       }
//     }
//     return item;
//   });
// };  

export const removeItemByPath = (tree: BrowserItem[], path: string): BrowserItem[] => {
//   return tree.reduce((acc: BrowserItem[], item: BrowserItem) => {
//     if (item.path === path) {
//       return acc;
//     }

//     if (item.type === 'folder' && item.children) {
//       const itemPathSegments = item.path.split('/');
//       const pathSegments = path.split('/');
//       if (itemPathSegments[itemPathSegments.length - 1] === pathSegments[itemPathSegments.length - 1]) {
//         return [...acc, { ...item, children: removeItemByPath(item.children, path) }];
//       }
//     }

//     return [...acc, item];
//   }, []);
return [];
};  
