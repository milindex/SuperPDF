"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { AnalyticsData } from "@/hooks/usePresence";
import { usePresence } from "@/hooks/usePresence";
import {
  analyticsConfigured,
  getVisitCount,
  getVisitorId,
  incrementVisitCount,
  isReturningVisitor,
} from "@/lib/analytics";
import { countryName, isKnownCountry } from "@/lib/analytics/countries";
import styles from "./page.module.scss";

const EMPTY_DATA: AnalyticsData = {
  visitors: {
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    totalVisits: 0,
    returningPct: 0,
    onlineNow: 0,
    onlineByDevice: [],
  },
  reach: {
    countries: 0,
    topCountry: "—",
    latestCountry: "—",
    countriesList: [],
    browsers: [],
    operatingSystems: [],
    devices: [],
  },
  reading: {
    totalPageViews: 0,
    avgPagesPerVisit: 0,
    topPages: [],
    topTools: [],
  },
  recent: [],
  lastActivity: null,
  trends: { weekly: [], monthly: [] },
};

const TAGLINE = [
  "No cookies",
  "No IP storage",
  "No fingerprinting",
  "Anonymous",
];

const format = (value: number | undefined) =>
  typeof value === "number" ? value.toLocaleString() : "—";

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className={styles.stat}>
      <span className={`${styles.statValue} ${accent ? styles.accent : ""}`}>
        {value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function HeroCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.heroCell}>
      <span className={styles.heroValue}>{value}</span>
      <span className={`hud-label ${styles.heroLabel}`}>{label}</span>
    </div>
  );
}

function CountryBadge({ code }: { code: string }) {
  if (!isKnownCountry(code)) return null;
  return <span className={styles.countryBadge}>{code}</span>;
}

function CombinedCell({ item }: { item?: { name: string; value: number } }) {
  if (!item) {
    return <span className={styles.combinedEmpty}>—</span>;
  }
  return (
    <span className={styles.combinedCell}>
      <span className={styles.combinedName}>{item.name}</span>
      <span className={styles.combinedValue}>{item.value}</span>
    </span>
  );
}

function BarList({
  title,
  items,
  empty = "No data yet",
}: {
  title: string;
  items: { name: string; value: number }[];
  empty?: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div>
      <h3 className={`hud-label ${styles.listTitle}`}>{title}</h3>
      {items.length > 0 ? (
        <ul className={styles.barList}>
          {items.map((item) => (
            <li key={item.name} className={styles.barItem}>
              <span className={styles.barTop}>
                <span className={styles.barName}>{item.name}</span>
                <span className={styles.barValue}>
                  {item.value.toLocaleString()}
                </span>
              </span>
              <span className={styles.barTrack} aria-hidden="true">
                <span
                  className={styles.barFill}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{empty}</p>
      )}
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  if (data.length === 0) {
    return <p className={styles.empty}>No data yet</p>;
  }

  return (
    <div
      className={styles.sparkline}
      role="img"
      aria-label={`Trend over ${data.length} days, ${data
        .reduce((sum, item) => sum + item.value, 0)
        .toLocaleString()} page views`}
    >
      {data.map((item, index) => (
        <span
          key={`${item.date}-${index}`}
          className={styles.sparkBar}
          style={{ height: `${Math.max((item.value / max) * 100, 3)}%` }}
          title={`${item.date}: ${item.value}`}
        />
      ))}
    </div>
  );
}

function formatAgo(minutes: number) {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AnalyticsPage() {
  const { data, loading, refresh } = usePresence();
  const [refreshing, setRefreshing] = useState(false);
  const [visit, setVisit] = useState({ first: true, count: 1, id: "" });
  const recorded = useRef(false);

  useEffect(() => {
    setVisit({
      first: !isReturningVisitor(),
      count: getVisitCount(),
      id: getVisitorId(),
    });
    if (!recorded.current) {
      recorded.current = true;
      incrementVisitCount();
    }
  }, []);

  const d = data ?? EMPTY_DATA;
  const countries = (d.reach.countriesList ?? []).filter((country) =>
    isKnownCountry(country.name)
  );
  const combinedRows = Math.max(
    d.reach.browsers.length,
    d.reach.operatingSystems.length,
    d.reach.devices.length,
    1
  );
  const unavailable = analyticsConfigured && !data && !loading;

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
    window.setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Analytics</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={`hud-label ${styles.eyebrow}`}>
              <span aria-hidden="true" className={styles.eyebrowMark} />
              Telemetry / live
            </p>
            <h1 className={styles.heroTitle}>Analytics</h1>
            <p className={styles.heroLede}>
              Privacy-first, real-time traffic for SuperPDF. No cookies, no IP
              storage and no fingerprinting — just anonymous counts tied to a
              random ID in this browser.
            </p>
            <ul className={styles.tags}>
              {TAGLINE.map((item) => (
                <li key={item} className={styles.tag}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.heroActions}>
            <span className={`hud-label ${styles.live}`}>
              <span aria-hidden="true" className={styles.liveDot} />
              {loading && analyticsConfigured ? "Syncing" : "Live"}
            </span>
            <button
              type="button"
              className={styles.refresh}
              onClick={handleRefresh}
              disabled={refreshing || !analyticsConfigured}
            >
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={refreshing ? styles.spin : undefined}
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              Refresh
            </button>
          </div>
        </header>

        {!analyticsConfigured && (
          <p className={styles.notice}>
            <strong>Analytics is not connected.</strong> Set{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> (or the explicit track and
            analytics URLs) at build time, then deploy the{" "}
            <code>superpdf-track</code> and <code>superpdf-analytics</code>{" "}
            functions. See <code>docs/ANALYTICS.md</code>.
          </p>
        )}

        {unavailable && (
          <p className={styles.notice}>
            <strong>Unable to load analytics.</strong> Check the function URLs,
            CORS origins and the <code>superpdf_*</code> tables.
          </p>
        )}

        <div className={styles.heroGrid}>
          <HeroCell
            label="Visitors"
            value={loading && !data ? "—" : d.visitors.total.toLocaleString()}
          />
          <HeroCell
            label="Page views"
            value={
              loading && !data ? "—" : d.reading.totalPageViews.toLocaleString()
            }
          />
          <HeroCell
            label="Online now"
            value={loading && !data ? "—" : d.visitors.onlineNow}
          />
        </div>

        <div className={styles.visitStrip} aria-live="polite">
          <span aria-hidden="true" className={styles.visitDot} />
          <span suppressHydrationWarning>
            {visit.first
              ? "First time here — welcome."
              : `Returning visitor, visit #${visit.count}.`}
          </span>
          <span className={styles.visitNote}>
            Anonymous page views only
          </span>
        </div>

        <section className={styles.section} aria-labelledby="audience-title">
          <div className={styles.sectionHead}>
            <h2 id="audience-title" className={`hud-label ${styles.sectionTitle}`}>
              <span aria-hidden="true" className={styles.sectionMark} />
              Audience
            </h2>
            <p className={styles.sectionDesc}>
              Anonymous visitor counts, all-time and recent.
            </p>
          </div>
          <div className={styles.statsGrid}>
            <Stat
              accent
              label="Total visitors"
              value={d.visitors.total.toLocaleString()}
            />
            <Stat label="This month" value={format(d.visitors.month)} />
            <Stat label="This week" value={format(d.visitors.week)} />
            <Stat label="Today" value={format(d.visitors.today)} />
            <Stat
              label="Total visits"
              value={d.visitors.totalVisits.toLocaleString()}
            />
            <Stat label="Returning" value={`${d.visitors.returningPct}%`} />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="reach-title">
          <div className={styles.sectionHead}>
            <h2 id="reach-title" className={`hud-label ${styles.sectionTitle}`}>
              <span aria-hidden="true" className={styles.sectionMark} />
              Reach
            </h2>
            <p className={styles.sectionDesc}>
              Country comes from the Cloudflare edge header, never from an IP
              lookup.
            </p>
          </div>

          <div className={styles.split}>
            <div className={styles.panel}>
              <div className={styles.statsGridInner}>
                <Stat label="Countries" value={format(d.reach.countries)} />
                <Stat
                  label="Top country"
                  value={
                    isKnownCountry(d.reach.topCountry)
                      ? countryName(d.reach.topCountry)
                      : "—"
                  }
                />
              </div>

              {countries.length > 0 ? (
                <ul className={styles.countryList}>
                  {countries.map((country) => (
                    <li key={country.name} className={styles.countryItem}>
                      <CountryBadge code={country.name} />
                      <span className={styles.countryName}>
                        {countryName(country.name)}
                      </span>
                      <span className={styles.countryCount}>
                        {country.value.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>
                  No country data yet. It will populate from production traffic
                  via Cloudflare headers.
                </p>
              )}

              {(d.reach.unknown ?? 0) > 0 && (
                <p className={styles.unknownNote}>
                  {d.reach.unknown?.toLocaleString()} visitor
                  {d.reach.unknown === 1 ? "" : "s"} had no country data and are
                  included in the totals.
                </p>
              )}
            </div>

            <div className={styles.panel}>
              <h3 className={`hud-label ${styles.listTitle}`}>
                Browser / OS / device
              </h3>
              <div className={styles.combinedTable}>
                <div className={styles.combinedHead} aria-hidden="true">
                  <span>Browser</span>
                  <span>OS</span>
                  <span>Device</span>
                </div>
                {Array.from({ length: combinedRows }).map((_, index) => (
                  <div className={styles.combinedRow} key={index}>
                    <CombinedCell item={d.reach.browsers[index]} />
                    <CombinedCell item={d.reach.operatingSystems[index]} />
                    <CombinedCell item={d.reach.devices[index]} />
                  </div>
                ))}
              </div>

              {d.visitors.onlineByDevice.length > 0 && (
                <div className={styles.onlineDevices}>
                  {d.visitors.onlineByDevice.map((device) => (
                    <span key={device.name} className={styles.onlineDevice}>
                      {device.name} · {device.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="content-title">
          <div className={styles.sectionHead}>
            <h2 id="content-title" className={`hud-label ${styles.sectionTitle}`}>
              <span aria-hidden="true" className={styles.sectionMark} />
              Content
            </h2>
            <p className={styles.sectionDesc}>
              What people open and which tools get used.
            </p>
          </div>

          <div className={`${styles.statsGrid} ${styles.statsGridFour}`}>
            <Stat
              label="Page views"
              value={d.reading.totalPageViews.toLocaleString()}
            />
            <Stat label="Average per visit" value={format(d.reading.avgPagesPerVisit)} />
            <Stat label="Tools reached" value={d.reading.topTools.length} />
            <Stat label="Pages reached" value={d.reading.topPages.length} />
          </div>

          <div className={styles.bars}>
            <BarList title="Top pages" items={d.reading.topPages} />
            <BarList title="Top tools" items={d.reading.topTools} />
          </div>
        </section>

        <div className={styles.split}>
          <section
            className={`${styles.section} ${styles.sectionFlush}`}
            aria-labelledby="recent-title"
          >
            <div className={styles.sectionHead}>
              <h2
                id="recent-title"
                className={`hud-label ${styles.sectionTitle}`}
              >
                <span aria-hidden="true" className={styles.sectionMark} />
                Recent activity
              </h2>
            </div>
            <div className={styles.panel}>
              {d.recent.length > 0 ? (
                <ul className={styles.recentList}>
                  {d.recent.map((visitor, index) => (
                    <li
                      key={`${visitor.visitorId}-${index}`}
                      className={styles.recentItem}
                    >
                      <span
                        aria-hidden="true"
                        className={
                          visitor.online
                            ? styles.recentLive
                            : styles.recentIdle
                        }
                      />
                      <CountryBadge code={visitor.country} />
                      <span className={styles.recentDetail}>
                        {visitor.browser}, {visitor.os}
                      </span>
                      {visit.id && visitor.visitorId === visit.id && (
                        <span className={styles.youBadge}>You</span>
                      )}
                      <span className={styles.recentTime}>
                        {formatAgo(visitor.ago)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>No visitors yet.</p>
              )}
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.sectionFlush}`}
            aria-labelledby="trends-title"
          >
            <div className={styles.sectionHead}>
              <h2
                id="trends-title"
                className={`hud-label ${styles.sectionTitle}`}
              >
                <span aria-hidden="true" className={styles.sectionMark} />
                Trends
              </h2>
            </div>
            <div className={styles.panel}>
              <div className={styles.trendGrid}>
                <div>
                  <h3 className={`hud-label ${styles.listTitle}`}>
                    Last 7 days
                  </h3>
                  <Sparkline data={d.trends.weekly} />
                </div>
                <div>
                  <h3 className={`hud-label ${styles.listTitle}`}>
                    Last 30 days
                  </h3>
                  <Sparkline data={d.trends.monthly} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className={styles.pageFooter}>
          <ul className={styles.tags}>
            {[
              "Next.js 16",
              "Supabase",
              "Edge Functions",
              "Postgres",
              "Polling 30s",
              "Privacy-first",
            ].map((item) => (
              <li key={item} className={styles.tag}>
                {item}
              </li>
            ))}
          </ul>
          <p className={styles.footNote}>
            Custom analytics built for SuperPDF. No third-party trackers, no
            cookies and no PII. This page is intentionally excluded from search
            engines.{" "}
            <Link href="/privacy">Read the privacy policy</Link>.
          </p>
        </footer>
      </div>
    </div>
  );
}
