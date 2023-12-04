import axios, { AxiosResponse } from "axios";
import { useState, useEffect, useReducer } from "react";
import { ProjectState } from "./Project/ProjectTypes";
import useUser from "./User/useUser";
import { useDispatch, useSelector } from "react-redux";
import { findAllChangedFiles, findItemByPath, selectFiles, setChanged } from "./redux/projectSlice";

type UseCollabProps = {
  currentProject?: ProjectState;
  hasContentChanged: boolean;
  openFilePath: string | null;
};

// Check for collab changes every 30 seconds
const collabTime = 30000;

/*
  * This hook is used to manage the collab state of the project.
  * 
  * Tracks the following:
  * - Whether the user is the creator of the project
  * - Whether the user is in a collab project
  * - Files that are locked due to other users editing them
  * - Files the user has changed and should be locked for other users
  * 
  * Implements a timer to check for changes in the locked files every {collabTime} seconds
  * 
  * return: {
  *  changedFiles: (number | undefined)[];
  *  setChangedFiles: (changedFiles: (number | undefined)[]) => void;
  *  lockedFilePaths: string[];
  *  amCreator: boolean;
  *  isCollab: boolean;
  * }
*/
export default function useCollab({ currentProject, hasContentChanged, openFilePath }: UseCollabProps) {
  const items = useSelector(selectFiles);
  const { user } = useUser();
  const dispatch = useDispatch();

  const [changedFiles, setChangedFiles] = useState<(number | undefined)[]>([]);

  const [checkTimer, setCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const [lockedFilePaths, setLockedFilePaths] = useState<string[]>([]);

  type CollabState = {
    amCreator: boolean;
    isCollab: boolean;
  };
  
  type CollabAction = 
    | { type: 'UPDATE_CREATOR'; payload: { creatorId: number; userId?: number } }
    | { type: 'UPDATE_COLLAB'; payload: { isCollab: boolean; } };

  const reducer = (state:CollabState, action:CollabAction) => {
    switch (action.type) {
      case 'UPDATE_CREATOR':
        return { ...state, amCreator: action.payload.creatorId === action.payload.userId };
      case 'UPDATE_COLLAB':
        return { ...state, isCollab: action.payload.isCollab };
      default:
        return state;
    }
  };
  
  // Using the reducer
  const [state, reducerAction] = useReducer(reducer, { amCreator: false, isCollab: false });
  const { isCollab } = state;

  useEffect(() => {
    // Dispatch an action when currentProject changes
    if (currentProject?.id && user?.id && currentProject?.creator) {
      reducerAction({ 
        type: 'UPDATE_CREATOR', 
        payload: { creatorId: currentProject.creator, userId: user.id } 
      });
    }
    // Other dependencies can be added as needed
  }, [currentProject, user]);

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
  }, [hasContentChanged, openFilePath, dispatch, isCollab, items]);

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
  }, [changedFiles, currentProject?.id, isCollab, user.token]);

  // function to compare two arrays to see if they are equal
  // used to compare the locked files from the server to the current locked files
  // the entries don't need to be in the same order
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const aSorted = a.sort();
    const bSorted = b.sort();
    for (let i = 0; i < aSorted.length; ++i) {
      if (aSorted[i] !== bSorted[i]) return false;
    }
    return true;
  };

  useEffect(() => {
    if (checkTimer) {
      clearInterval(checkTimer);
      setCheckTimer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id]);

  useEffect(() => {
    if (isCollab && currentProject?.id && user?.id && !checkTimer) {
      setCheckTimer(setInterval(() => {
        const AuthStr = 'Bearer ' + user.token;
        // time in hours minutes and seconds
        axios.get(`${process.env.REACT_APP_API_URL}/project/${currentProject.id}/locked-files`, { headers: { Authorization: AuthStr } })
        .then((response:AxiosResponse<string[]>) => {
          if (!arraysEqual(response.data, lockedFilePaths)) {
            setLockedFilePaths(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      }, collabTime));
    } else if (!isCollab || !user?.id) {
      if (checkTimer) {
        clearInterval(checkTimer);
        setCheckTimer(null);
      }
      if (lockedFilePaths.length > 0) {
        setLockedFilePaths([]);
      }
    }
  }, [isCollab, currentProject?.id, user?.id, user?.token, currentProject?.title, checkTimer, lockedFilePaths]);

  useEffect(() => {
    reducerAction({ type: 'UPDATE_COLLAB', payload: { isCollab: Boolean(user?.id && currentProject?.collaborators?.length) } });
  }, [currentProject?.id, currentProject?.collaborators, user?.id]);

  return { changedFiles, setChangedFiles, lockedFilePaths, ...state };
};