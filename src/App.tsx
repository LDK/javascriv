// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, ThemeProvider } from '@mui/material';
import Header from './Header/Header';
import ProjectBrowser from './ProjectBrowser/ProjectBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { findItemByPath, setContent, setOpenFilePath } from './redux/projectSlice';
import { TinyEditorProps } from './Editor/Editor';
import { darkTheme, lightTheme } from './theme/theme';
import { RootState } from './redux/store';
import useProject from './Project/useProject';
import useFileBrowser from './ProjectBrowser/useFileBrowser';
import usePublishing from './Publish/usePublishing';
import { Editor } from 'tinymce';
import NewProjectDialog from './ProjectBrowser/NewProjectDialog';
import { ProjectFile, PublishOptions } from './Project/ProjectTypes';
import OpenProjectDialog from './ProjectBrowser/OpenProjectDialog';
import useUser from './User/useUser';
import AddCollaboratorDialog from './Project/AddCollaboratorDialog';
import useFileInputRef from './useFileInputRef';
import { ProjectSettingsDialogProps } from './ProjectSettingsScreen';
import { ManageProjectsDialogProps } from './ManageProjectsScreen';
import { UserSettingsScreenProps } from './ProjectBrowser/UserSettingsScreen';
import { EditorFont } from './Editor/EditorFonts';
import ContentArea from './ContentArea';
import useSettingsDialogs from './useSettingsDialogs';
import useCollab from './useCollab';
import { useParams } from 'react-router-dom';
import NewPasswordDialog from './Components/NewPasswordDialog';

type AppProps = {
  resetPassword?: boolean;
};

const App: React.FC<AppProps> = ({ resetPassword }) => {
  const { token } = useParams<{token: string}>();
  
  const [initial, setInitial] = useState<string | null>(null);
  const [lastRevertTs, setLastRevertTs] = useState<number>(0);
  const [addCollabOpen, setAddCollabOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, getProjectListings } = useUser();
    
  const { fileInputRef, setFileInputRef } = useFileInputRef();
  
  const [editorContent, setEditorContent] = useState<string | null | false>(null);
  const [editor, setEditor] = useState<Editor | null>(null);

  const [browserOpen, setBrowserOpen] = useState(false);

  useEffect(() => {
    console.log('addCollabOpen', addCollabOpen);
  }, [addCollabOpen]);

  const dispatch = useDispatch();

  const handleDocumentClick = (item: ProjectFile) => {
    if (openFilePath && editor) {
      dispatch(setContent({path: openFilePath, content: editor.getContent()}));
    }
    
    setInitial(item.initialContent as string);
    console.log('handleDocumentClick', item);
    dispatch(setOpenFilePath(item.path));
  }

  const { saveFile, documentClick, setHasContentChanged, hasContentChanged, 
    openFilePath, items } = useFileBrowser({ contentCallback: handleDocumentClick });

  const handleEditorChange = (content: string) => {
    setHasContentChanged(Boolean((content && initial) && content !== initial));
  };

  const { 
    opening, setOpening, setReloading, ImportButton, ExportButton, importingPath,
    setNewProjectOpen, newProjectOpen, loadProject, saveProject, currentProject,
    NewProjectButton, saving, setSaving, ProjectSelector, ExportOptions, ImportOptions,
    handleUpload
  } = useProject({ handleEditorChange, saveCallback: () => { getProjectListings(true) } });

  const defaultFont = (currentProject?.settings?.font || user?.fontOptions?.font || { name: 'Roboto', value: 'Roboto' }) as EditorFont;
  const defaultFontSize = (currentProject?.settings?.fontSize || user?.fontOptions?.fontSize || 12) as number;

  const { 
    manageProjectsOpen, projectSettingsOpen, userSettingsOpen,
    setManageProjectsOpen, setProjectSettingsOpen, setUserSettingsOpen,
   } = useSettingsDialogs();

  const editorAreaBps = manageProjectsOpen ? { sm: 12, hd: 9 } : { xs: 12, md: 8, lg: 9 };
  const browserBps = manageProjectsOpen ? { xs: 0, hd: 3 } : { xs: 0, md: 4, lg: 3 };

  const { PublishButton, PublishOptionsDialog } = usePublishing(
    currentProject ? currentProject.settings as PublishOptions : user?.publishingOptions,
    (currentProject && currentProject.settings) ? { font: currentProject.settings.font as EditorFont, fontSize: currentProject.settings.fontSize as number } : user?.fontOptions
  );

  const activeTheme = useSelector((state:RootState) => state.theme.active);

  useEffect(() => {
    if (openFilePath && items) {
      const existing = findItemByPath(items, openFilePath.split('/'));
      if (existing && existing.path) {
        // setEditorContent(existing.content);
        setEditorContent(existing.content as string);
        setInitial(existing.initialContent || existing.content as string);
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

  const { lockedFilePaths } = useCollab({ currentProject, hasContentChanged, items, openFilePath  });

  useEffect(() => {
    if (currentProject?.id) {
      setManageProjectsOpen(false);
      setProjectSettingsOpen(false);
      setAddCollabOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id]);

  useEffect(() => {
    if (mobileMenuOpen) {
      setUserSettingsOpen(false);
    }
  }, [mobileMenuOpen, setUserSettingsOpen]);

  useEffect(() => {
    if (userSettingsOpen) {
      setMobileMenuOpen(false);
      setManageProjectsOpen(false);
    }
  }, [userSettingsOpen, setMobileMenuOpen, setManageProjectsOpen]);

  useEffect(() => {
    if (manageProjectsOpen) {
      setMobileMenuOpen(false);
      setUserSettingsOpen(false);
    }
  }, [manageProjectsOpen, setMobileMenuOpen, setUserSettingsOpen]);

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
    setReloading(undefined);
  };

  const projectSettingsParams:ProjectSettingsDialogProps = { open: projectSettingsOpen, onClose: () => setProjectSettingsOpen(false) };
  const manageProjectsParams:ManageProjectsDialogProps = { user, currentProject, loadProject, getProjectListings, open: manageProjectsOpen, onClose: () => setManageProjectsOpen(false) };
  const userSettingsParams:UserSettingsScreenProps = { user, open: userSettingsOpen, onClose: () => setUserSettingsOpen(false) };

  const editorParams:TinyEditorProps = {
    ...{ openFilePath, items, setEditor, handleEditorChange, defaultFont, defaultFontSize, lockedFilePaths },
    lastRevert: lastRevertTs,
    content: editorContent || null
  };

  const SaveButton = () => <Button variant="text" color="primary" onClick={handleSave}>Save Project</Button>;
  const RevertButton = () => <Button variant="text" color="primary" onClick={handleRevert} disabled={!hasContentChanged}>Revert File</Button>;

  const AddCollaboratorButton = () => {
    if (!user?.id || !currentProject?.id) {
      return null;
    }

    return (
      <Button sx={{ textAlign: 'left' }} onClick={(e) => {
        e.currentTarget.blur(); // Remove focus from the button
        setAddCollabOpen(true);
        console.log('addCollabOpen clicked', addCollabOpen);
      }}>Add Collaborator to Project</Button>
    );
  };

  const importCallback = () => { fileInputRef?.click(); };

  const manageCallback = () => { setManageProjectsOpen(true); };

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
      <CssBaseline />

      <Header
        {...{ loadProject, browserOpen, setBrowserOpen, settingsCallback: () => { setUserSettingsOpen(true); }, ProjectSelector, appMenuButtons, handleEditorChange, fileInputRef, importCallback, manageCallback, mobileMenuOpen, setMobileMenuOpen, newCallback: () => { setNewProjectOpen(true); } }}
      />

      <input type="file" accept=".zip, .json" ref={setFileInputRef} onChange={handleUpload} style={{ display: 'none' }} />

      <Box pt={{ xs: 7, md: 8 }} flexGrow={1} display="flex">
        <Container maxWidth="xl" sx={{ px: "0 !important" }}>
          <Grid container spacing={0}>
            <Grid item {...browserBps} px={0} mx={0} display={{ xs: 'none', md: manageProjectsOpen ? 'none' : 'flex', hd: 'flex'}}>
              {editor && <ProjectBrowser
                {...{ editor, setProjectSettingsOpen, setEditorContent }}
                onDocumentClick={documentClick}
              />}
            </Grid>

            <Grid item xs={12} {...editorAreaBps}>
              <ContentArea 
                mobileBrowser={
                  !editor ? <></> : <ProjectBrowser
                    {...{ editor, setProjectSettingsOpen, setEditorContent }}
                    onDocumentClick={documentClick}
                    closeMobileBrowser={() => setBrowserOpen(false)}
                  />
                }                
                {...{ items, openFilePath, browserOpen, setBrowserOpen, mobileMenuOpen, setMobileMenuOpen, projectSettingsOpen, manageProjectsOpen, userSettingsOpen, user, editorParams, projectSettingsParams, manageProjectsParams, userSettingsParams, handleDocumentClick, appMenuButtons }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Dialogs go here */}
      <ExportOptions />
      <ImportOptions />
      <PublishOptionsDialog />
      <NewPasswordDialog {...{token, open: resetPassword || false, onClose: () => {}}} />
      <NewProjectDialog setEditorContent={setEditorContent} open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
      <OpenProjectDialog onClose={handleOpenProjectClose} project={opening} />
      <AddCollaboratorDialog {...{user, currentProject}} open={addCollabOpen} onClose={() => setAddCollabOpen(false)} />
    </ThemeProvider>
  );
};

export default App;
