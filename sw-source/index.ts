/// <reference lib="webworker" />

import { routeRequest } from "./router";
import {
  OFFLINE_CACHE,
  OFFLINE_CLEAR_MESSAGE,
  OFFLINE_PRECACHE_MESSAGE,
  OFFLINE_ROUTES,
} from "@/lib/offline";
import {
  cacheFirst,
  clearOfflineCache,
  networkFirstAsset,
  networkFirstNavigation,
  offlineCacheCount,
  precacheRoutes,
} from "./offline";

const ctx = self as unknown as ServiceWorkerGlobalScope;

ctx.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await ctx.skipWaiting();
      await precacheRoutes(OFFLINE_ROUTES);
    })(),
  );
});

ctx.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("superpdf-") && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name)),
      );
      await ctx.clients.claim();
    })(),
  );
});

ctx.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== ctx.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  const isNextAsset = url.pathname.startsWith("/_next/static/");
  const isStatic =
    /\.(css|js|mjs|woff2?|ttf|png|jpe?g|svg|webp|ico)$/i.test(url.pathname);

  if (isNextAsset) {
    event.respondWith(networkFirstAsset(request));
    return;
  }

  if (isStatic) {
    event.respondWith(cacheFirst(request));
  }
});

ctx.addEventListener("message", async (event: ExtendableMessageEvent) => {
  const { type, id, payload } = (event.data || {}) as {
    type?: string;
    id?: number;
    payload?: unknown;
  };
  if (!type || typeof id !== "number") return;

  // The client sends its reply port via MessageChannel (see sw-client.ts).
  const port = event.ports?.[0];
  if (!port) return;

  const respond = (msg: unknown, transfer?: Transferable[]) => {
    port.postMessage(msg, transfer ? { transfer } : undefined);
  };

  if (type === OFFLINE_PRECACHE_MESSAGE) {
    const routes =
      payload &&
      typeof payload === "object" &&
      Array.isArray((payload as { routes?: unknown }).routes)
        ? ((payload as { routes: string[] }).routes ?? OFFLINE_ROUTES)
        : OFFLINE_ROUTES;
    try {
      const stored = await precacheRoutes(routes);
      respond({
        id,
        result: { stored, total: await offlineCacheCount() },
      });
    } catch (error) {
      respond({
        id,
        error: error instanceof Error ? error.message : "Could not save offline copy",
      });
    }
    return;
  }

  if (type === OFFLINE_CLEAR_MESSAGE) {
    try {
      await clearOfflineCache();
      respond({ id, result: { total: 0 } });
    } catch (error) {
      respond({
        id,
        error: error instanceof Error ? error.message : "Could not clear offline copy",
      });
    }
    return;
  }

  try {
    const result = await routeRequest(type, payload);
    const transfer = result instanceof Uint8Array ? [result.buffer] : undefined;
    respond({ id, result }, transfer as Transferable[] | undefined);
  } catch (error) {
    respond({
      id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
