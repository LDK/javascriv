import JSZip from 'jszip';
import { XmlIndex } from './useProject';
import { store } from "../redux/store";
import { ProjectFile } from './ProjectTypes';

export const parseZipFile = async (file: File) => {
  // Create a new instance of JSZip
  const zip = new JSZip();

  // Read the zip file content
  const fileData = await file.arrayBuffer();

  // Load the zip file content
  const loadedZip = await zip.loadAsync(fileData);

  let isScrivener = false;
  let keyFiles: XmlIndex = {};

  let i = 0;

  // Iterate through the files inside the zip
  for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
    const pathArr = relativePath.split('/').filter((item) => item.length);
    const fileName = pathArr[pathArr.length - 1];

    if (fileName.startsWith('._')) {
      continue;
    }

    if (i === 0) {
      isScrivener = fileName.endsWith('.scriv');
    }

    i++;

    if (isScrivener) {
      if (fileName.endsWith('.scrivx')) {
        const content = await zipEntry.async('text');
        keyFiles['scrivx'] = content;
      }
      if (fileName === 'search.indexes') {
        const content = await zipEntry.async('text');
        keyFiles['indexes'] = content;
      }
    }
  }

  if (isScrivener) {
    return keyFiles;
  } else {
    return {} as XmlIndex;
  }
};

export   const exportProjectToJson = (fileName:string) => {
  // Add the .json extension if it's not already present
  if (!fileName.endsWith('.json')) {
    fileName += '.json';
  }

  // Use getState to grab `files` and `openFilePath` from files state
  const projectData = store.getState().project;

  // Convert the project data object into a JSON-formatted string
  const jsonString = JSON.stringify(projectData, null, 2);

  // Create a new Blob object containing the JSON string, with the MIME type set to 'application/json'
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a new URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create and configure a temporary anchor element to initiate the download
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;

  // Add the anchor to the document, initiate the download, and remove the anchor
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export   const exportProjectToHtml = (fileName: string) => {
  // Add the .html extension if it's not already present
  if (!fileName.endsWith('.html')) {
    fileName += '.html';
  }

  // Use getState to grab `files` from files state
  const projectData = store.getState().project;

  // Recursive function to generate HTML from files
  const generateHtml = (items: ProjectFile[], depth = 1): string => {
    let html = '';
    items.forEach(item => {
      let headingLevel = depth < 6 ? depth : 6; // Heading level doesn't go beyond h6

      if (item.type === 'folder') {
        html += `<h${headingLevel}>${item.name}</h${headingLevel}>\n`;
        if (item.children) {
          html += generateHtml(item.children, depth + 1); // Increase depth for children
        }
      } else if (item.type === 'file' && item.subType === 'document') {
        html += `<section>\n<h${headingLevel}>${item.name}</h${headingLevel}>\n`;
        if (item.content) {
          html += item.content;
        }
        html += `</section>\n`;
      }
    });
    return html;
  };

  // Generate HTML content
  const htmlContent = generateHtml(projectData.files);

  // Create a new Blob object containing the HTML content, with the MIME type set to 'text/html'
  const blob = new Blob([htmlContent], { type: 'text/html' });

  // Create a new URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create and configure a temporary anchor element to initiate the download
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;

  // Add the anchor to the document, initiate the download, and remove the anchor
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};
  
