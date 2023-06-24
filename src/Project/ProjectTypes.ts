import { EditorFont } from "../Editor/EditorFonts";

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
};

export type ProjectSettings = {
  [key: string]: string | number | boolean | EditorFont | null;
};

export type ProjectState = {
  files: ProjectFile[];
  openFilePath: string | null;
  settings?: ProjectSettings;
  title?: string;
  id?: number;
  creator?: number;
};

export type ProjectListing = {
  id: number;
  title: string;
}

export type Project = ProjectState & {
  creator: number;
  id: number;
  title: string;
}

