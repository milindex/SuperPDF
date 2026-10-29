"use client";

import type { ReactNode } from "react";
import { useFilePreview } from "./FilePreviewContext";
import styles from "./FilePreview.module.scss";

/** Grid wrapper that widens to two columns only while a file preview exists. */
export default function FilePreviewWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  const preview = useFilePreview();
  return (
    <div
      className={`${styles.workspace} ${
        preview?.file ? styles.workspaceWithRail : ""
      }`}
    >
      {children}
    </div>
  );
}
