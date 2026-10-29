"use client";

import { useEffect, useState } from "react";
import { SITE_URL } from "@/lib/seo";
import styles from "./ShareRow.module.scss";

export default function ShareRow({ title }: { title: string }) {
  const [url, setUrl] = useState(SITE_URL);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href.split("#")[0]);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className={styles.row}>
      <span className={`hud-label ${styles.label}`}>Share</span>
      <button type="button" className={styles.item} onClick={copy}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="8" y="8" width="14" height="14" />
          <path d="M4 16V4h12" />
        </svg>
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
      <a
        className={styles.item}
        href={`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className={styles.item}
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Reddit
      </a>
      <a
        className={styles.item}
        href={`https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Bluesky
      </a>
      <a
        className={styles.item}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
    </div>
  );
}
