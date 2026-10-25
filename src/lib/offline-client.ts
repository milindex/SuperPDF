"use client";

import {
  OFFLINE_CACHE,
  OFFLINE_CLEAR_MESSAGE,
  OFFLINE_PRECACHE_MESSAGE,
  OFFLINE_ROUTES,
} from "./offline";

let requestId = 1;

function postToWorker<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    if (!("serviceWorker" in navigator)) {
      reject(new Error("Service workers are not available in this browser."));
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const worker = registration.active;
      if (!worker) {
        reject(new Error("The offline worker is not active yet."));
        return;
      }
      const id = requestId++;
      const channel = new MessageChannel();
      const timer = setTimeout(() => {
        channel.port1.close();
        reject(new Error("The offline copy took too long. Try again."));
      }, 45_000);
      channel.port1.onmessage = (event: MessageEvent) => {
        clearTimeout(timer);
        channel.port1.close();
        const data = event.data as { result?: T; error?: string };
        if (data?.error) reject(new Error(data.error));
        else resolve(data.result as T);
      };
      worker.postMessage({ type, id, payload }, [channel.port2]);
    } catch (error) {
      reject(
        error instanceof Error
          ? error
          : new Error("The offline worker is not available."),
      );
    }
  });
}

export function offlineSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export async function saveOfflineCopy(): Promise<number> {
  const result = await postToWorker<{ stored: number; total: number }>(
    OFFLINE_PRECACHE_MESSAGE,
    { routes: OFFLINE_ROUTES },
  );
  return result.total;
}

export async function clearOfflineCopy(): Promise<void> {
  if (!("caches" in window)) return;
  await postToWorker<{ total: number }>(OFFLINE_CLEAR_MESSAGE);
}

export async function getOfflineCacheCount(): Promise<number> {
  if (typeof caches === "undefined") return 0;
  if (!(await caches.has(OFFLINE_CACHE))) return 0;
  const cache = await caches.open(OFFLINE_CACHE);
  return (await cache.keys()).length;
}
