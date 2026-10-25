"use client";

export type RecentKind = "tool" | "workflow";

export interface RecentEntry {
  kind: RecentKind;
  id: string;
  name: string;
  href: string;
  meta?: string;
  at: number;
}

import { getSettings } from "./settings";
import { STORAGE_EVENTS, STORAGE_KEYS } from "./storage-keys";

const RECENT_KEY = STORAGE_KEYS.recent;
const RECENT_EVENT = STORAGE_EVENTS.recent;
const MAX_RECENT = 6;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getRecent(): RecentEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is RecentEntry =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as RecentEntry).kind === "string" &&
        typeof (item as RecentEntry).id === "string" &&
        typeof (item as RecentEntry).name === "string" &&
        typeof (item as RecentEntry).href === "string",
    );
  } catch {
    return [];
  }
}

export function recordRecent(entry: Omit<RecentEntry, "at">): void {
  if (!isBrowser() || !getSettings().persist) return;
  try {
    const next: RecentEntry[] = [
      { ...entry, at: Date.now() },
      ...getRecent().filter(
        (item) => !(item.kind === entry.kind && item.id === entry.id),
      ),
    ].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    // Storage can be unavailable in private modes. Recents are optional.
  }
}

export function clearRecent(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(RECENT_KEY);
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    // Ignore storage failures.
  }
}

export function subscribeToRecent(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => onChange();
  window.addEventListener(RECENT_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(RECENT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
