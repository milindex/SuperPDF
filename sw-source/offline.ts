/// <reference lib="webworker" />

import { OFFLINE_CACHE } from "@/lib/offline";

const ASSET_PATTERN = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;

/** Extract `/_next/static/...` asset URLs referenced by a route's HTML. */
function collectAssetUrls(html: string): Set<string> {
  const assets = new Set<string>();
  for (const match of html.matchAll(ASSET_PATTERN)) {
    assets.add(match[1]);
  }
  return assets;
}

/** Run `worker` over `items` with at most `limit` concurrent invocations. */
async function runPool<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await worker(item);
    }
  });
  await Promise.all(lanes);
}

/** Fetch and store the app routes plus the chunks they reference. */
export async function precacheRoutes(routes: string[]): Promise<number> {
  const cache = await caches.open(OFFLINE_CACHE);
  const assetUrls = new Set<string>();
  let stored = 0;

  // Prefetch routes with a small concurrency cap so a burst of navigations
  // does not saturate the network. Asset URLs are collected across all routes
  // and fetched once afterwards, deduplicating shared `_next/static` chunks.
  await runPool(routes, 3, async (route) => {
    try {
      const response = await fetch(route, { cache: "reload" });
      if (!response.ok) return;
      const copy = response.clone();
      await cache.put(route, response);
      stored += 1;
      if ((copy.headers.get("content-type") ?? "").includes("text/html")) {
        for (const asset of collectAssetUrls(await copy.text())) {
          assetUrls.add(asset);
        }
      }
    } catch {
      // A route that cannot be fetched now may still work from a prior visit.
    }
  });

  await Promise.allSettled(
    [...assetUrls].map(async (asset) => {
      if (await cache.match(asset)) return;
      const response = await fetch(asset, { cache: "reload" });
      if (response.ok) await cache.put(asset, response);
    }),
  );

  await Promise.allSettled(
    [
      "/manifest.webmanifest",
      "/icon.svg",
      "/icon-192.png",
      "/icon-512.png",
    ].map(async (asset) => {
      if (await cache.match(asset)) return;
      const response = await fetch(asset);
      if (response.ok) await cache.put(asset, response);
    }),
  );

  return stored;
}

export async function offlineCacheCount(): Promise<number> {
  if (!(await caches.has(OFFLINE_CACHE))) return 0;
  const cache = await caches.open(OFFLINE_CACHE);
  return (await cache.keys()).length;
}

export async function clearOfflineCache(): Promise<void> {
  await caches.delete(OFFLINE_CACHE);
}

export async function networkFirstNavigation(
  request: Request,
): Promise<Response> {
  const cache = await caches.open(OFFLINE_CACHE);
  const pathname = new URL(request.url).pathname;
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(new Request(pathname), response.clone());
    }
    return response;
  } catch {
    const pathCached = await cache.match(pathname);
    if (pathCached) return pathCached;
    const exact = await cache.match(request);
    if (exact) return exact;
    const offline = await cache.match("/offline");
    if (offline) return offline;
    return new Response(
      "<!doctype html><title>Offline</title><p>This page is not available offline yet.</p>",
      { headers: { "content-type": "text/html; charset=utf-8" }, status: 503 },
    );
  }
}

export async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(OFFLINE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 504 });
  }
}

/**
 * Network-first with a cache fallback. Used for development assets, whose
 * filenames are not content-hashed and change on every edit; serving them
 * cache-first would hydrate stale code.
 */
export async function networkFirstAsset(
  request: Request,
): Promise<Response> {
  const cache = await caches.open(OFFLINE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("", { status: 504 });
  }
}
