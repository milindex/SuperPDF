import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage-keys";
import {
  clearUserData,
  getSavedDataSummary,
  getSettings,
  resetAllData,
  setPersistence,
  setSettings,
  subscribeToSettings,
} from "../settings";

beforeEach(() => {
  window.localStorage.clear();
});

describe("getSettings", () => {
  it("defaults to persistence on", () => {
    expect(getSettings()).toEqual({ persist: true });
  });

  it("reads a stored preference", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ persist: false }),
    );
    expect(getSettings()).toEqual({ persist: false });
  });

  it("falls back for malformed settings", () => {
    window.localStorage.setItem(STORAGE_KEYS.settings, "{oops");
    expect(getSettings()).toEqual({ persist: true });
  });
});

describe("setSettings", () => {
  it("merges the patch, persists it, and notifies listeners", () => {
    const listener = vi.fn();
    window.addEventListener(STORAGE_EVENTS.settings, listener);

    expect(setSettings({ persist: false })).toEqual({ persist: false });
    expect(getSettings()).toEqual({ persist: false });
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(STORAGE_EVENTS.settings, listener);
  });
});

describe("getSavedDataSummary", () => {
  it("counts stored records and treats malformed values as empty", () => {
    window.localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(["a", "b"]));
    window.localStorage.setItem(STORAGE_KEYS.workflows, "{broken");
    window.localStorage.setItem(
      STORAGE_KEYS.toolSettings,
      JSON.stringify({ merge: {}, split: {} }),
    );
    window.localStorage.setItem(STORAGE_KEYS.toolModes, JSON.stringify({}));
    window.localStorage.setItem(STORAGE_KEYS.workflowDraft, "{}");

    expect(getSavedDataSummary()).toEqual({
      recent: 2,
      workflows: 0,
      tools: 2,
      modes: 0,
      draft: true,
    });
  });

  it("returns zeros when nothing is stored", () => {
    expect(getSavedDataSummary()).toEqual({
      recent: 0,
      workflows: 0,
      tools: 0,
      modes: 0,
      draft: false,
    });
  });
});

describe("clearUserData", () => {
  it("removes tool data and settings by default", () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      window.localStorage.setItem(key, "[]");
    }
    const listener = vi.fn();
    window.addEventListener(STORAGE_EVENTS.recent, listener);

    clearUserData();

    for (const key of Object.values(STORAGE_KEYS)) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(listener).toHaveBeenCalled();
    window.removeEventListener(STORAGE_EVENTS.recent, listener);
  });

  it("keeps settings when asked", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ persist: false }),
    );
    window.localStorage.setItem(STORAGE_KEYS.recent, "[]");

    clearUserData(true);

    expect(window.localStorage.getItem(STORAGE_KEYS.settings)).not.toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.recent)).toBeNull();
  });
});

describe("setPersistence and resetAllData", () => {
  it("clears data but keeps the settings key when disabling", () => {
    window.localStorage.setItem(STORAGE_KEYS.recent, "[]");

    setPersistence(false);

    expect(getSettings()).toEqual({ persist: false });
    expect(window.localStorage.getItem(STORAGE_KEYS.recent)).toBeNull();
  });

  it("resets settings to the default", () => {
    setSettings({ persist: false });
    resetAllData();
    expect(getSettings()).toEqual({ persist: true });
  });
});

describe("subscribeToSettings", () => {
  it("listens for custom and storage events until unsubscribed", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSettings(onChange);

    window.dispatchEvent(new Event(STORAGE_EVENTS.settings));
    window.dispatchEvent(new Event("storage"));
    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    window.dispatchEvent(new Event(STORAGE_EVENTS.settings));
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
