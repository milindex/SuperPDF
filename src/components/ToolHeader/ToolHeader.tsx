import React from "react";
import styles from "./ToolHeader.module.scss";

export interface ToolHeaderProps {
  title: string;
  description: string;
  notice?: React.ReactNode;
}

/**
 * Title block for a tool page: headline, description, and an optional
 * warning/notice callout (e.g. a destructive/lossy behavior warning).
 */
export function ToolHeader({ title, description, notice }: ToolHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {notice && <div className={styles.notice}>{notice}</div>}
    </header>
  );
}
