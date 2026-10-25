"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toolsRegistry } from "@/registry/tools";
import { useToolMode } from "@/components/ToolModeScope/ToolModeScope";
import styles from "./ToolHeader.module.scss";

export interface ToolHeaderProps {
  title: string;
  description: string;
  notice?: React.ReactNode;
}

/**
 * Title block for a tool page: breadcrumb, headline, one-sentence description,
 * and an optional notice for a destructive or lossy behaviour.
 */
export function ToolHeader({ title, description, notice }: ToolHeaderProps) {
  const pathname = usePathname();
  const tool = toolsRegistry.find(
    (entry) => `/tools/${entry.slug}` === pathname,
  );
  const mode = useToolMode();

  return (
    <header className={styles.header}>
      <nav className={styles.crumb} aria-label="Breadcrumb">
        <Link href="/tools">All tools</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {tool?.wip && <span className={styles.wip}>WIP</span>}
      </div>
      <p className={styles.description}>{description}</p>
      {tool?.wipNote && <p className={styles.wipNote}>{tool.wipNote}</p>}

      {mode && tool?.hasAdvanced && (
        <div className={styles.modeBar}>
          <span className={styles.modeLabel}>Control level</span>
          <div
            className={styles.modeSwitch}
            role="group"
            aria-label="Control level"
          >
            <button
              type="button"
              aria-pressed={mode.mode === "easy"}
              onClick={() => mode.setMode("easy")}
            >
              Easy
            </button>
            <button
              type="button"
              aria-pressed={mode.mode === "advanced"}
              onClick={() => mode.setMode("advanced")}
            >
              Advanced
            </button>
          </div>
          <span className={styles.modeHint}>
            {mode.mode === "easy"
              ? "Recommended settings. Advanced shows every control."
              : "Every control is shown."}
          </span>
        </div>
      )}

      {notice && <div className={styles.notice}>{notice}</div>}
    </header>
  );
}
