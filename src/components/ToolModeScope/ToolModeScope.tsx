"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { getSettings, subscribeToSettings } from "@/lib/settings";
import { getToolMode, setToolMode, type ToolMode } from "@/lib/tool-mode";
import { STORAGE_EVENTS } from "@/lib/storage-keys";
import styles from "./ToolModeScope.module.scss";

interface ToolModeContextValue {
  mode: ToolMode;
  setMode: (mode: ToolMode) => void;
}

const ToolModeContext = createContext<ToolModeContextValue | null>(null);

export function useToolMode(): ToolModeContextValue | null {
  return useContext(ToolModeContext);
}

export default function ToolModeScope({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const toolId = pathname.startsWith("/tools/")
    ? pathname.replace(/^\/tools\//, "").replace(/\/$/, "")
    : "";
  const [mode, setModeState] = useState<ToolMode>("easy");

  useEffect(() => {
    if (!toolId) return;
    setModeState(getSettings().persist ? getToolMode(toolId) : "easy");
  }, [toolId]);

  useEffect(() => {
    if (!toolId) return;
    const refresh = () => setModeState(getToolMode(toolId));
    window.addEventListener(STORAGE_EVENTS.toolModes, refresh);
    window.addEventListener("storage", refresh);
    const unsubscribe = subscribeToSettings(refresh);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.toolModes, refresh);
      window.removeEventListener("storage", refresh);
      unsubscribe();
    };
  }, [toolId]);

  const setMode = useCallback(
    (next: ToolMode) => {
      setModeState(next);
      if (toolId) setToolMode(toolId, next);
    },
    [toolId],
  );

  return (
    <ToolModeContext.Provider value={{ mode, setMode }}>
      <div className={styles.scope} data-tool-mode={mode}>
        {children}
      </div>
    </ToolModeContext.Provider>
  );
}
