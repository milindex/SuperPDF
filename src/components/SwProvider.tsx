"use client";

import { useSwRegistration } from "@/lib/sw-register";

/**
 * Client provider that registers the Service Worker once at app root.
 */
export function SwProvider({ children }: { children: React.ReactNode }) {
  useSwRegistration();
  return <>{children}</>;
}
