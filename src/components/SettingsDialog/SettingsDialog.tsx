"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearOfflineCopy,
  getOfflineCacheCount,
  offlineSupported,
  saveOfflineCopy,
} from "@/lib/offline-client";
import {
  getSavedDataSummary,
  getSettings,
  resetAllData,
  setPersistence,
  type SavedDataSummary,
} from "@/lib/settings";
import styles from "./SettingsDialog.module.scss";

const EMPTY_SUMMARY: SavedDataSummary = {
  recent: 0,
  workflows: 0,
  tools: 0,
  modes: 0,
  draft: false,
};

function summaryText(summary: SavedDataSummary): string {
  const parts = [
    `${summary.recent} recent ${summary.recent === 1 ? "item" : "items"}`,
    `${summary.workflows} ${summary.workflows === 1 ? "workflow" : "workflows"}`,
    `${summary.tools} ${summary.tools === 1 ? "tool" : "tools"} with options`,
    `${summary.modes} ${summary.modes === 1 ? "tool mode" : "tool modes"} saved`,
  ];
  if (summary.draft) parts.push("1 workflow draft");
  return parts.join(", ");
}

export default function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [persist, setPersistState] = useState(true);
  const [summary, setSummary] = useState<SavedDataSummary>(EMPTY_SUMMARY);
  const [offlineCount, setOfflineCount] = useState<number | null>(null);
  const [offlineBusy, setOfflineBusy] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setPersistState(getSettings().persist);
    setSummary(getSavedDataSummary());
    setConfirmReset(false);
    setOfflineMessage("");
    setOfflineCount(null);
    if (offlineSupported()) {
      getOfflineCacheCount()
        .then(setOfflineCount)
        .catch(() => setOfflineCount(0));
    }
    const timer = setTimeout(() => closeRef.current?.focus(), 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const summaryLine = useMemo(() => summaryText(summary), [summary]);

  if (!open) return null;

  const togglePersistence = () => {
    const next = !persist;
    setPersistence(next);
    setPersistState(next);
    setSummary(getSavedDataSummary());
  };

  const saveOffline = async () => {
    if (!offlineSupported()) {
      setOfflineMessage("This browser does not support offline storage.");
      return;
    }
    setOfflineBusy(true);
    setOfflineMessage("");
    try {
      const total = await saveOfflineCopy();
      setOfflineCount(total);
      setOfflineMessage(
        total > 0
          ? "Offline copy ready. The pages and tool code are stored in this browser."
          : "Nothing could be saved. Check your connection and try again.",
      );
    } catch (error) {
      setOfflineMessage(
        error instanceof Error ? error.message : "Could not save the offline copy.",
      );
    } finally {
      setOfflineBusy(false);
    }
  };

  const removeOffline = async () => {
    setOfflineBusy(true);
    setOfflineMessage("");
    try {
      await clearOfflineCopy();
      setOfflineCount(0);
      setOfflineMessage("The offline copy was removed.");
    } catch (error) {
      setOfflineMessage(
        error instanceof Error ? error.message : "Could not clear the offline copy.",
      );
    } finally {
      setOfflineBusy(false);
    }
  };

  const reset = () => {
    resetAllData();
    setPersistState(true);
    setSummary(EMPTY_SUMMARY);
    setConfirmReset(false);
    setOfflineMessage("Saved data was reset.");
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.head}>
          <div>
            <h2 id="settings-title" className={styles.title}>
              Settings
            </h2>
            <p className={styles.subtitle}>
              Saved in this browser, on this device.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label="Close settings"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <section className={styles.section}>
          <div className={styles.row}>
            <div>
              <h3 className={styles.sectionTitle}>Remember my settings</h3>
              <p className={styles.sectionBody}>
                Keep tool options, recent tools, and workflows across visits.
                Turning this off clears what is already saved.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={persist}
              aria-label="Remember my settings"
              className={`${styles.switch} ${persist ? styles.switchOn : ""}`}
              onClick={togglePersistence}
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
          <p className={styles.summary}>{summaryLine}</p>
          <div className={styles.dataActions}>
            {confirmReset ? (
              <div className={styles.confirm}>
                <p>Reset all saved options, recents, and workflows?</p>
                <button type="button" className={styles.danger} onClick={reset}>
                  Reset saved data
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setConfirmReset(true)}
              >
                Reset saved data
              </button>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Offline copy</h3>
          <p className={styles.sectionBody}>
            Store the main pages and tool code in this browser so SuperPDF opens
            without a connection. Files are still never stored.
          </p>
          <p className={styles.status}>
            {offlineCount === null
              ? "Checking the offline copy…"
              : offlineCount > 0
                ? `Offline copy saved: ${offlineCount} ${offlineCount === 1 ? "item" : "items"}.`
                : "No offline copy yet."}
          </p>
          <div className={styles.dataActions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={saveOffline}
              disabled={offlineBusy || !offlineSupported()}
            >
              {offlineBusy
                ? "Saving…"
                : offlineCount && offlineCount > 0
                  ? "Update offline copy"
                  : "Save for offline use"}
            </button>
            {offlineCount !== null && offlineCount > 0 && (
              <button
                type="button"
                className={styles.secondary}
                onClick={removeOffline}
                disabled={offlineBusy}
              >
                Clear offline copy
              </button>
            )}
          </div>
          {offlineMessage && (
            <p className={styles.message} role="status">
              {offlineMessage}
            </p>
          )}
        </section>

        <p className={styles.footer}>
          Files are never saved. Only options, recent items, and workflows are
          stored in this browser.
        </p>
      </div>
    </div>
  );
}
