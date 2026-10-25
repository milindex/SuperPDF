import React from "react";
import Icon from "@/components/Icon/Icon";
import styles from "./SuccessBanner.module.scss";

export interface SuccessBannerProps {
  url: string;
  fileName: string;
  downloadText?: string;
  successText?: string;
}

/**
 * Success banner shown after a tool completes processing. Provides a download
 * link for the produced file.
 */
export function SuccessBanner({
  url,
  fileName,
  downloadText = "Download PDF",
  successText = "Your document is ready to download.",
}: SuccessBannerProps) {
  return (
    <section className={styles.banner} aria-live="polite">
      <div className={styles.copy}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="check" size={18} />
        </span>
        <div>
          <h2 className={styles.heading}>Success!</h2>
          <p className={styles.message}>{successText}</p>
          <p className={styles.fileName}>{fileName}</p>
        </div>
      </div>
      <a href={url} download={fileName} className={styles.download}>
        {downloadText}
      </a>
    </section>
  );
}
