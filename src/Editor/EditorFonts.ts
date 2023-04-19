// Editor/EditorFonts.ts
export type EditorFont = {
  name: string;
  value: string;
  extension?: 'ttf' | 'otf';
};

export const googleFonts: EditorFont[] = [
  { name: 'Libre Baskerville', value: 'Libre Baskerville, serif' },
  { name: 'Garamond', value: 'EB Garamond, serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Noto Sans', value: 'Noto Sans, sans-serif' },
  { name: 'Noto Serif', value: 'Noto Serif, serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'PT Sans', value: 'PT Sans, sans-serif' },
  { name: 'Raleway', value: 'Raleway, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Rubik', value: 'Rubik, sans-serif' },
  { name: 'Slabo 27px', value: 'Slabo 27px, serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
];

export const customFonts: EditorFont[] = [
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Caslon', value: 'Caslon, serif' },
  { name: 'Courier New', value: 'Courier New, Courier, monospace' },
  { name: 'Didot', value: 'Didot, serif' },
  { name: 'Futura', value: 'Futura, sans-serif' },
  { name: 'Gill Sans', value: 'Gill Sans, sans-serif', extension: 'otf' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Palatino', value: 'Palatino, Palatino Linotype, serif' },
  { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
];

export const editorFonts: EditorFont[] = [...googleFonts, ...customFonts].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const generateFontFamilyFormats = (fonts: EditorFont[]) => {
  return fonts
    .map((font) => `${font.name}=${font.value}`)
    .join(';');
};

export const familyFonts = generateFontFamilyFormats(editorFonts);

export const generateGoogleFontsLink = () => {
  // const googleFontFamilies = googleFonts.map((font) => font.name.replace(' ', '+'));

  // const googleFontsUrl = 'https://fonts.googleapis.com/css?family=' + googleFontFamilies.join('|') + '&display=swap';

  // return googleFontsUrl;

  // For now, we'll just return a static download of the generated google fonts, since google is giving us CORS errors
  return '/css/google-fonts.css';
};
