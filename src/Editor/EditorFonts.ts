import { CustomFont } from "../Project/CustomFontsDialog";
import useUser from "../User/useUser";
import { UserState } from "../redux/userSlice";

// Editor/EditorFonts.ts
export type EditorFont = {
  name: string;
  value: string;
  extension?: 'ttf' | 'otf';
};

export const googleFonts: EditorFont[] = [
  { name: 'Amiri', value: 'Amiri' },
  { name: 'Baskerville', value: 'Libre Baskerville' },
  { name: 'Garamond', value: 'EB Garamond' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Merriweather', value: 'Merriweather' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Noto Sans', value: 'Noto Sans' },
  { name: 'Noto Serif', value: 'Noto Serif' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'PT Sans', value: 'PT Sans' },
  { name: 'Raleway', value: 'Raleway' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Rubik', value: 'Rubik' },
  { name: 'Slabo 27px', value: 'Slabo 27px' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro' },
];

export const customFonts: EditorFont[] = [
  { name: 'Arial', value: 'Arial' },
  { name: 'Caslon', value: 'Caslon' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'Didot', value: 'Didot' },
  { name: 'Futura', value: 'Futura' },
  { name: 'Gill Sans', value: 'Gill Sans' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Liberation Serif', value: 'Liberation Serif' },
];

export const editorFonts: EditorFont[] = [...googleFonts, ...customFonts].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const generateFontFamilyFormats = (fonts: EditorFont[], user:UserState) => {
  const systemFonts = fonts
    .map((font) => `${font.name}=${font.value}`)
    .join(';');

  const customFonts = user?.fonts?.map((font:CustomFont) => `${font.name}=${font.name}`).join(';');

  return `${systemFonts};${customFonts}`;
};

export const familyFonts = (user:UserState) => {
  const systemFonts = editorFonts
    .map((font) => `${font.name}=${font.value}`)
    .join(';');

  const customFonts = user?.fonts?.map((font:CustomFont) => `${font.name}=${font.name}`).join(';');

  return `${systemFonts};${customFonts}`;
};

export const getFontsCSS = async (user:UserState) => {
  try {
    const response = await fetch('/css/javascriv-fonts.css');
    let cssText = '';

    // Here you could append additional CSS rules dynamically
    // For example:
    // cssText += `
    //   /* Additional dynamic styles */
    //   .custom-class { font-family: 'My Custom Font', sans-serif; }
    // `;

    if (user?.fonts) {
      user.fonts.forEach((font) => {
        const hasRegular = font.regular && font.regular !== '';
        const hasBold = font.bold && font.bold !== '';
        const hasItalic = font.italic && font.italic !== '';
        const hasBoldItalic = font.boldItalic && font.boldItalic !== '';

        if (!hasRegular && !hasBold && !hasItalic && !hasBoldItalic) {
          // Skip this font, it's invalid
          return;
        }

        // Ideally, we have all 4 and can just map them to the font-family
        // However, we may need to use the ones we have to fill in the gaps
        // If we only have one, we use it for all 4.
        // If filling in bold italic, look for bold first, then italic, then regular
        // If filling in italic, look for italic first, then regular
        // If filling in bold, look for bold first, then bold italic, then italic, then regular
        // If filling in regular, look for regular first, then italic, then bold, then bold italic

        // function to generate the font-face rule for any given style (regular, bold, italic, boldItalic)

        const styleRule = (font: CustomFont, key: keyof CustomFont, style: string) => `
          @font-face {
            font-family: '${font.name}';
            src: url('${font[key]}');
            font-weight: ${style === 'bold' || style === 'boldItalic' ? 'bold' : 'normal'};
            font-style: ${style === 'italic' || style === 'boldItalic' ? 'italic' : 'normal'};
          }
        `;

        const importRule = (font: CustomFont, key: keyof CustomFont, style: string) => `@import url('${font[key]}');`;

        // Append the regular to cssText
        if (hasRegular) {
          cssText += importRule(font, 'regular', 'regular');
        } else if (hasItalic) {
          // using italic as fallback for regular
          cssText += importRule(font, 'italic', 'regular');
        } else if (hasBold) {
          // using bold as fallback for regular
          cssText += importRule(font, 'bold', 'regular');
        } else if (hasBoldItalic) {
          // using boldItalic as fallback for regular
          cssText += importRule(font, 'boldItalic', 'regular');
        }

        // Append the bold to cssText
        if (hasBold) {
          cssText += importRule(font, 'bold', 'bold');
        } else if (hasBoldItalic) {
          // using boldItalic as fallback for bold
          cssText += importRule(font, 'boldItalic', 'bold');
        } else if (hasItalic) {
          // using italic as fallback for bold
          cssText += importRule(font, 'italic', 'bold');
        } else if (hasRegular) {
          // using regular as fallback for bold
          cssText += importRule(font, 'regular', 'bold');
        }

        // Append the italic to cssText
        if (hasItalic) {
          cssText += importRule(font, 'italic', 'italic');
        } else if (hasRegular) {
          // using regular as fallback for italic
          cssText += importRule(font, 'regular', 'italic');
        } else if (hasBoldItalic) {
          // using boldItalic as fallback for italic
          cssText += importRule(font, 'boldItalic', 'italic');
        } else if (hasBold) {
          // using bold as fallback for italic
          cssText += importRule(font, 'bold', 'italic');
        }

        // Append the boldItalic to cssText
        if (hasBoldItalic) {
          cssText += importRule(font, 'boldItalic', 'boldItalic');
        } else if (hasBold) {
          // using bold as importRule for boldItalic
          cssText += importRule(font, 'bold', 'boldItalic');
        } else if (hasItalic) {
          // using italic as fallback for boldItalic
          cssText += importRule(font, 'italic', 'boldItalic');
        } else if (hasRegular) {
          // using regular as fallback for boldItalic
          cssText += importRule(font, 'regular', 'boldItalic');
        }
      });
    }

    // Append the system fonts to cssText
    cssText += await response.text();

    console.log('cssText', cssText);

    return cssText;
  } catch (error) {
    console.error('Error fetching fonts CSS:', error);
    return ''; // Return default or error CSS
  }
};