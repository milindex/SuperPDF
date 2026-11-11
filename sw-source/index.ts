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

// `useSwRegistration` registers `/sw.js?dev=1` in development. Dev chunk names
// are not content-hashed, so they must not be served cache-first.
const isDev = new URL(ctx.location.href).searchParams.get("dev") === "1";

/**
 * Recursively collects every transferable ArrayBuffer in a response value: a
 * single Uint8Array, an array of Uint8Arrays (split-pdf), or an object
 * containing typed arrays. Collected buffers are transferred instead of
 * structured-clone copied.
 */
function collectTransferables(value: unknown): ArrayBuffer[] {
  const buffers = new Set<ArrayBuffer>();

  const visit = (node: unknown): void => {
    if (node == null) return;
    if (node instanceof ArrayBuffer) {
      buffers.add(node);
      return;
    }
    if (ArrayBuffer.isView(node)) {
      if (node.buffer instanceof ArrayBuffer) buffers.add(node.buffer);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (typeof node === "object") {
      for (const field of Object.values(node as Record<string, unknown>)) {
        visit(field);
      }
    }
  };

  visit(value);
  return [...buffers];
}

ctx.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await ctx.skipWaiting();
      if (!isDev) await precacheRoutes(OFFLINE_ROUTES);
    })(),
  );
});

ctx.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith("superpdf-") &&
              (isDev || name !== OFFLINE_CACHE),
          )
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
    /\.(css|js|mjs|wasm|rsc|txt|woff2?|ttf|png|jpe?g|svg|webp|ico)$/i.test(
      url.pathname,
    );

  // In production, `/_next/static/*` filenames are content-hashed and
  // immutable, so serve them cache-first; this mirror keeps them available
  // offline without a network round-trip. Dev filenames are not hashed, so
  // they take the network-first path instead.
  if (isNextAsset) {
    event.respondWith(
      isDev ? networkFirstAsset(request) : cacheFirst(request),
    );
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
    const transfer = collectTransferables(result);
    respond({ id, result }, transfer.length > 0 ? transfer : undefined);
  } catch (error) {
    respond({
      id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
