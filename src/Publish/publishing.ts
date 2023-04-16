// Publish/publishing.ts

import { BrowserItem } from "../redux/filesSlice";

export interface PublishingOptions {
  items: BrowserItem[];
  pageBreaks: string;
  pageNumbers: string;
}

export const compileHtml = (options: PublishingOptions) => {
  let compiledContent: any[] = [];

  const traverse = (node: BrowserItem, isTopLevel: boolean) => {
    if (node.type === 'folder') {
      if (options.pageBreaks.includes('Between Folders') && !isTopLevel) {
        compiledContent.push({ text: '', pageBreak: 'after' });
      }
      if (node.children) {
        node.children.forEach((child) => traverse(child, false));
      }
    } else if (node.subType === 'document') {
      compiledContent.push(node.content || '');
      if (options.pageBreaks.includes('Between Documents')) {
        compiledContent.push({ text: '', pageBreak: 'after' });
      }
    }
  };

  options.items.forEach((item) => traverse(item, true));

  return compiledContent;
};

