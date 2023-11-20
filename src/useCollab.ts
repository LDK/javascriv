import axios, { AxiosResponse } from "axios";
import { useState, useEffect } from "react";
import { ProjectFile, ProjectState } from "./Project/ProjectTypes";
import useUser from "./User/useUser";
import { useDispatch } from "react-redux";
import { findAllChangedFiles, findItemByPath, setChanged } from "./redux/projectSlice";

type UseCollabProps = {
  currentProject?: ProjectState;
  hasContentChanged: boolean;
  openFilePath: string | null;
  items: ProjectFile[];
};

export default function useCollab({ currentProject, hasContentChanged, openFilePath, items }: UseCollabProps) {
  const { user } = useUser();
  const dispatch = useDispatch();

  const [changedFiles, setChangedFiles] = useState<(number | undefined)[]>([]);
  const [isCollab, setIsCollab] = useState(Boolean(currentProject?.collaborators?.length) || false);
  const [amCreator, setAmCreator] = useState(currentProject?.creator === user?.id || false);
  const [checkTimer, setCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const [lockedFilePaths, setLockedFilePaths] = useState<string[]>([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasContentChanged, openFilePath, dispatch]);

  useEffect(() => {
    if (isCollab) {
      const AuthStr = 'Bearer ' + user.token;
      const postUrl = `${process.env.REACT_APP_API_URL}/user/editing`;
      const payload = { fileIds: changedFiles, projectId: currentProject?.id };
      const headers = { headers: { Authorization: AuthStr } };

      axios.post(postUrl, payload, headers)
        .then(() => {
          // console.log('editing response', response);
        })
        .catch((error) => {
          console.log('editing error', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changedFiles]);

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
  }, [isCollab, currentProject?.id, user?.id]);

  useEffect(() => {
    if (currentProject?.id) {
      setIsCollab(Boolean(currentProject.collaborators?.length));
      setAmCreator(currentProject.creator === user?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id]);

  useEffect(() => {

  }, [lockedFilePaths]);

  return { changedFiles, setChangedFiles, isCollab, setIsCollab, amCreator, setAmCreator, lockedFilePaths };
};