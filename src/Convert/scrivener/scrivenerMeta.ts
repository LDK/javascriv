// Convert/scrivener/scrivenerMeta.ts

export interface ScrivenerMetaData {
  IncludeInCompile?: string;
  IconFileName?: string;
  StatusID?: string;
  SectionType?: string;
  ShowSynopsisImage?: string;
  FileExtension?: string;
}

export interface ScrivenerTextSettings {
  TextSelection: string;
}

export interface ScrivenerMediaSettings {
  CurrentPDFPage: string;
}

export function parseMetaData(metaDataElement: Element): ScrivenerMetaData {
  const metaData: ScrivenerMetaData = {};

  const includeInCompileElement = metaDataElement.getElementsByTagName('IncludeInCompile')[0];
  if (includeInCompileElement && includeInCompileElement.textContent) {
    metaData.IncludeInCompile = includeInCompileElement.textContent;
  }

  const iconFileNameElement = metaDataElement.getElementsByTagName('IconFileName')[0];
  if (iconFileNameElement && iconFileNameElement.textContent) {
    metaData.IconFileName = iconFileNameElement.textContent;
  }

  const statusIDElement = metaDataElement.getElementsByTagName('StatusID')[0];
  if (statusIDElement && statusIDElement.textContent) {
    metaData.StatusID = statusIDElement.textContent;
  }

  const sectionTypeElement = metaDataElement.getElementsByTagName('SectionType')[0];
  if (sectionTypeElement && sectionTypeElement.textContent) {
    metaData.SectionType = sectionTypeElement.textContent;
  }

  const showSynopsisImageElement = metaDataElement.getElementsByTagName('ShowSynopsisImage')[0];
  if (showSynopsisImageElement && showSynopsisImageElement.textContent) {
    metaData.ShowSynopsisImage = showSynopsisImageElement.textContent;
  }

  const fileExtensionElement = metaDataElement.getElementsByTagName('FileExtension')[0];
  if (fileExtensionElement && fileExtensionElement.textContent) {
    metaData.FileExtension = fileExtensionElement.textContent;
  }

  return metaData;
}
 
