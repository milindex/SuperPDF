import type { CSSProperties } from "react";
import SuperPDFIcon from "./SuperPDFIcon";
import styles from "./SuperPDFLogo.module.scss";

export default function SuperPDFLogo({
  height = 32,
  withIcon = true,
  className,
}: {
  height?: number;
  withIcon?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`${styles.logo} ${className ?? ""}`}
      style={{ "--logo-height": `${height}px` } as CSSProperties}
    >
      {withIcon && <SuperPDFIcon className={styles.icon} title="" />}
      <span className={styles.word}>
        Super<span className={styles.accent}>PDF</span>
      </span>
    </span>
  );
}
