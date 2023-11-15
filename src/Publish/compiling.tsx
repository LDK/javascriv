// Publish/compiling.ts

import { EditorFont } from "../Editor/EditorFonts";
import { ProjectFile, PublishOptions } from "../Project/ProjectTypes";

export type Binary = 0 | 1;

export type PublishingOptions = PublishOptions & {
  items: ProjectFile[];
  font?: EditorFont;
  fontSize?: number;
};

export const compileHtml = (options: PublishingOptions) => {
  let compiledContent: any[] = [];

  // if table of contents is included, start with a blank page
  if (options.includeToC) {
    compiledContent.push({ text: '', pageBreak: 'after' });
  }

  const traverse = (node: ProjectFile, isTopLevel: boolean) => {
    if (node.type === 'folder') {
      if (options.pageBreaks.includes('Between Folders') && !isTopLevel) {
        compiledContent.push({ text: '', pageBreak: 'after' });
      }

      const content = node.content || '';

      if (content.length) {
        const id = node.path.replace(/\//g, '_').replace(/\s/g, '-').toLowerCase().trim();
        const prefix = `<section id="${id}" data-title="${node.name}" tocItem="true">`;
        const suffix = '</section>';

        // Find instances of <p><!-- pagebreak --></p> and replace with page break
        const pageBreakRegex = /<p><!-- pagebreak --><\/p>/g;
        const pageBreaks = content.match(pageBreakRegex);

        if (pageBreaks && options.pageBreaks !== 'Nowhere') {
          const splitContent = content.split('<p><!-- pagebreak --></p>');
          splitContent.forEach((content, index) => {
            compiledContent.push(`${prefix}${content}${suffix}`);
            if (index < splitContent.length - 1) {
              compiledContent.push({ text: '', pageBreak: 'after' });
            }
          });
        } else {
          compiledContent.push(`${prefix}${content}${suffix}`);
      
          if (options.pageBreaks.includes('Between Documents')) {
            compiledContent.push({ text: '', pageBreak: 'after' });
          }
        }
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, false));
      }
    } else if (node.subType === 'document') {
      const id = node.path.replace(/\//g, '_').replace(/\s/g, '-').toLowerCase().trim();
      const prefix = `<section id="${id}" data-title="${node.name}" tocItem="true">`;
      const suffix = '</section>';
      const content = node.content || '';

      // Find instances of <p><!-- pagebreak --></p> and replace with page break
      const pageBreakRegex = /<p><!-- pagebreak --><\/p>/g;
      const pageBreaks = content.match(pageBreakRegex);

      if (pageBreaks && options.pageBreaks !== 'Nowhere') {
        const splitContent = content.split('<p><!-- pagebreak --></p>');
        compiledContent.push(`${prefix}`);

        splitContent.forEach((content, index) => {
          compiledContent.push(`${content}`);
          if (index < splitContent.length - 1) {
            compiledContent.push({ text: '', pageBreak: 'after' });
          }
        });

        compiledContent.push(`${suffix}`);
      } else {
        compiledContent.push(`${prefix}${content}${suffix}`);
    
        if (options.pageBreaks.includes('Between Documents')) {
          compiledContent.push({ text: '', pageBreak: 'after' });
        }
      }
    }
  };

  options.items.forEach((item) => traverse(item, true));
  return compiledContent;
};

export const extractUsedFonts = (html: string, availableFonts: EditorFont[], defaultFont?: EditorFont): string[] => {
  const usedFonts: string[] = ['Roboto','Lato'];

  if (defaultFont) {
    usedFonts.push(defaultFont.value);
  }

  // Find all font-family declarations
  const fontFamilyRegex = /font-family: [^;]+;/g;
  const fontFamilyDeclarations = html.match(fontFamilyRegex);
 
  const sanitizeFontName = (fontName: string): string => {
    return fontName.replace(/'|,serif|,monospace|,sans-serif/gi, '');
  };

  if (fontFamilyDeclarations) {
    const sanitizedFontFamilyDeclarations = fontFamilyDeclarations.map((declaration) => {
      const fontName = declaration.split(':')[1].trim().replace(/;$/, '');
      return sanitizeFontName(fontName);
    });

    for (const font of availableFonts) {
      const sanitizedFontName = sanitizeFontName(font.value);

      if (sanitizedFontFamilyDeclarations.includes(sanitizedFontName) && !usedFonts.includes(font.value)) {
        usedFonts.push(font.value);
      }
    }
  }

  return [...new Set(usedFonts)];
};
