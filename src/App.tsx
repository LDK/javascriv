// App.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, ThemeProvider } from '@mui/material';
import Header from './Header/Header';
import ProjectBrowser from './ProjectBrowser/ProjectBrowser';
import { useDispatch, useSelector } from 'react-redux';
import { findAllChangedFiles, findItemByPath, setChanged, setContent, setOpenFilePath } from './redux/projectSlice';
import TinyEditor from './Editor/Editor';
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
import ProjectSettingsScreen from './ProjectSettingsScreen';
import ManageProjectsScreen from './ManageProjectsScreen';
import UserSettingsScreen from './ProjectBrowser/UserSettingsScreen';
import { EditorFont } from './Editor/EditorFonts';
import axios, { AxiosResponse } from 'axios';
import { set } from 'immer/dist/internal';

const App: React.FC = () => {  
  const [editorContent, setEditorContent] = useState<string | null | false>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [initial, setInitial] = useState<string | null>(null);
  const [lastRevertTs, setLastRevertTs] = useState<number>(0);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [addCollabOpen, setAddCollabOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const { user, getProjectListings } = useUser();
  const [manageProjectsOpen, setManageProjectsOpen] = useState(false);

  const [changedFiles, setChangedFiles] = useState<(number | undefined)[]>([]);

  const editorAreaBps = manageProjectsOpen ? { sm: 12, hd: 9 } : { md: 8, lg: 9 };
  const browserBps = manageProjectsOpen ? { xs: 0, hd: 3 } : { xs: 12, md: 4, lg: 3 };

  const dispatch = useDispatch();

  const handleDocumentClick = (item: ProjectFile) => {
    if (openFilePath && editor) {
      dispatch(setContent({path: openFilePath, content: editor.getContent()}));
    }
    setInitial(item.initialContent as string);
    dispatch(setOpenFilePath(item.path));
  }

  const { saveFile, documentClick, setHasContentChanged, hasContentChanged, openFilePath, items } = useFileBrowser({ contentCallback: handleDocumentClick });

  const handleEditorChange = (content: string) => {
    setHasContentChanged(Boolean((content && initial) && content !== initial));
  };

  const { 
    opening, setOpening, setReloading, ImportButton, ExportButton, ImportOptions, ExportOptions, importingPath,
    handleUpload, setNewProjectOpen, newProjectOpen, loadProject, saveProject, currentProject,
    NewProjectButton, saving, setSaving, ProjectSelector
  } = useProject({ handleEditorChange, saveCallback: () => { getProjectListings(true) } });

  const [isCollab, setIsCollab] = useState(Boolean(currentProject?.collaborators?.length) || false);
  const [amCreator, setAmCreator] = useState(currentProject?.creator === user?.id || false);
  const [checkTimer, setCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const [lockedFilePaths, setLockedFilePaths] = useState<string[]>([]);

  useEffect(() => {
    if (isCollab && currentProject?.id && user?.id) {
      setAmCreator(currentProject.creator === user?.id);
      setCheckTimer(setInterval(() => {
        const AuthStr = 'Bearer ' + user.token;
        axios.get(`${process.env.REACT_APP_API_URL}/project/${currentProject.id}/locked-files`, { headers: { Authorization: AuthStr } })
        .then((response:AxiosResponse<string[]>) => {
          setLockedFilePaths(response.data);
        })
        .catch((error) => {
          setLockedFilePaths([]);
          console.log(error);
        });
      }, 30000));
    } else {
      if (checkTimer) {
        clearInterval(checkTimer);
        setCheckTimer(null);
      }
      setLockedFilePaths([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollab, currentProject.id, user.id]);

  useEffect(() => {

  }, [lockedFilePaths]);

  useEffect(() => {
    if (isCollab) {
      const AuthStr = 'Bearer ' + user.token;
      const postUrl = `${process.env.REACT_APP_API_URL}/user/editing`;
      const payload = { fileIds: changedFiles, projectId: currentProject?.id };
      const headers = { headers: { Authorization: AuthStr } };

      axios.post(postUrl, payload, headers)
        .then((response) => {
          // console.log('editing response', response);
        })
        .catch((error) => {
          console.log('editing error', error);
        });
    }
  }, [changedFiles]);

  const { PublishButton, PublishOptionsDialog } = usePublishing(
    currentProject ? currentProject.settings as PublishOptions : user?.publishingOptions,
    (currentProject && currentProject.settings) ? { font: currentProject.settings.font as EditorFont, fontSize: currentProject.settings.fontSize as number } : user?.fontOptions
  );

  const { fileInputRef, setFileInputRef } = useFileInputRef();

  const activeTheme = useSelector((state:RootState) => state.theme.active);

  useEffect(() => {
    const changed = {path: openFilePath || '', changed: hasContentChanged};

    dispatch(setChanged(changed));
    if (isCollab && openFilePath) {
      const openFile = findItemByPath(items, openFilePath.split('/'));

      if (openFile?.id && hasContentChanged) {
        const changedIds:(number | undefined)[] = [openFile, ...(findAllChangedFiles(items).filter(item => item.id && (item.id !== openFile?.id)))].map((item) => item?.id);
        setChangedFiles(changedIds);
      } else if (openFile?.id) {
        const changedIds:(number | undefined)[] = findAllChangedFiles(items).map((item) => item?.id);
        setChangedFiles(changedIds);
      }
    }
  }, [hasContentChanged, openFilePath, dispatch]);

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

  useEffect(() => {
    if (currentProject?.id) {
      setManageProjectsOpen(false);
      setProjectSettingsOpen(false);
      setAddCollabOpen(false);
      setAmCreator(currentProject.creator === user?.id);
      setIsCollab(Boolean(currentProject.collaborators?.length));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id]);

  useEffect(() => {
    if (projectSettingsOpen && manageProjectsOpen) {
      setProjectSettingsOpen(false);
    }
    if (projectSettingsOpen && userSettingsOpen) {
      setUserSettingsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manageProjectsOpen]);

  useEffect(() => {
    if (projectSettingsOpen && manageProjectsOpen) {
      setManageProjectsOpen(false);
    }
    if (projectSettingsOpen && userSettingsOpen) {
      setUserSettingsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSettingsOpen]);

  useEffect(() => {
    if (userSettingsOpen && manageProjectsOpen) {
      setManageProjectsOpen(false);
    }
    if (userSettingsOpen && projectSettingsOpen) {
      setProjectSettingsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettingsOpen]);

  const defaultFont = (currentProject?.settings?.font || user?.fontOptions?.font || { name: 'Roboto', value: 'Roboto' }) as EditorFont;
  const defaultFontSize = (currentProject?.settings?.fontSize || user?.fontOptions?.fontSize || 12) as number;

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

  const SaveButton = () => <Button variant="text" color="primary" onClick={handleSave}>Save Project</Button>;
  const RevertButton = () => <Button variant="text" color="primary" onClick={handleRevert} disabled={!hasContentChanged}>Revert File</Button>;

  const AddCollaboratorButton = () => <Button onClick={(e) => {
    e.currentTarget.blur(); // Remove focus from the button
    setAddCollabOpen(true);
  }}>Add Collaborator to Project</Button>;

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
      <Header {...{ loadProject, settingsCallback: () => { setUserSettingsOpen(true); }, ProjectSelector, appMenuButtons, handleEditorChange, fileInputRef, importCallback, manageCallback, newCallback: () => { setNewProjectOpen(true); } }} />
      <CssBaseline />

      <Box pt={8} flexGrow={1} display="flex">
        <Container maxWidth="xl" sx={{ px: "0 !important" }}>
          <Grid container spacing={0}>
            <Grid item {...browserBps} px={0} mx={0} display={{ xs: manageProjectsOpen ? 'none' : 'flex', hd: 'flex'}}>
                {editor && <ProjectBrowser
                  {...{ editor, setProjectSettingsOpen, setEditorContent }}
                  onDocumentClick={documentClick}
                />}
            </Grid>
            <Grid item xs={12} {...editorAreaBps}>
              <Box px={0}>
                <Box p={0} m={0} display={ (projectSettingsOpen || manageProjectsOpen || userSettingsOpen) ? 'none' : 'block' }>
                  <TinyEditor {...{ openFilePath, setEditor, handleEditorChange, defaultFont, defaultFontSize, lockedFilePaths }} lastRevert={lastRevertTs} content={editorContent || ''} />
                </Box>

                <ProjectSettingsScreen open={projectSettingsOpen} onClose={() => setProjectSettingsOpen(false)} />
                <ManageProjectsScreen {...{user, currentProject, loadProject, getProjectListings, addCollabOpen, setAddCollabOpen}} open={manageProjectsOpen} onClose={() => setManageProjectsOpen(false)} />
                { (!user || !user.id || !userSettingsOpen) ? null :
                  <UserSettingsScreen {...{user, userSettingsOpen, setUserSettingsOpen}} open={userSettingsOpen} onClose={() => setUserSettingsOpen(false)} />
                }

                <Box pt={2} className="actions" position="absolute" bottom="2rem" width="100%" right="0" textAlign="right">

                <input type="file" accept=".zip, .json"
                  ref={setFileInputRef}
                  onChange={handleUpload}
                  style={{ display: 'none' }} />

                  <ExportOptions />

                  <ImportOptions />
                  <PublishOptionsDialog />
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
