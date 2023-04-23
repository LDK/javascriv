// Publish/pdfCompiler.ts
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfMake from 'html-to-pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { editorFonts } from '../Editor/EditorFonts';
import { replaceRemoteImagesWithDataURLs } from './pdfImages';
import { addPageNumbers } from './pdfPageNumbers';
import { addFontStyles, generateFontConfig } from './pdfFonts';
import { PublishingOptions, compileHtml, extractUsedFonts } from './publishing';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const convertHtmlToPdf = async (contentArray: any[], options: PublishingOptions) => {
  const pdfContent = contentArray.map((contentItem) => {
    if (contentItem.type === 'string') {
      return htmlToPdfMake(contentItem.html);
    } else {
      return contentItem;
    }
  });

  let documentDefinition: TDocumentDefinitions = {
    content: pdfContent.flat()
  };

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
