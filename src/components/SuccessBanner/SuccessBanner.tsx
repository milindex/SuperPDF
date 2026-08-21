import React from "react";
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
    <div className={styles.banner}>
      <div>
        <h3 className={styles.heading}>Success!</h3>
        <p className={styles.message}>{successText}</p>
      </div>
      <a
        href={url}
        download={fileName}
        className={styles.download}
      >
        {downloadText}
      </a>
    </div>
  );
}
