import React from "react";
import ToolModeScope from "@/components/ToolModeScope/ToolModeScope";
import ToolSettings from "@/components/ToolSettings/ToolSettings";
import styles from "./ToolLayout.module.scss";

/**
 * Shared page shell for tool pages. Constrains the working column and supplies
 * the baseline styling every tool's controls inherit.
 */
export function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout} data-tool-layout>
      <ToolModeScope>
        <ToolSettings />
        {children}
      </ToolModeScope>
    </div>
  );
}
