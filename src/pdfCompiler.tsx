// pdfCompiler.tsx
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

// const convertHtmlToPdf = (htmlContent: string) => {
//   const documentDefinition = {
//     content: htmlToPdfMake(htmlContent),
//   };

//   pdfMake.createPdf(documentDefinition).download("document.pdf");
// };

const fetchImageAsDataURL = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const replaceRemoteImagesWithDataURLs = async (htmlContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const images = doc.querySelectorAll('img');
  const promises = [];

  for (const img of images) {
    const src = img.getAttribute('src');
    if (src && src.startsWith('http')) {
      const promise = fetchImageAsDataURL(src)
        .then((dataUrl) => {
          img.setAttribute('src', dataUrl);
        })
        .catch((error) => {
          console.warn(`Failed to fetch image: ${src}`, error);
        });
      promises.push(promise);
    }
  }

  await Promise.all(promises);
  return doc.body.innerHTML;
};

const convertHtmlToPdf = async (htmlContent: string) => {
  const contentWithDataURLs = await replaceRemoteImagesWithDataURLs(htmlContent);
  const documentDefinition = {
    content: htmlToPdfMake(contentWithDataURLs),
  };

  pdfMake.createPdf(documentDefinition).download('document.pdf');
};

// const printToPdf = (items:BrowserItem[]) => {
//   const compiledHtml = compileDocuments(items);
//   console.log('content', compiledHtml);
//   convertHtmlToPdf(compiledHtml);
// };

const printToPdf = async (items: BrowserItem[]) => {
  const compiledHtml = compileDocuments(items);
  console.log('content', compiledHtml);
  await convertHtmlToPdf(compiledHtml);
};

export default printToPdf;