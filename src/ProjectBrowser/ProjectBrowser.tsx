// Browser/ProjectBrowser.tsx
import React, { useEffect, useState } from 'react';
import { Box, IconButton, useTheme, PaletteColor, PaletteMode, Typography } from '@mui/material';
import { findItemByPath, selectFiles, selectOpenFilePath, setFiles, setOpenFilePath, setProjectId, setProjectSettings, setProjectTitle } from '../redux/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import Sticky from 'react-stickynode';
import FileBrowserItem from './FileBrowserItem';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import NewFileDialog from './NewFileDialog';
import { NewBrowserItem, SetOpenFunction } from './useBrowserDialog';
import DuplicateDialog from './DuplicateDialog';
import DeleteDialog from './DeleteDialog';
import MoveFileDialog from './MoveFileDialog';
import { ProjectFile } from '../Project/ProjectTypes';
import ProjectActionBar from './ProjectActionBar';
import useProjectRename from './useProjectRename';
import { Editor } from 'tinymce';
import useProject from '../Project/useProject';
import useUser from '../User/useUser';

interface ProjectBrowserProps {
  onDocumentClick: (item: ProjectFile) => void;
  setProjectSettingsOpen: (open: boolean) => void;
  editor: Editor;
  setEditorContent: (content: string) => void;
};

export const ROOTFOLDER = '<root>';

export const findParentFolder = (path: string[]) => {
  const filteredPath = path.filter(p => p !== '');
  const parentPath = filteredPath.slice(0, -1);

  const openFolder = parentPath.length ? `${parentPath.join('/')}` : ROOTFOLDER;

  return openFolder;
}

export type FileType = 'file' | 'folder' | null;
export type SubType = 'document' | 'image' | 'other' | null;

export const paletteRGBA = (color: PaletteColor, opacity: number, mode: PaletteMode) => {
  return `rgba(${color[mode].replace('rgb(', '').replace(')', '')}, ${opacity})`;
}

const ProjectBrowser: React.FC<ProjectBrowserProps> = ({ onDocumentClick, setProjectSettingsOpen, editor, setEditorContent }) => {
  const items = useSelector(selectFiles);

  const openFilePath = useSelector(selectOpenFilePath);
  const theme = useTheme();

  const openItem = findItemByPath(items, openFilePath?.split('/') || []);
  let initialFolder = openFilePath;

  if (openItem && openItem.type !== 'folder') {
    initialFolder = findParentFolder(openItem.path.split('/'));
  }

  const [openFolder, setOpenFolder] = useState<string | null>(initialFolder);
  const [duplicating, setDuplicating] = useState<ProjectFile | false>(false);
  const [deleting, setDeleting] = useState<ProjectFile | false>(false);
  const [moving, setMoving] = useState<ProjectFile | false>(false);

  const [adding, setAdding] = useState<NewBrowserItem | false>(false);

  const handleFolderClick = (folder: ProjectFile) => {
    setOpenFolder(folder.path);
  }

  const renderItem = (item: ProjectFile, path: string[] = [], idx:number) => {
    return (
      <FileBrowserItem
        index={idx}
        count={items.length}
        key={item.name}
        onFolderClick={handleFolderClick}
        setMoving={setMoving as SetOpenFunction}
        setDeleting={setDeleting as SetOpenFunction}
        setDuplicating={setDuplicating as SetOpenFunction}
        {...{ setOpenFolder, onDocumentClick, openFolder, item, path, openFilePath } }
      />
    );
  };

  const { renaming, title, renameInputRef, handleEditClick, handleRenameBlur, handleRenameKeyPress } = useProjectRename();
  const { loadProjectById, currentProject, reloading, setReloading } = useProject({});
  const { user } = useUser();

  const dispatch = useDispatch();

  useEffect(() => {
    if (reloading) {
      const openFile = findItemByPath(reloading.files, reloading.openFilePath?.split('/') || []);

      if (openFile) {
        setEditorContent(openFile.content as string);
        editor.setContent(openFile.content as string);
      }

      dispatch(setFiles(reloading.files));
      dispatch(setOpenFilePath(reloading.openFilePath || '/'));
      dispatch(setProjectTitle(reloading.title || 'Untitled'));
      dispatch(setProjectSettings(reloading.settings || {}));
      dispatch(setProjectId(reloading.id));

      setReloading(undefined);
    }
  }, [reloading, dispatch, editor, setEditorContent, setReloading]);

  const handleRefreshClick = () => {
    if (currentProject && currentProject.id && user && user.token) {
      loadProjectById(currentProject.id, user.token, true);
    }
  }

  return (
    <Box
      width="100%"
      sx={{
        backgroundColor: theme.palette.secondary[theme.palette.mode],
        minHeight: "calc(100vh - 40px)",
        maxHeight: "calc(100% - 40px)",
        overflowY: "hidden",
      }}
    >
      <Sticky top={64} innerZ={1}>
        <Box px={3} py={1} position="relative">
          {renaming ? (
            <input
              ref={renameInputRef}
              defaultValue={title}
              onBlur={handleRenameBlur}
              onKeyPress={handleRenameKeyPress}
              style={{ border: "none", outline: "none", background: "transparent", color: "inherit" }}
            />
          ) : (
            <>
              <Typography variant="h6" component="h2" sx={{ color: theme.palette.primary.contrastText }}>
                { title }
              </Typography>
            </>
          )}

          <ProjectActionBar 
            onEditClick={handleEditClick}
            onRefreshClick={handleRefreshClick}
            currentProject={currentProject}
          />
        </Box>

        <Box
          overflow={{ overflowY: "auto", overflowX: "hidden" }}
          maxHeight="calc(100vh - 108px)"
          pb={8}
          sx={{ color: theme.palette.text.primary }}
          height="100vh"
          position="relative"
        >
          <Box
            position="fixed"
            bottom="0"
            zIndex={100}
            px={2}
            py={1}
            width="100%"
            textAlign="right"
            display="block"
            sx={{ 
              backgroundColor: paletteRGBA(theme.palette.primary, .6, theme.palette.mode),
              backdropFilter: 'blur(3px)',
            }}
          >
            <IconButton
              aria-label="Project Settings"
              component="label"
              sx={{
                position: 'absolute',
                left: '.5rem'
              }}
              onClick={() => setProjectSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>

            <IconButton
              aria-label="Add a New File"
              component="label"
              onClick={() => setAdding({ type: 'file', subType: 'document' })}
            >
              <NoteAddIcon />
            </IconButton>
  
            <IconButton
              aria-label="Add a New Folder"
              component="label"
              onClick={() => setAdding({ type: 'folder', subType: null })}
            >
              <CreateNewFolderIcon />
            </IconButton>
          </Box>
          {items.map((item, idx) => renderItem(item, [], idx))}
        </Box>
      </Sticky>

      <NewFileDialog {...{
        editor,
        open: Boolean(adding), 
        fileType: adding ? adding.type : null,
        subType: adding ? adding.subType as SubType : null,
        openFilePath: openFilePath as string,
        onClose: () => setAdding(false),
        setOpenFolder, openFolder }}
      />

      {Boolean(duplicating) &&
        <DuplicateDialog {...{ 
          open: Boolean(duplicating), 
          setOpen: setDuplicating as SetOpenFunction, 
          onClose: () => setDuplicating(false),
          sourceFilePath: duplicating ? duplicating.path : '',
          fileType: duplicating ? duplicating.type : 'file',
          subType: duplicating ? (duplicating.subType || null) : null,
          setOpenFolder, openFolder }}
        />
      }

      {Boolean(deleting) &&
        <DeleteDialog {...{ 
          open: Boolean(deleting), 
          setOpen: setDeleting as SetOpenFunction, 
          onClose: () => setDeleting(false),
          sourceFilePath: deleting ? deleting.path : '',
          setOpenFolder, openFolder }}
        />
      }

      {Boolean(moving) &&
        <MoveFileDialog {...{
          open: Boolean(moving),
          setOpen: setMoving as SetOpenFunction,
          onClose: () => setMoving(false),
          sourceFilePath: moving ? moving.path : '',
          openFilePath: openFilePath as string,
          setOpenFolder, openFolder, editor }}
        />
      }

    </Box>
  );
};

export default ProjectBrowser;