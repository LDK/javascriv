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
import { ProjectFile } from './Project/ProjectTypes';
import OpenProjectDialog from './ProjectBrowser/OpenProjectDialog';
import useUser from './User/useUser';
import AddCollaboratorDialog from './Project/AddCollaboratorDialog';
import useFileInputRef from './useFileInputRef';
import ProjectSettingsScreen from './ProjectSettingsScreen';

const App: React.FC = () => {  
  const [editorContent, setEditorContent] = useState<string | null | false>(null);
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
    setHasContentChanged(content !== initial);
  };

  const { 
    opening, setOpening, ImportButton, ExportButton, ImportOptions, ExportOptions, importingPath,
    handleUpload, setNewProjectOpen, newProjectOpen, loadProject, saveProject, currentProject,
    NewProjectButton, saving, setSaving, ProjectSelector
  } = useProject({ handleEditorChange, saveCallback: () => { getProjectListings(true) } });

  const { fileInputRef, setFileInputRef } = useFileInputRef();

  const activeTheme = useSelector((state:RootState) => state.theme.active);

  useEffect(() => {
    dispatch(setChanged({path: openFilePath || '', changed: hasContentChanged}));
  }, [hasContentChanged, openFilePath, dispatch]);

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
      saveProject({ user, project: currentProject });
    }
    setSaving(false);
  }, [saving, saveProject, loadProject, currentProject, user, setSaving]);

  const handleSave = async () => {
    if (!editor) return;

    const content = editor.getContent() || '';
    await saveFile(content);
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

  const AddCollaboratorButton = () => <Button onClick={(e) => {
    e.currentTarget.blur(); // Remove focus from the button
    setAddCollabOpen(true);
  }}>Add Collaborator to Project</Button>;

  const importCallback = () => { fileInputRef?.click(); };

  const appMenuButtons = [
    <SaveButton />,
    <RevertButton />,
    <ExportButton />,
    <ImportButton callback={importCallback} />,
    <AddCollaboratorButton />,
    <NewProjectButton />,
    <PublishButton />,
  ];

  return (
    <ThemeProvider theme={activeTheme === 'light' ? lightTheme : darkTheme}>
      <Header {...{ loadProject, ProjectSelector, appMenuButtons, handleEditorChange, fileInputRef, importCallback, newCallback: () => { setNewProjectOpen(true); } }} />
      <CssBaseline />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="xl" sx={{ px: "0 !important" }}>
          <Grid container spacing={0}>
            <Grid item xs={12} md={4} lg={3} xl={2} px={0} mx={0}>
                {editor && <ProjectBrowser
                  {...{ editor, setProjectSettingsOpen }}
                  onDocumentClick={documentClick}
                />}
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              <Box px={0}>
                <Box p={0} m={0} display={ projectSettingsOpen ? 'none' : 'block' }>
                  <TinyEditor {...{ setEditor, handleEditorChange }} lastRevert={lastRevertTs} content={editorContent || ''} />
                </Box>

                <ProjectSettingsScreen open={projectSettingsOpen} onClose={() => setProjectSettingsOpen(false)} />

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

      <NewProjectDialog setEditorContent={setEditorContent} open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
      <OpenProjectDialog onClose={handleOpenProjectClose} project={opening} />
      <AddCollaboratorDialog {...{user, currentProject}} open={addCollabOpen} onClose={() => setAddCollabOpen(false)} />
    </ThemeProvider>
  );
};

export default App;
