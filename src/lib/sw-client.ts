"use client";

import type { SwResponse } from "./sw-contract";

/**
 * Sends a typed message to the Service Worker router and resolves the
 * matching response via the correlation `id`. Used by SW-routed tools.
 *
 * The caller must guarantee `type` is handled in sw-source/index.ts (see
 * Agent.md §0.2). A lint/CI check cross-references every `sendToSw()` call
 * against router-handled types.
 */
export function sendToSw<P = unknown, R = unknown>(
  type: string,
  payload: P,
): Promise<R> {
  return new Promise<R>((resolve, reject) => {
    const id = Math.floor(Math.random() * 2 ** 31);
    const controller = navigator.serviceWorker;

    if (!controller?.controller) {
      reject(new Error("Service Worker not ready. Refresh the page."));
      return;
    }

    const onMessage = (event: MessageEvent<SwResponse<R>>) => {
      const data = event.data;
      if (!data || data.id !== id) return;
      controller.removeEventListener("message", onMessage);
      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data.result as R);
      }
    };

    controller.addEventListener("message", onMessage);
    controller.controller.postMessage({ type, id, payload });
  });
}
