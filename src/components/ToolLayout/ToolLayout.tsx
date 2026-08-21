import React from "react";
import styles from "./ToolLayout.module.scss";

/**
 * Shared page shell for tool pages. Constrains content to the container width
 * and adds vertical rhythm. All tool pages wrap their content in this.
 */
export function ToolLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.layout}>{children}</div>;
}
