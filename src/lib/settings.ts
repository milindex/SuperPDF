"use client";

import { STORAGE_EVENTS, STORAGE_KEYS } from "./storage-keys";

export interface SiteSettings {
  persist: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = { persist: true };

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSettings(): SiteSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return { persist: parsed.persist !== false };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setSettings(patch: Partial<SiteSettings>): SiteSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  const next = { ...getSettings(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
    window.dispatchEvent(new Event(STORAGE_EVENTS.settings));
  } catch {
    // Settings are optional.
  }
  return next;
}

export function subscribeToSettings(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => onChange();
  window.addEventListener(STORAGE_EVENTS.settings, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORAGE_EVENTS.settings, handler);
    window.removeEventListener("storage", handler);
  };
}

export interface SavedDataSummary {
  recent: number;
  workflows: number;
  tools: number;
  modes: number;
  draft: boolean;
}

export function getSavedDataSummary(): SavedDataSummary {
  if (!isBrowser()) {
    return { recent: 0, workflows: 0, tools: 0, modes: 0, draft: false };
  }
  const count = (key: string): number => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };
  const tools = (() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.toolSettings);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
    } catch {
      return 0;
    }
  })();
  const modes = (() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.toolModes);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
    } catch {
      return 0;
    }
  })();
  return {
    recent: count(STORAGE_KEYS.recent),
    workflows: count(STORAGE_KEYS.workflows),
    tools,
    modes,
    draft: Boolean(window.localStorage.getItem(STORAGE_KEYS.workflowDraft)),
  };
}

/**
 * Removes saved tool options, recents, workflows, and the workflow draft.
 * Files are never stored, so there is nothing else to remove.
 */
export function clearUserData(keepSettings = false): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.recent);
    window.localStorage.removeItem(STORAGE_KEYS.workflows);
    window.localStorage.removeItem(STORAGE_KEYS.workflowDraft);
    window.localStorage.removeItem(STORAGE_KEYS.toolSettings);
    window.localStorage.removeItem(STORAGE_KEYS.toolModes);
    if (!keepSettings) {
      window.localStorage.removeItem(STORAGE_KEYS.settings);
    }
    window.dispatchEvent(new Event(STORAGE_EVENTS.recent));
    window.dispatchEvent(new Event(STORAGE_EVENTS.workflows));
    window.dispatchEvent(new Event(STORAGE_EVENTS.toolSettings));
    window.dispatchEvent(new Event(STORAGE_EVENTS.toolModes));
    window.dispatchEvent(new Event(STORAGE_EVENTS.settings));
  } catch {
    // Ignore storage failures.
  }
}

export function setPersistence(enabled: boolean): void {
  if (!enabled) {
    clearUserData(true);
  }
  setSettings({ persist: enabled });
}

export function resetAllData(): void {
  clearUserData(false);
  setSettings(DEFAULT_SETTINGS);
}
