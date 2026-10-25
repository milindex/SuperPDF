"use client";

import { getSettings } from "./settings";
import { STORAGE_EVENTS, STORAGE_KEYS } from "./storage-keys";

export type ToolMode = "easy" | "advanced";

type ToolModeStore = Record<string, ToolMode>;

function readStore(): ToolModeStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.toolModes);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ToolModeStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getToolMode(toolId: string): ToolMode {
  return readStore()[toolId] === "advanced" ? "advanced" : "easy";
}

export function setToolMode(toolId: string, mode: ToolMode): void {
  if (typeof window === "undefined" || !toolId) return;
  if (!getSettings().persist) return;
  try {
    const store = readStore();
    store[toolId] = mode;
    window.localStorage.setItem(
      STORAGE_KEYS.toolModes,
      JSON.stringify(store),
    );
    window.dispatchEvent(new Event(STORAGE_EVENTS.toolModes));
  } catch {
    // Modes are a convenience; the tool still works.
  }
}

export function clearToolModes(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.toolModes);
    window.dispatchEvent(new Event(STORAGE_EVENTS.toolModes));
  } catch {
    // Ignore storage failures.
  }
}
