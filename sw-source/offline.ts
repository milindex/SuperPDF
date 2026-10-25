/// <reference lib="webworker" />

import { OFFLINE_CACHE } from "@/lib/offline";

const ASSET_PATTERN = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;

async function cacheAssetsFromHtml(
  html: string,
  cache: Cache,
): Promise<void> {
  const assets = new Set<string>();
  for (const match of html.matchAll(ASSET_PATTERN)) {
    assets.add(match[1]);
  }
  await Promise.allSettled(
    [...assets].map(async (asset) => {
      if (await cache.match(asset)) return;
      const response = await fetch(asset, { cache: "reload" });
      if (response.ok) await cache.put(asset, response);
    }),
  );
}

/** Fetch and store the app routes plus the chunks they reference. */
export async function precacheRoutes(routes: string[]): Promise<number> {
  const cache = await caches.open(OFFLINE_CACHE);
  let stored = 0;

  for (const route of routes) {
    try {
      const response = await fetch(route, { cache: "reload" });
      if (!response.ok) continue;
      const copy = response.clone();
      await cache.put(route, response);
      stored += 1;
      if ((copy.headers.get("content-type") ?? "").includes("text/html")) {
        await cacheAssetsFromHtml(await copy.text(), cache);
      }
    } catch {
      // A route that cannot be fetched now may still work from a prior visit.
    }
  }

  await Promise.allSettled(
    ["/manifest.webmanifest", "/icon.svg"].map(async (asset) => {
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

export async function networkFirstAsset(request: Request): Promise<Response> {
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
