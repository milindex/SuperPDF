"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSettings, subscribeToSettings } from "@/lib/settings";
import { getToolSettings, saveToolSettings } from "@/lib/tool-settings";
import type { ToolSettingsMap } from "@/lib/tool-settings";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const IGNORED_INPUT_TYPES = new Set([
  "password",
  "file",
  "hidden",
  "submit",
  "button",
  "reset",
  "image",
]);

function fieldKey(field: Field, index: number): string | null {
  if (field instanceof HTMLInputElement) {
    if (IGNORED_INPUT_TYPES.has(field.type)) return null;
    if (field.type === "radio") {
      return `radio:${field.name || `group-${index}`}`;
    }
    if (field.type === "checkbox") {
      return `check:${field.id || field.name || `check-${index}`}`;
    }
  }
  if (field.closest("[data-no-persist]")) return null;
  return field.id || field.name || `${field.tagName.toLowerCase()}-${index}`;
}

function setNativeValue(field: Field, value: string): void {
  const proto =
    field instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : field instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Remembers form values for the current tool in localStorage, so a reload or a
 * new visit starts with the same options. Password and file fields are never
 * stored. Fields that only appear after a file is added are restored when they
 * mount. Renders nothing.
 */
export default function ToolSettings() {
  const pathname = usePathname();
  const savedRef = useRef<ToolSettingsMap>({});
  const activeRef = useRef(true);

  useEffect(() => {
    const layout = document.querySelector<HTMLElement>("[data-tool-layout]");
    if (!layout) return;

    const toolId = pathname.startsWith("/tools/")
      ? pathname.replace(/^\/tools\//, "").replace(/\/$/, "")
      : "";
    if (!toolId) return;

    activeRef.current = getSettings().persist;
    savedRef.current = activeRef.current ? getToolSettings(toolId) : {};

    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    let restoreTimer: ReturnType<typeof setTimeout> | null = null;

    const fields = () =>
      Array.from(
        layout.querySelectorAll<Field>(
          'input:not([type="file"]), select, textarea',
        ),
      );

    const collect = (): ToolSettingsMap => {
      const values: ToolSettingsMap = {};
      fields().forEach((field, index) => {
        const key = fieldKey(field, index);
        if (!key) return;
        if (field instanceof HTMLInputElement) {
          if (field.type === "radio") {
            if (field.checked) values[key] = field.value;
            return;
          }
          if (field.type === "checkbox") {
            values[key] = field.checked;
            return;
          }
        }
        values[key] = field.value;
      });
      return values;
    };

    const restore = () => {
      if (!activeRef.current) return;
      fields().forEach((field, index) => {
        if (document.activeElement === field) return;
        const key = fieldKey(field, index);
        if (!key) return;
        const saved = savedRef.current[key];
        if (saved === undefined) return;
        if (field instanceof HTMLInputElement) {
          if (field.type === "radio") {
            if (typeof saved === "string" && field.value === saved) {
              field.checked = true;
              field.dispatchEvent(new Event("change", { bubbles: true }));
            }
            return;
          }
          if (field.type === "checkbox") {
            const wanted = saved === true;
            if (field.checked !== wanted) {
              field.checked = wanted;
              field.dispatchEvent(new Event("change", { bubbles: true }));
            }
            return;
          }
        }
        const value = String(saved);
        if (field.value !== value) setNativeValue(field, value);
      });
    };

    const persist = () => {
      if (!activeRef.current) return;
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        savedRef.current = { ...savedRef.current, ...collect() };
        saveToolSettings(toolId, savedRef.current);
      }, 200);
    };

    const scheduleRestore = () => {
      if (restoreTimer) clearTimeout(restoreTimer);
      restoreTimer = setTimeout(restore, 80);
    };

    layout.addEventListener("input", persist);
    layout.addEventListener("change", persist);

    // Tool options often appear only after a file is chosen. Restore them as
    // their controls mount, without storing the file itself.
    const observer = new MutationObserver(scheduleRestore);
    observer.observe(layout, { childList: true, subtree: true });

    const firstRestore = setTimeout(restore, 120);

    const unsubscribe = subscribeToSettings(() => {
      activeRef.current = getSettings().persist;
      if (!activeRef.current) {
        savedRef.current = {};
        saveToolSettings(toolId, {});
      } else {
        savedRef.current = getToolSettings(toolId);
        restore();
      }
    });

    return () => {
      unsubscribe();
      observer.disconnect();
      layout.removeEventListener("input", persist);
      layout.removeEventListener("change", persist);
      if (saveTimer) clearTimeout(saveTimer);
      if (restoreTimer) clearTimeout(restoreTimer);
      clearTimeout(firstRestore);
    };
  }, [pathname]);

  return null;
}
