// Browser/FileBrowserItem.tsx
import { Dispatch, KeyboardEventHandler, SetStateAction, useCallback, useEffect, useRef } from "react";
import { SxProps, Box, PaletteMode, ListItem, ListItemIcon, ListItemText, Collapse, List, useTheme } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { reorderItem, setName, setOpenFilePath, selectOpenFilePath } from "../redux/projectSlice";
import { ExtendedPalette } from "../theme/theme";

import { Folder, Description as DocIcon, Image as ImageIcon, ExpandMore, ExpandLess, InsertDriveFile } from '@mui/icons-material';
import ItemActionBar from "./ItemActionBar";
import { SetOpenFunction } from "./useBrowserDialog";
import { ProjectFile } from "../Project/ProjectTypes";

type FileBrowserItemProps = {
  item: ProjectFile;
  level?: number;
  index: number;
  count: number;
  path?: string[];
  openFilePath: string | null;
  onDocumentClick: (item: ProjectFile) => void;
  onFolderClick: (folder: ProjectFile) => void;
  setOpenFolder: Dispatch<SetStateAction<string | null>>;
  setDuplicating: SetOpenFunction;
  setDeleting: SetOpenFunction;
  setMoving: SetOpenFunction;
  openFolder: string | null;
};

const FileBrowserItem: React.FC<FileBrowserItemProps> = ({item, level = 0, count, index, path = [], onDocumentClick, onFolderClick, openFilePath, setOpenFolder, setMoving, openFolder, setDuplicating, setDeleting }) => {
  const isFolder = item.type === 'folder';
  const fullPath = [...path, item.name].join('/');
  const [open, setOpen] = useState<boolean>(Boolean(isFolder && openFilePath && openFilePath.startsWith(fullPath)));

  const isActive = openFilePath && openFilePath.startsWith(fullPath);

  const [renaming, setRenaming] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  const theme = useTheme();
  const palette = theme.palette as ExtendedPalette;

  const getOpenCloseIcon = () => {
    if (isFolder) {
      const elProps:({ width: string; sx: SxProps; }) = { width: "100%", sx: { maxWidth: '100%'} };
      const el =  open ? <ExpandLess {...elProps} /> : <ExpandMore {...elProps} />;
      return (
        <Box width="1.25rem" top={'7px'} position="relative" display="inline-block" color={palette.secondary.contrastText}>
          { el }
        </Box>
      );
    }
    return null;
  };
  
  const handleItemClick = () => {
    if (isFolder) {
      setOpen(!open);
      onFolderClick(item);
    } else if (item.subType === 'document') {
      if (fullPath !== openFilePath) {
        if (onDocumentClick) {
          onDocumentClick(item);
        }
      }
    } else if (item.subType === 'image') {
      if (item.content) {
        onDocumentClick(item);
      }
    }
  };  

  const handleEditClick = useCallback(() => {
    setRenaming(true);
  }, [setRenaming]);

  const handleDuplicate = useCallback(() => {
    setDuplicating(item || false);
  }, [item, setDuplicating]);

  const handleDelete = useCallback(() => {
    setDeleting(item || false);
  }, [item, setDeleting]);

  const handleMoving = useCallback(() => {
    setMoving(item || false);
  }, [item, setMoving]);

  const handleMoveUp = useCallback(() => {
    dispatch(reorderItem({ path: item.path, oldIndex: index, newIndex: index - 1 }));
  }, [item, index, dispatch]);

  const handleMoveDown = useCallback(() => {
    dispatch(reorderItem({ path: item.path, oldIndex: index, newIndex: index + 1 }));
  }, [item, index, dispatch]);


  const handleItemRename = () => {
    // Call your renaming function here
    const newName = renameInputRef.current?.value || item.name;
    dispatch(setName({ path: item.path, newName: newName }));

    if (newName !== item.name && item.path === openFilePath) {
      dispatch(setOpenFilePath(item.path.split('/').slice(0, -1).concat(newName).join('/')));
    }

    setRenaming(false);
  };

  const handleRenameBlur = () => {
    handleItemRename();
  };

  const handleRenameKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      handleItemRename();
    }
  };

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renaming]);

  const getIcon = () => {
    if (isFolder) return <Folder />;
    if (item.subType === 'document') return <DocIcon />;
    if (item.subType === 'image') return <ImageIcon />;
    return <InsertDriveFile color="inherit" />;
  };

  const opposite:PaletteMode = palette.mode === 'light' ? 'dark' : 'light';

  const isOpenPath = fullPath === openFilePath;

  return (
    <>
      <ListItem
        button
        onClick={handleItemClick}
        style={{
          color: palette.secondary.contrastText,
          paddingLeft: level * 16,
          backgroundColor: isOpenPath ? palette.secondary[opposite] : 'inherit',
          display: "flex",
        }}
        sx={{
          "&:hover > div > .MuiBox-root": {
            visibility: "visible",
          },
        }}
      >
        <ListItemIcon sx={{ color: palette.secondary.contrastText, pl: 3 }}>{getIcon()}</ListItemIcon>

        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <ListItemText
            primary={
              renaming ? (
                <input
                  ref={renameInputRef}
                  defaultValue={item.name}
                  onBlur={handleRenameBlur}
                  onKeyPress={handleRenameKeyPress}
                  style={{ border: "none", outline: "none", background: "transparent", color: "inherit" }}
                />
              ) : (
                <>
                  {item.name}
                  {getOpenCloseIcon()}
                </>
              )
            }
            primaryTypographyProps={{
              style: { color: item.changed ? palette.warning[isOpenPath ? 'main' : opposite] : 'inherit' },
            }}
          />

          <ItemActionBar
            {...{ index, count }}
            onEditClick={handleEditClick}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onMoveTo={handleMoving}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </Box>
      </ListItem>


      {isFolder && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child: ProjectFile, index: number) => (
              <FileBrowserItem {...{ openFolder, setDuplicating, setDeleting, setMoving, setOpenFolder, openFilePath, onDocumentClick, onFolderClick, index }} key={index} item={child} level={level + 1} path={[...path, item.name]} count={item.children?.length || 0} />
            ))}
          </List>
        </Collapse>
      )}

    </>
  );
};

export default FileBrowserItem;