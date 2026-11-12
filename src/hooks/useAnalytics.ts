"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendHeartbeat, trackPageView } from "@/lib/analytics";

/**
 * Records an anonymous pageview on every client-side route change and sends a
 * heartbeat while the tab is visible. Mounted once in the root layout.
 */
export function useAnalytics() {
  const pathname = usePathname();
  const previous = useRef("");

  useEffect(() => {
    if (pathname === previous.current) return;
    previous.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    }, 30000);

    return () => window.clearInterval(id);
  }, []);
}
