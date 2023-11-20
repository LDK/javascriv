import { useState, useEffect } from "react";

export default function useSettingsDialogs() {
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [manageProjectsOpen, setManageProjectsOpen] = useState(false);

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

  return { projectSettingsOpen, setProjectSettingsOpen, userSettingsOpen, setUserSettingsOpen, manageProjectsOpen, setManageProjectsOpen };
};
