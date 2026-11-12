"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { usePresence } from "@/hooks/usePresence";
import { analyticsConfigured } from "@/lib/analytics";
import styles from "./AnalyticsPreview.module.scss";

const format = (value: number | undefined) =>
  typeof value === "number" ? value.toLocaleString() : "—";

/**
 * Collapsible live-stats strip for the footer. Shares the 30-second poll with
 * the full dashboard through `usePresence`.
 */
export default function AnalyticsPreview() {
  const [open, setOpen] = useState(false);
  const { data, loading } = usePresence();

  const stats = useMemo(
    () => ({
      visitors: data?.visitors?.total,
      online: data?.visitors?.onlineNow,
      today: data?.visitors?.today,
      pageViews: data?.reading?.totalPageViews,
      countries: data?.reach?.countries,
      returningPct: data?.visitors?.returningPct,
    }),
    [data]
  );

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.bar}
        aria-expanded={open}
        aria-controls="analytics-preview-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={`hud-label ${styles.title}`}>
          <span
            aria-hidden="true"
            className={`${styles.dot} ${
              analyticsConfigured ? styles.dotLive : ""
            } ${loading && analyticsConfigured ? styles.dotPulse : ""}`}
          />
          Live analytics
        </span>

        <span className={styles.stats}>
          <span className={styles.stat}>
            <strong>{format(stats.visitors)}</strong> visitors
          </span>
          <span className={styles.stat}>
            <strong>{format(stats.online)}</strong> online
          </span>
          <span className={`${styles.stat} ${styles.statWide}`}>
            <strong>{format(stats.pageViews)}</strong> views
          </span>
          <span className={`${styles.stat} ${styles.statWide}`}>
            <strong>{format(stats.countries)}</strong> countries
          </span>
        </span>

        <svg
          aria-hidden="true"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        id="analytics-preview-panel"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.panelInner} inert={!open}>
          <div className={styles.panelBody}>
            <div className={styles.grid}>
              {[
                { label: "Visitors", value: format(stats.visitors) },
                { label: "Today", value: format(stats.today) },
                { label: "Page views", value: format(stats.pageViews) },
                { label: "Countries", value: format(stats.countries) },
                {
                  label: "Returning",
                  value:
                    typeof stats.returningPct === "number"
                      ? `${stats.returningPct}%`
                      : "—",
                },
                { label: "Online now", value: format(stats.online) },
              ].map((item) => (
                <div key={item.label} className={styles.card}>
                  <span className={styles.cardValue}>{item.value}</span>
                  <span className={styles.cardLabel}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.foot}>
              <span className={styles.footText}>
                {analyticsConfigured
                  ? "Anonymous. No cookies. No IP storage."
                  : "Analytics is not connected for this build."}
              </span>
              <Link href="/analytics" className={styles.footLink}>
                View the full dashboard
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M6 18 18 6" />
                  <path d="M9 6h9v9" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
