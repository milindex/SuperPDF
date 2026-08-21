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
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", type: "module" })
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