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
  const context = useContext(ToolModeContext);
  const pathname = usePathname();
  const [domMode, setDomMode] = useState<ToolMode | null>(null);

  /*
   * Tool pages call this hook in the same component that renders
   * <ToolLayout>, so they sit above the provider and cannot read its context.
   * The scope element exposes the live value as `data-tool-mode`; mirror it
   * for those callers. Components rendered inside the provider (ToolHeader)
   * still get the context directly.
   */
  useEffect(() => {
    if (context || typeof document === "undefined") return;
    const scope = document.querySelector<HTMLElement>("[data-tool-mode]");
    if (!scope) return;
    const read = () => {
      setDomMode(scope.dataset.toolMode === "advanced" ? "advanced" : "easy");
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(scope, {
      attributes: true,
      attributeFilter: ["data-tool-mode"],
    });
    return () => observer.disconnect();
  }, [context]);

  if (context) return context;
  if (!domMode) return null;

  return {
    mode: domMode,
    setMode: (next) => {
      const toolId = pathname.startsWith("/tools/")
        ? pathname.replace(/^\/tools\//, "").replace(/\/$/, "")
        : "";
      if (toolId) setToolMode(toolId, next);
    },
  };
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
