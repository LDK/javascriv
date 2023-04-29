// Convert/scrivener/scrivenerIndexes.ts
export interface ScrivenerDocument {
  ID: string;
  Title: string | null;
  Text: string | null;
}

export interface ScrivenerSearchIndexes {
  Version: string;
  Documents: ScrivenerDocument[];
}

export function searchIndexesToObject(searchIndexesText: string): ScrivenerSearchIndexes {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(searchIndexesText, 'application/xml');

  const searchIndexesElement = xmlDoc.getElementsByTagName('SearchIndexes')[0];
  const version = searchIndexesElement.getAttribute('Version') as string;
  const documents = xmlDoc.getElementsByTagName('Document');

  const searchIndexes: ScrivenerSearchIndexes = {
    Version: version,
    Documents: [],
  };

  for (let i = 0; i < documents.length; i++) {
    const documentElement = documents[i];
    const id = documentElement.getAttribute('ID') || '';
    const titleElement = documentElement.getElementsByTagName('Title')[0];
    const textElement = documentElement.getElementsByTagName('Text')[0];
    const title = titleElement ? titleElement.textContent : null;
    const text = textElement ? textElement.textContent : null;

    searchIndexes.Documents.push({
      ID: id,
      Title: title,
      Text: text,
    });
  }

  return searchIndexes;
}

export async function loadSearchIndexesFileAndParse(): Promise<{ [id: string]: ScrivenerDocument }> {
  try {
    const response = await fetch('/search.indexes');
    if (response.ok) {
      const searchIndexesText = await response.text();
      const searchIndexes = searchIndexesToObject(searchIndexesText);
      console.log(searchIndexes);

      // Transform the searchIndexes.Documents array into an object keyed by ID
      const documentsById: { [id: string]: ScrivenerDocument } = {};
      searchIndexes.Documents.forEach(document => {
        documentsById[document.ID] = document;
      });

      return documentsById;
    } else {
      console.error('Error fetching search.indexes file:', response.status, response.statusText);
      return {};
    }
  } catch (error: any) {
    console.error('Error fetching search.indexes file:', error.message);
    return {};
  }
}

