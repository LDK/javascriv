import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfMake from 'html-to-pdfmake';
import { BrowserItem } from './filesSlice';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const compileDocuments = (items:BrowserItem[]) => {
  let compiledHtml = '';

  const traverse = (node:BrowserItem) => {
    if (node.subType === 'document') {
      compiledHtml += node.content || '';
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  items.forEach(traverse);

  return compiledHtml;
};

const convertHtmlToPdf = (htmlContent: string) => {
  const documentDefinition = {
    content: htmlToPdfMake(htmlContent),
  };

  pdfMake.createPdf(documentDefinition).download("document.pdf");
};

const printToPdf = (items:BrowserItem[]) => {
  const compiledHtml = compileDocuments(items);
  console.log('content', compiledHtml);
  convertHtmlToPdf(compiledHtml);
};

export default printToPdf;