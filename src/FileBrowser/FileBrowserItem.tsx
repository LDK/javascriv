// Browser/FileBrowserItem.tsx
import { Dispatch, KeyboardEventHandler, SetStateAction, useCallback, useEffect, useRef } from "react";
import { SxProps, Box, PaletteMode, ListItem, ListItemIcon, ListItemText, Collapse, List, useTheme } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { BrowserItem, setName, setOpenFilePath } from "../redux/filesSlice";
import { ExtendedPalette } from "../theme/theme";

import { Folder, Description as DocIcon, Image as ImageIcon, ExpandMore, ExpandLess, InsertDriveFile } from '@mui/icons-material';
import ItemActionBar from "./ItemActionBar";
import { SetOpenFunction } from "./useBrowserDialog";

type FileBrowserItemProps = {
  item: BrowserItem;
  level?: number;
  path?: string[];
  openFilePath: string | null;
  onDocumentClick: (documentContent: string | null, changed: boolean) => void;
  onFolderClick: (folder: BrowserItem) => void;
  setOpenFolder: Dispatch<SetStateAction<string | null>>;
  setDuplicating: SetOpenFunction;
  setDeleting: SetOpenFunction;
  setMoving: SetOpenFunction;
  openFolder: string | null;
};

const FileBrowserItem: React.FC<FileBrowserItemProps> = ({item, level = 0, path = [], onDocumentClick, onFolderClick, openFilePath, setOpenFolder, setMoving, openFolder, setDuplicating, setDeleting }) => {

  const isFolder = item.type === 'folder';
  const fullPath = [...path, item.name].join('/');
  const [open, setOpen] = useState<boolean>(Boolean(isFolder && openFilePath && openFilePath.startsWith(fullPath)));

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
        dispatch(setOpenFilePath(fullPath));
  
        if (item.content && onDocumentClick)  {
          onDocumentClick(item.content || null, item.changed || false);
        }
      }
    } else if (item.subType === 'image') {
      if (item.content) {
        onDocumentClick(null, true);
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

  const handleItemRename = () => {
    // Call your renaming function here
    const newName = renameInputRef.current?.value || item.name;
    dispatch(setName({ path: item.path, newName: newName }));
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
            {...{ item }}
            onEditClick={handleEditClick}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onMoveTo={handleMoving}
          />
        </Box>
      </ListItem>


      {isFolder && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child: BrowserItem, index: number) => (
              <FileBrowserItem {...{ openFolder, setDuplicating, setDeleting, setMoving, setOpenFolder, openFilePath, onDocumentClick, onFolderClick }} key={index} item={child} level={level + 1} path={[...path, item.name]} />
            ))}
          </List>
        </Collapse>
      )}

    </>
  );
};

export default FileBrowserItem;