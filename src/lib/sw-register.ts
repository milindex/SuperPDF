"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker (public/sw.js) on the client. The SW routes
 * pdf-lib tool messages (sendToSw) and is generated from sw-source/ via
 * `npm run build:sw`.
 */
export function useSwRegistration(): void {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("SW registration failed:", err);
        }
      });
  }, []);
}
