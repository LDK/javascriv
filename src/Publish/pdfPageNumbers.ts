// Publish/pdfPageNumbers.ts
import { Margins, Content, Alignment, TDocumentDefinitions } from "pdfmake/interfaces";

export type PageNumberOptions = { alignment: string; margin: number[] };

export const getPageNumberPosition = (pageNumbers: string) => {
  const [vertical, horizontal] = pageNumbers.split(' ');

  const alignment = ['Left','Right'].includes(horizontal) ? horizontal.toLowerCase() : 'center';
  const margin:Margins = (vertical === 'Top') ? [10,10,10,0] : [10,0,10,10];

  return { alignment, margin };
};

export const getPageFooter = (pageNumberOptions: PageNumberOptions) => {
  return (currentPage: number, pageCount: number) => {
    const pageNumberContent: Content = {
      text: currentPage.toString() + ' of ' + pageCount,
      alignment: pageNumberOptions.alignment as Alignment,
      margin: pageNumberOptions.margin as Margins,
    };
    return pageNumberContent;
  };
}

export const getPageHeader = (pageNumberOptions: PageNumberOptions) => {
  return (currentPage: number, pageCount: number) => {
    const pageNumberContent: Content = {
      text: currentPage.toString() + ' of ' + pageCount,
      alignment: pageNumberOptions.alignment as Alignment,
      margin: pageNumberOptions.margin as Margins,
    };
    return pageNumberContent;
  };
}

export const addPageNumbers = (docDef:TDocumentDefinitions, pageNumberOptionsRaw:string) => {
  const pageNumberOptions = getPageNumberPosition(pageNumberOptionsRaw);

  if (pageNumberOptions.margin[1] > 0) {
    // Top margin is set, so use header
    docDef.header = getPageHeader(pageNumberOptions);
  } else {
    // Bottom margin is set, so use footer
    docDef.footer = getPageFooter(pageNumberOptions);
  }

  return docDef;
}
