// Convert/scrivener/scrivenerTree.ts
import { ScrivenerMetaData, ScrivenerTextSettings, ScrivenerMediaSettings, parseMetaData } from "./scrivenerMeta";

export interface ScrivenerBinder {
  items: ScrivenerBinderItem[];
}

export interface ScrivenerBinderItem {
  UUID: string;
  Type: string;
  Created: string;
  Modified: string;
  Title?: string;
  Content?: string;
  MetaData?: ScrivenerMetaData;
  TextSettings?: ScrivenerTextSettings;
  MediaSettings?: ScrivenerMediaSettings;
  Children?: ScrivenerBinderItem[];
}

function parseBinderItem(itemElement: Element): ScrivenerBinderItem {
  const binderItem: ScrivenerBinderItem = {
    UUID: itemElement.getAttribute('UUID') as string,
    Type: itemElement.getAttribute('Type') as string,
    Created: itemElement.getAttribute('Created') as string,
    Modified: itemElement.getAttribute('Modified') as string,
  };

  const titleElement = itemElement.getElementsByTagName('Title')[0];
  if (titleElement && titleElement.textContent) {
    binderItem.Title = titleElement.textContent;
  }

  const metaDataElement = itemElement.getElementsByTagName('MetaData')[0];
  if (metaDataElement) {
    binderItem.MetaData = parseMetaData(metaDataElement);
  }

  const textSettingsElement = itemElement.getElementsByTagName('TextSettings')[0];
  if (textSettingsElement) {
    const textSelectionElement = textSettingsElement.getElementsByTagName('TextSelection')[0];
    if (textSelectionElement && textSelectionElement.textContent) {
      binderItem.TextSettings = {
        TextSelection: textSelectionElement.textContent as string,
      };
    }
  }

  const mediaSettingsElement = itemElement.getElementsByTagName('MediaSettings')[0];
  if (mediaSettingsElement) {
    const currentPDFPageElement = mediaSettingsElement.getElementsByTagName('CurrentPDFPage')[0];
    if (currentPDFPageElement && currentPDFPageElement.textContent) {
      binderItem.MediaSettings = {
        CurrentPDFPage: currentPDFPageElement.textContent,
      };
    }
  }

  const childrenElement = itemElement.getElementsByTagName('Children')[0];
  if (childrenElement) {
    const children: ScrivenerBinderItem[] = [];

    for (let i = 0; i < childrenElement.children.length; i++) {
      children.push(parseBinderItem(childrenElement.children[i]));
    }

    binderItem.Children = children;
  }
  return binderItem;
}

export function scrivxToObject(scrivx: string): ScrivenerBinder {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(scrivx, 'application/xml');
  const binderElement = xmlDoc.getElementsByTagName('Binder')[0];
  const binderItems = binderElement.children;

  const items: ScrivenerBinderItem[] = [];

  for (let i = 0; i < binderItems.length; i++) {
    if (binderItems[i].parentElement === binderElement) {
      items.push(parseBinderItem(binderItems[i]));
    }
  }

  return { items };
}
