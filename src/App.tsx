// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, ThemeProvider } from '@mui/material';
import Header from './Header/Header';
import ProjectBrowser from './ProjectBrowser/ProjectBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { findItemByPath, setChanged, setContent, setOpenFilePath } from './redux/projectSlice';
import TinyEditor from './Editor/Editor';
import { darkTheme, lightTheme } from './theme/theme';
import { RootState } from './redux/store';
import useProject from './Project/useProject';
import useFileBrowser from './ProjectBrowser/useFileBrowser';
import usePublishing from './Publish/usePublishing';
import { Editor } from 'tinymce';
import NewProjectDialog from './ProjectBrowser/NewProjectDialog';
import ProjectSettingsDialog from './Project/ProjectSettingsDialog';
import { ProjectFile, ProjectListing } from './Project/ProjectTypes';
import OpenProjectDialog from './ProjectBrowser/OpenProjectDialog';
import useUser from './User/useUser';
import AddCollaboratorDialog from './Project/AddCollaboratorDialog';

const App: React.FC = () => {  
  const [saving, setSaving] = useState(false);
  const [editorContent, setEditorContent] = useState<string | null | false>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [initial, setInitial] = useState<string | null>(null);
  const [lastRevertTs, setLastRevertTs] = useState<number>(0);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [addCollabOpen, setAddCollabOpen] = useState(false);
  const { user, getProjectListings } = useUser();

  const dispatch = useDispatch();

  const handleDocumentClick = (item: ProjectFile) => {
    if (openFilePath && editor) {
      dispatch(setContent({path: openFilePath, content: editor.getContent()}));
    }
    setInitial(item.initialContent as string);
    dispatch(setOpenFilePath(item.path));
  }

  const { saveFile, documentClick, setHasContentChanged, hasContentChanged, openFilePath, items } = useFileBrowser({ contentCallback: handleDocumentClick });
  const { PublishButton, PublishOptions } = usePublishing();

  const handleEditorChange = (content: string) => {
    console.log('handleEditorChange', content, 'vs', initial);
    setHasContentChanged(content !== initial);
  };

  const { 
    opening, setOpening, ImportButton, ExportButton, ImportOptions, ExportOptions, importingPath,
    handleUpload, setNewProjectOpen, newProjectOpen, loadProject, saveProject, currentProject
  } = useProject({ setSaving, handleEditorChange, saveCallback: () => { getProjectListings(true) } });

  const projectId = currentProject?.id || undefined;

  const activeTheme = useSelector((state:RootState) => state.theme.active);

  useEffect(() => {
    dispatch(setChanged({path: openFilePath || '', changed: hasContentChanged}));
  }, [hasContentChanged, openFilePath, dispatch]);

  // useEffect(() => {
  //   console.log('currentProject', currentProject);
  // }, [currentProject]);

  useEffect(() => {
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing && existing.path) {
        // setEditorContent(existing.content);
        setEditorContent(existing.content as string);
        setInitial(existing.initialContent as string);
      } else {
        if (editorContent === null) {
          setEditorContent(false);
        }
      }
    } else if (!openFilePath) {
      setEditorContent(null);
      setInitial(null);
    }
    // eslint-disable-next-line
  }, [openFilePath, importingPath]);

  useEffect(() => {
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing && existing.content) {
        setEditorContent(existing.content as string)
      }
    }
    // eslint-disable-next-line
  }, [activeTheme]);

  useEffect(() => {
    if (saving && user && user.token && currentProject) {
      console.log('calling save project', currentProject);
      saveProject({ user, project: currentProject });
    }
    setSaving(false);
  }, [saving, saveProject, loadProject, currentProject, user]);

  const handleSave = async () => {
    if (!editor) return;

    const content = editor.getContent() || '';
    await saveFile(content);
    console.log('handle save content', content, currentProject.files);
    // setInitial(content);
    setSaving(true);
  };

  const handleRevert = async () => {
    setLastRevertTs(Date.now());
    setEditorContent(initial);
  };

  const handleOpenProjectClose = () => {
    setOpening(undefined);
  };

  const SaveButton = () => <Button variant="text" color="primary" onClick={handleSave}>Save Project</Button>;
  const RevertButton = () => <Button variant="text" color="primary" onClick={handleRevert} disabled={!hasContentChanged}>Revert File</Button>;
  const NewProjectButton = () => <Button onClick={(e) => {
    e.currentTarget.blur(); // Remove focus from the button
    setNewProjectOpen(true);
  } }
    color="primary" variant="text"
  >
    New Project
  </Button>;

  const AddCollaboratorButton = () => <Button onClick={(e) => {
    e.currentTarget.blur(); // Remove focus from the button
    setAddCollabOpen(true);
  }}>Add Collaborator to Project</Button>;

  const appMenuButtons = [
    <SaveButton />,
    <RevertButton />,
    <ExportButton />,
    <ImportButton callback={() => { fileInputRef?.click();}} />,
    <AddCollaboratorButton />,
    <NewProjectButton />,
    <PublishButton />,
  ];

  return (
    <ThemeProvider theme={activeTheme === 'light' ? lightTheme : darkTheme}>
      <Header {...{ loadProject, appMenuButtons }} />
      <CssBaseline />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="xl" sx={{ px: "0 !important" }}>
          <Grid container spacing={0}>
            <Grid item xs={12} md={4} lg={3} xl={2} px={0} mx={0}>
                <ProjectBrowser
                  onDocumentClick={documentClick}
                  setProjectSettingsOpen={setProjectSettingsOpen}
                />
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              <Box px={0}>
                <TinyEditor {...{ setEditor, handleEditorChange }} lastRevert={lastRevertTs} content={editorContent || ''} />

                <Box pt={2} className="actions" position="absolute" bottom="2rem" width="100%" right="0" textAlign="right">
                <input type="file" accept=".zip, .json"
                    ref={setFileInputRef}
                    onChange={handleUpload}
                    style={{ display: 'none' }} />

                  <ExportOptions />

                  <ImportOptions />
                  <PublishOptions />
                </Box>

              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
 
      <NewProjectDialog open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
      <OpenProjectDialog onClose={handleOpenProjectClose} project={opening} />
      <ProjectSettingsDialog open={projectSettingsOpen} onClose={() => setProjectSettingsOpen(false)} />
      <AddCollaboratorDialog {...{user, currentProject}} open={addCollabOpen} onClose={() => setAddCollabOpen(false)} />
    </ThemeProvider>
  );
};

export default App;
