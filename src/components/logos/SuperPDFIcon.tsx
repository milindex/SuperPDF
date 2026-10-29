"use client";

import { useId } from "react";
import styles from "./SuperPDFIcon.module.scss";

const SHIELD =
  "M256 30 L476 86 L446 296 C422 382 342 440 256 488 C170 440 90 382 66 296 L36 86 Z";
const S_PATH =
  "M336 152 C312 122 266 116 226 134 C184 153 174 196 208 220 C242 244 308 236 336 264 C364 292 350 338 306 356 C264 374 212 360 184 328";

/**
 * SuperPDF mark: an original shield monogram in the brand crimson.
 *
 * The shield outline and S draw themselves in on first paint; a soft shine
 * crosses the mark every few seconds. Everything is CSS-driven and disabled
 * under `prefers-reduced-motion`.
 */
export default function SuperPDFIcon({
  style,
  className,
  title,
}: {
  style?: React.CSSProperties;
  className?: string;
  title?: string;
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const shieldId = `shield-${uid}`;
  const shineId = `shine-${uid}`;
  const clipId = `clip-${uid}`;
  const decorative = title === "";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      style={style}
      className={`${styles.logo} ${className ?? ""}`}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : (title ?? "SuperPDF")}
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id={shieldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e11b42" />
          <stop offset="0.55" stopColor="#b01030" />
          <stop offset="1" stopColor="#dc143c" />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={SHIELD} />
        </clipPath>
      </defs>

      <g className={styles.mark}>
        <path
          d={SHIELD}
          fill={`url(#${shieldId})`}
          className={styles.shieldFill}
        />
        <path
          d={SHIELD}
          fill="none"
          stroke="#f2f1ee"
          strokeWidth="12"
          strokeOpacity="0.92"
          strokeLinejoin="round"
          pathLength={1}
          className={styles.outline}
        />
        <g clipPath={`url(#${clipId})`}>
          <path
            d={S_PATH}
            fill="none"
            stroke="#f2f1ee"
            strokeWidth="42"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className={styles.s}
          />
          <rect
            x="-150"
            y="0"
            width="150"
            height="512"
            fill={`url(#${shineId})`}
            className={styles.shine}
          />
        </g>
      </g>
    </svg>
  );
}
