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

// Helper function to generate the pdfMake font configuration object for ttf/otf fonts.
export const generateFontConfig = async (fonts: EditorFont[], pdfFonts:TFontDictionary, vfs:VFS) => {
  for (const font of fonts) {
    const ext = font.extension || 'ttf';
    const sanitizedFontName = font.name.replace(/ /g, '');
    const fontId = sanitizedFontName.toLowerCase(); // Replace all spaces in the font name

    const baseFontFileName = sanitizedFontName.replace(/ /g,'');

    const normalFontFileName = `${baseFontFileName}-Regular.${ext}`;
    const boldFontFileName = `${baseFontFileName}-Bold.${ext}`;
    const italicsFontFileName = `${baseFontFileName}-Italic.${ext}`;
    const boldItalicsFontFileName = `${baseFontFileName}-BoldItalic.${ext}`;

    const normalFontFileUrl = `/fonts/${fontId}/${normalFontFileName}`;
    const boldFontFileUrl = `/fonts/${fontId}/${boldFontFileName}`;
    const italicsFontFileUrl = `/fonts/${fontId}/${italicsFontFileName}`;
    const boldItalicsFontFileUrl = `/fonts/${fontId}/${boldItalicsFontFileName}`;

    const normalFontDataUrl = await fetchFontAsDataUrl(normalFontFileUrl);
    const boldFontDataUrl = await fetchFontAsDataUrl(boldFontFileUrl);
    const italicsFontDataUrl = await fetchFontAsDataUrl(italicsFontFileUrl);
    const boldItalicsFontDataUrl = await fetchFontAsDataUrl(boldItalicsFontFileUrl);

    if (ext === 'otf') {
      console.log('OTF url', normalFontFileUrl);
    }

    const normalExists = normalFontDataUrl.startsWith('data:font');
    const boldExists = boldFontDataUrl.startsWith('data:font');
    const italicsExists = italicsFontDataUrl.startsWith('data:font');
    const boldItalicsExists = boldItalicsFontDataUrl.startsWith('data:font');

    if (normalExists) vfs[normalFontFileName] = normalFontDataUrl.split(',')[1];
    if (boldExists) vfs[boldFontFileName] = boldFontDataUrl.split(',')[1];
    if (italicsExists) vfs[italicsFontFileName] = italicsFontDataUrl.split(',')[1];
    if (boldItalicsExists) vfs[boldItalicsFontFileName] = boldItalicsFontDataUrl.split(',')[1];

    const fontVariations = (normalExists) ? {
      normal: normalFontFileName,
      bold: (boldExists ? boldFontFileName : normalFontFileName),
      italics: (italicsExists ? italicsFontFileName : (boldExists ? boldFontFileName : normalFontFileName)),
      bolditalics: boldItalicsExists ? boldItalicsFontFileName : (boldExists ? boldFontFileName : (italicsExists ? italicsFontFileName : normalFontFileName)),
    } : undefined;

    if (fontVariations) {
      pdfFonts[sanitizedFontName] = fontVariations;
    }
  }

  return { fonts: pdfFonts, vfs };
};

export const addFontStyles = (docDef: TDocumentDefinitions, fonts: TFontDictionary): TDocumentDefinitions => {
  if (fonts) {
    let existingStyles: StyleDictionary = docDef.styles ? { ...docDef.styles } : {};

    // Generate styles for all defined fonts
    const fontStyles = Object.keys(fonts).reduce<{ [key: string]: { font: string; bold?: boolean; italics?: boolean } }>((config, fontName) => {
      config[fontName] = { font: fontName };
      config[`${fontName}Bold`] = { font: fontName, bold: true };
      config[`${fontName}Italic`] = { font: fontName, italics: true };
      config[`${fontName}BoldItalic`] = { font: fontName, bold: true, italics: true };
      return config;
    }, {});

    docDef.styles = { ...existingStyles, ...fontStyles };

    // Set Lato as the default font
    if (fonts['Lato']) {
      docDef.defaultStyle = {
        ...docDef.defaultStyle,
        font: 'Lato',
      };
    }
  }

  return docDef;
};
