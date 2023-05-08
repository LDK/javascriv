// Publish/pdfCompiler.ts
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfMake from 'html-to-pdfmake';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { editorFonts } from '../Editor/EditorFonts';
import { replaceRemoteImagesWithDataURLs } from './pdfImages';
import { addPageNumbers } from './pdfPageNumbers';
import { addFontStyles, generateFontConfig } from './pdfFonts';
import { PublishingOptions, compileHtml, extractUsedFonts } from './compiling';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface TocItem {
  id: string;
  text: string;
  title: string;
}

const generateToc = (html: string): TocItem[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = doc.querySelectorAll('section[id]');

  const tocItems: TocItem[] = [];

  sections.forEach((section) => {
    const sectionTitle = section.getAttribute('data-title');
    if (sectionTitle || section.textContent) {
      let tocText:(string | false) = false;

      if (sectionTitle) {
        tocText = sectionTitle;
      } else {
        if (section.textContent) {
          tocText = section.textContent.trim().slice(0,60) + (section.textContent.trim().length > 60 ? '...' : '');
        }
      }

      if (section.textContent) {
        tocItems.push({
          id: section.getAttribute('id') || '',
          text: section.textContent,
          title: sectionTitle || tocText as string
        });
      }
    }
  });

  return tocItems;
};

const addToC = (docDef: TDocumentDefinitions) => {
  const tocElement = {
    toc: {
      title: { text: 'Table of Contents', style: 'header' },
      textStyle: { fontSize: 12, color: 'blue' },
    },
  };
  docDef.content = [tocElement, ...(Array.isArray(docDef.content) ? docDef.content : [docDef.content])];

  return docDef;
};

const convertHtmlToPdf = async (contentArray: any[], options: PublishingOptions) => {
  const htmlArray = contentArray.map((contentItem) => {
    if (contentItem.type === 'string') {
      return contentItem.html;
    } else {
      return '';
    }
  });
  const joinedHtml = htmlArray.join('');
  const tocItems = generateToc(joinedHtml);

  const displayDocumentTitles = options.displayDocumentTitles || false;

  const pdfContent = contentArray.map((contentItem) => {
    if (contentItem.type === 'string') {
      let parsedContent:Content = htmlToPdfMake(contentItem.html);
      const sectionId = contentItem.html.match(/section id="([^"]+)"/)?.[1];

      if (sectionId) {
        const tocItem = tocItems.find((item) => item.id === sectionId);

        if (tocItem) {
          if (Array.isArray(parsedContent)) {
            parsedContent.unshift({ text: tocItem.title, tocItem: true, style: displayDocumentTitles ? 'header' : 'hidden' } as Content);
          } else {
            parsedContent = [{ text: tocItem.title, tocItem: true, style: displayDocumentTitles ? 'header' : 'hidden' } as Content, parsedContent];
          }
        }
      }

      return parsedContent;
    } else {
      return contentItem;
    }
  });

  let documentDefinition: TDocumentDefinitions = {
    content: [
      ...pdfContent.flat(),
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        marginBottom: 6,
        marginTop: 14
      },
      hidden: {
        fontSize: 0,
        opacity: 0,
        lineHeight: 0,
      },
      tocItem: {
        fontSize: 12,
        bold: false,
      },
    },
  };

  if (options.includeToC) {
    documentDefinition = addToC(documentDefinition);
  }

  documentDefinition = addFontStyles(documentDefinition, pdfMake.fonts);

  if (options.pageNumbers) {
    documentDefinition = addPageNumbers(documentDefinition, options.pageNumbers);
  }

  pdfMake.createPdf(documentDefinition).download('document.pdf');
};

const publishToPdf = async (options: PublishingOptions) => {
  const compiledHtml = compileHtml(options);
  const joinedHtml = compiledHtml.join('');

  const usedFonts = extractUsedFonts(joinedHtml, editorFonts);
  const filteredFonts = editorFonts.filter((font) => usedFonts.includes(font.value));
  const { vfs, fonts } = await generateFontConfig(filteredFonts, pdfMake.fonts || {}, pdfFonts.pdfMake.vfs);

  pdfMake.vfs = vfs;
  pdfMake.fonts = fonts;

  const contentWithDataURLs = await replaceRemoteImagesWithDataURLs(compiledHtml);
  await convertHtmlToPdf(contentWithDataURLs, options);
};

export default publishToPdf;
