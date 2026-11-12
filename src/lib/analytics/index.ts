import { STORAGE_KEYS } from "@/lib/storage-keys";

const TRACK_PROXY_URL = "/api/track";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const TRACK_URL =
  process.env.NEXT_PUBLIC_SUPABASE_TRACK_URL ||
  (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/superpdf-track` : "");
const ANALYTICS_URL =
  process.env.NEXT_PUBLIC_SUPABASE_ANALYTICS_URL ||
  (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/superpdf-analytics` : "");

/** True when a dashboard URL exists for this build. */
export const analyticsConfigured = Boolean(ANALYTICS_URL);
/** True when pageviews/heartbeats can be sent for this build. */
export const trackingConfigured = Boolean(TRACK_URL);

const isLocalhost = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

// Local development would otherwise pollute production numbers. Opt in with
// NEXT_PUBLIC_ANALYTICS_DEBUG=true when testing the pipeline itself.
const trackingDisabled = () =>
  isLocalhost() && process.env.NEXT_PUBLIC_ANALYTICS_DEBUG !== "true";

const generateId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  let id = "";
  for (let index = 0; index < bytes.length; index += 1) {
    id += chars[bytes[index]! % chars.length];
  }
  return id;
};

const read = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; analytics is optional.
  }
};

/**
 * A random 32-character ID stored in localStorage. It exists only to tell a
 * returning browser from a new one. It is not linked to any personal data.
 */
export const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  let id = read(STORAGE_KEYS.visitorId);
  if (!id) {
    id = generateId();
    write(STORAGE_KEYS.visitorId, id);
  }
  return id;
};

export const isReturningVisitor = () => read(STORAGE_KEYS.visitorSeen) === "1";

export const markSeen = () => write(STORAGE_KEYS.visitorSeen, "1");

export const getVisitCount = () => {
  if (typeof window === "undefined") return 1;
  const value = Number.parseInt(read(STORAGE_KEYS.visitCount) || "1", 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
};

export const incrementVisitCount = () => {
  if (typeof window === "undefined") return 1;
  const next = getVisitCount() + 1;
  write(STORAGE_KEYS.visitCount, String(next));
  return next;
};

let lastTracked = "";

export async function trackPageView(pathname: string) {
  if (typeof navigator === "undefined" || trackingDisabled()) {
    return;
  }

  const visitorId = getVisitorId();
  const key = `${visitorId}:${pathname}`;
  if (key === lastTracked) {
    return;
  }
  lastTracked = key;

  const payload = { visitorId, pathname, type: "pageview" };

  try {
    const response = await fetch(TRACK_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      markSeen();
      return;
    }
  } catch {
    // The Pages Function is not available in dev or on static-only hosts.
  }

  if (!TRACK_URL) {
    return;
  }

  try {
    await fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    markSeen();
  } catch {
    // Analytics must never break the page.
  }
}

export async function sendHeartbeat() {
  if (!TRACK_URL || trackingDisabled()) {
    return;
  }
  try {
    await fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        type: "heartbeat",
      }),
    });
  } catch {
    // Ignore network failures.
  }
}

export async function fetchAnalytics() {
  if (!ANALYTICS_URL) {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn("NEXT_PUBLIC_SUPABASE_ANALYTICS_URL is not set");
    }
    return null;
  }

  try {
    const response = await fetch(ANALYTICS_URL, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}
