// Publish/publishing.ts

import { BrowserItem } from "../redux/filesSlice";
import { EditorFont } from "../Editor/EditorFonts";

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

export const extractUsedFonts = (html: string, availableFonts: EditorFont[]): string[] => {
  const usedFonts: string[] = ['Roboto'];

  // Find all font-family declarations
  const fontFamilyRegex = /font-family: [^;]+;/g;
  const fontFamilyDeclarations = html.match(fontFamilyRegex);
  console.log('All font-family declarations:', fontFamilyDeclarations, html);

  const sanitizeFontName = (fontName: string): string => {
    return fontName.replace(/ /g, '').replace(/'|,serif|,monospace|,sans-serif/gi, '');
  };

  if (fontFamilyDeclarations) {
    const sanitizedFontFamilyDeclarations = fontFamilyDeclarations.map((declaration) => {
      const fontName = declaration.split(':')[1].trim().replace(/;$/, '');
      return sanitizeFontName(fontName);
    });

    for (const font of availableFonts) {
      const sanitizedFontName = sanitizeFontName(font.name);

      if (sanitizedFontFamilyDeclarations.includes(sanitizedFontName) && !usedFonts.includes(font.name)) {
        usedFonts.push(font.name);
      }
    }
  }

  return [...new Set(usedFonts)];
};
