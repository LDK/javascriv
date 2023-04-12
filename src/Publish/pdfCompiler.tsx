// Publish/pdfCompiler.tsx
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfMake from 'html-to-pdfmake';
import { BrowserItem } from '../redux/filesSlice';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export interface PublishingOptions {
  items: BrowserItem[];
  pageBreaks: string;
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



// const convertHtmlToPdf = (htmlContent: string) => {
//   const documentDefinition = {
//     content: htmlToPdfMake(htmlContent),
//   };

//   pdfMake.createPdf(documentDefinition).download("document.pdf");
// };

const fetchImageAsDataURL = async (url: string) => {
  console.log('Fetching image:', url);
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', url, error);
    throw error;
  }
};

const replaceRemoteImagesWithDataURLs = async (contentArray: any[]): Promise<any[]> => {
  console.log('replaceremote');
  const updatedContentArray = await Promise.all(
    contentArray.map(async (content) => {
      if (typeof content === 'string') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const images = doc.querySelectorAll('img');
        console.log('images', images);
        const promises = [];

        for (const img of images) {
          const src = img.getAttribute('src');
          console.log('src!', src);
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
        return { html: doc.body.innerHTML, type: 'string' };
      } else {
        console.log('else content', content);
        return content;
      }
    })
  );

  return updatedContentArray;
};

const convertHtmlToPdf = async (contentArray: any[]) => {
  const pdfContent = contentArray.map((contentItem) => {
    if (contentItem.type === 'string') {
      return htmlToPdfMake(contentItem.html);
    } else {
      return contentItem;
    }
  });
  const documentDefinition = {
    content: pdfContent.flat(),
  };

  pdfMake.createPdf(documentDefinition).download('document.pdf');
};

const publishToPdf = async (options: PublishingOptions) => {
  const compiledHtml = compileDocuments(options);
  console.log('content', compiledHtml);
  const contentWithDataURLs = await replaceRemoteImagesWithDataURLs(compiledHtml);
  await convertHtmlToPdf(contentWithDataURLs);
};

export default publishToPdf;