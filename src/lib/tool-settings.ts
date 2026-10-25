"use client";

import { getSettings } from "./settings";
import { STORAGE_EVENTS, STORAGE_KEYS } from "./storage-keys";

export type ToolSettingsMap = Record<string, string | boolean>;

type ToolSettingsStore = Record<string, ToolSettingsMap>;

function readStore(): ToolSettingsStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.toolSettings);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ToolSettingsStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getToolSettings(toolId: string): ToolSettingsMap {
  return readStore()[toolId] ?? {};
}

export function saveToolSettings(
  toolId: string,
  values: ToolSettingsMap,
): void {
  if (typeof window === "undefined" || !getSettings().persist) return;
  try {
    const store = readStore();
    if (Object.keys(values).length === 0) {
      delete store[toolId];
    } else {
      store[toolId] = values;
    }
    window.localStorage.setItem(
      STORAGE_KEYS.toolSettings,
      JSON.stringify(store),
    );
    window.dispatchEvent(new Event(STORAGE_EVENTS.toolSettings));
  } catch {
    // Settings are optional.
  }
}

export function clearToolSettings(toolId: string): void {
  saveToolSettings(toolId, {});
}
