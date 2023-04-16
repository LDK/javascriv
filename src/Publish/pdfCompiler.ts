// Publish/pdfCompiler.ts
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfMake from 'html-to-pdfmake';
import { BrowserItem } from '../redux/filesSlice';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { editorFonts } from '../Editor/EditorFonts';
import { replaceRemoteImagesWithDataURLs } from './pdfImages';
import { addPageNumbers } from './pdfPageNumbers';
import { generateFontConfig } from './pdfFonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export interface PublishingOptions {
  items: BrowserItem[];
  pageBreaks: string;
  pageNumbers: string;
}

const compileDocuments = (options: PublishingOptions) => {
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

const convertHtmlToPdf = async (contentArray: any[], options: PublishingOptions) => {
  const pdfContent = contentArray.map((contentItem) => {
    if (contentItem.type === 'string') {
      return htmlToPdfMake(contentItem.html);
    } else {
      return contentItem;
    }
  });

  // Generate styles for all defined fonts
  const styles = Object.keys(pdfMake.fonts).reduce<{ [key: string]: { font: string; bold?: boolean; italics?: boolean } }>((config, sanitizedFontName) => {
    config[sanitizedFontName] = { font: sanitizedFontName };
    config[`${sanitizedFontName}Bold`] = { font: sanitizedFontName, bold: true };
    config[`${sanitizedFontName}Italic`] = { font: sanitizedFontName, italics: true };
    config[`${sanitizedFontName}BoldItalic`] = { font: sanitizedFontName, bold: true, italics: true };
    return config;
  }, {});

  let documentDefinition: TDocumentDefinitions = {
    content: pdfContent.flat(),
    styles,
  };

  if (options.pageNumbers) {
    documentDefinition = addPageNumbers(documentDefinition, options.pageNumbers);
  }

  pdfMake.createPdf(documentDefinition).download('document.pdf');
};

const publishToPdf = async (options: PublishingOptions) => {
  const { vfs, fonts } = await generateFontConfig(editorFonts, pdfMake.fonts || {}, pdfFonts.pdfMake.vfs);

  pdfMake.vfs = vfs;
  pdfMake.fonts = fonts;

  const compiledHtml = compileDocuments(options);
  const contentWithDataURLs = await replaceRemoteImagesWithDataURLs(compiledHtml);
  await convertHtmlToPdf(contentWithDataURLs, options);
};

export default publishToPdf;
