import React from "react";
import ToolModeScope from "@/components/ToolModeScope/ToolModeScope";
import ToolSettings from "@/components/ToolSettings/ToolSettings";
import { FilePreviewProvider } from "@/components/FilePreview/FilePreviewContext";
import FilePreviewWorkspace from "@/components/FilePreview/FilePreviewWorkspace";
import FilePreviewRail from "@/components/FilePreview/FilePreviewRail";
import styles from "./ToolLayout.module.scss";

/**
 * Shared page shell for tool pages. Constrains the working column and supplies
 * the baseline styling every tool's controls inherit. While a file is selected,
 * the work area splits and a sticky preview rail appears beside it.
 */
export function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout} data-tool-layout>
      <ToolModeScope>
        <ToolSettings />
        <FilePreviewProvider>
          <FilePreviewWorkspace>
            <div className={styles.main}>{children}</div>
            <FilePreviewRail />
          </FilePreviewWorkspace>
        </FilePreviewProvider>
      </ToolModeScope>
    </div>
  );
}
