// Publish/pdfFonts.ts
import { StyleDictionary, TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";
import { EditorFont } from "../Editor/EditorFonts";

type VFS = {
  [file: string]: string;
};

const fetchFontAsDataUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Failed to load font data.'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read font data.'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to fetch font from URL: ${url}`, error);
    return '';
  }
};

// Helper function to generate the pdfMake font configuration object for ttf fonts.
export const generateFontConfig = async (fonts: EditorFont[], pdfFonts:TFontDictionary, vfs:VFS) => {
  // Initialize pdfFonts object if it is undefined
  
  for (const font of fonts) {
    const sanitizedFontName = font.name.replace(/ /g, '');
    const fontId = sanitizedFontName.toLowerCase(); // Replace all spaces in the font name

    const normalFontFileName = `${sanitizedFontName.replace(/ /g,'')}-Regular.ttf`;
    const boldFontFileName = `${sanitizedFontName.replace(/ /g,'')}-Bold.ttf`;
    const italicsFontFileName = `${sanitizedFontName.replace(/ /g,'')}-Italics.ttf`;
    const boldItalicsFontFileName = `${sanitizedFontName.replace(/ /g,'')}-BoldItalics.ttf`;

    const normalFontFileUrl = `/fonts/${fontId}/${normalFontFileName}`;
    const boldFontFileUrl = `/fonts/${fontId}/${boldFontFileName}`;
    const italicsFontFileUrl = `/fonts/${fontId}/${italicsFontFileName}`;
    const boldItalicsFontFileUrl = `/fonts/${fontId}/${boldItalicsFontFileName}`;

    const normalFontDataUrl = await fetchFontAsDataUrl(normalFontFileUrl);
    const boldFontDataUrl = await fetchFontAsDataUrl(boldFontFileUrl);
    const italicsFontDataUrl = await fetchFontAsDataUrl(italicsFontFileUrl);
    const boldItalicsFontDataUrl = await fetchFontAsDataUrl(boldItalicsFontFileUrl);

    const normalExists = normalFontDataUrl !== '';
    const boldExists = boldFontDataUrl !== '';
    const italicsExists = italicsFontDataUrl !== '';
    const boldItalicsExists = boldItalicsFontDataUrl !== '';

    if (normalExists) vfs[normalFontFileName] = normalFontDataUrl.split(',')[1];
    if (boldExists) vfs[boldFontFileName] = boldFontDataUrl.split(',')[1];
    if (italicsExists) vfs[italicsFontFileName] = italicsFontDataUrl.split(',')[1];
    if (boldItalicsExists) vfs[boldItalicsFontFileName] = boldItalicsFontDataUrl.split(',')[1];

    const fontVariations = (normalExists) ? {
      ...(normalExists ? { normal: normalFontFileName } : {}),
      ...(boldExists ? { bold: boldFontFileName } : {}),
      ...(italicsExists ? { italics: italicsFontFileName } : {}),
      ...(boldItalicsExists ? { bolditalics: boldItalicsFontFileName } : {}),
    } : undefined;

    // Set the font in pdfMake.fonts
    if (fontVariations) {
      pdfFonts[sanitizedFontName] = fontVariations;
    }
  }

  return { fonts: pdfFonts, vfs };
};

export const addFontStyles = (docDef: TDocumentDefinitions, fonts: TFontDictionary): TDocumentDefinitions => {
  if (fonts) {
    let existingStyles:StyleDictionary = docDef.styles ? {...docDef.styles} : {};

    // Generate styles for all defined fonts
    const fontStyles = Object.keys(fonts).reduce<{ [key: string]: { font: string; bold?: boolean; italics?: boolean } }>((config, fontName) => {
      config[fontName] = { font: fontName };
      config[`${fontName}Bold`] = { font: fontName, bold: true };
      config[`${fontName}Italic`] = { font: fontName, italics: true };
      config[`${fontName}BoldItalic`] = { font: fontName, bold: true, italics: true };
      return config;
    }, {});

    docDef.styles = {...existingStyles, fontStyles};
  }

  return docDef;
}
