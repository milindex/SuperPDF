"use client";

import { useEffect } from "react";
import { setSwRegistration } from "./sw-client";

/**
 * Registers the Service Worker (public/sw.js) on the client and stores the
 * registration so `sendToSw()` can post messages to the active worker. The SW
 * is generated from sw-source/ via `npm run build:sw`.
 */
export function useSwRegistration(): void {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Dev chunks are not content-hashed and change on every edit, so the
    // worker must not serve them cache-first (that can hydrate stale code and
    // blank a lazy section). The `dev` flag makes the SW network-first and
    // skip/clear precaching; production keeps the cache-first policy.
    const scriptUrl =
      process.env.NODE_ENV === "production" ? "/sw.js" : "/sw.js?dev=1";
    navigator.serviceWorker
      .register(scriptUrl, { scope: "/", type: "module" })
      .then((reg) => {
        setSwRegistration(reg);
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("SW registration failed:", err);
        }
      });
  }, []);
}