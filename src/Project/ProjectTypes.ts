import { EditorFont } from "../Editor/EditorFonts";
import { NewBrowserItem } from "../ProjectBrowser/useBrowserDialog";
import { AppUser } from "../redux/userSlice";

export type ProjectFile = {
  type: 'folder' | 'file';
  name: string;
  path: string;
  children?: ProjectFile[];
  subType?: 'document' | 'image' | 'other' | null;
  attachment?: string;
  content?: string;
  initialContent?: string;
  changed?: boolean;
  id?: number;
  creator?: number;
  lastEdited?: string;
  lastEditor?: number;
};

export type ProjectSettings = {
  [key: string]: string | number | boolean | EditorFont | null;
};

export type ProjectState = {
  files: ProjectFile[];
  openFilePath: string | null;
  settings: ProjectSettings;
  title?: string;
  id?: number;
  creator?: number;
  collaborators?: AppUser[];
  openFolders: string[];
  adding?: NewBrowserItem | false;
  openFolder?: string | null;
};

export type ProjectListing = {
  id: number;
  title: string;
  lastEdited?: string;
  lastEditor?: number;
}

export type Project = ProjectState & {
  creator: number;
  id: number;
  title: string;
}

export type PublishOptions = {
  pageBreaks: string;
  pageNumberPosition: string;
  includeToC: boolean;
  displayDocumentTitles: boolean;
};

export type FontOptions = {
  font: EditorFont;
  fontSize: number;
};