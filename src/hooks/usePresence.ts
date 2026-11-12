"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  fetchAnalytics,
  getVisitorId,
  isReturningVisitor,
} from "@/lib/analytics";

export type AnalyticsData = {
  visitors: {
    total: number;
    today: number;
    week: number;
    month: number;
    totalVisits: number;
    returningPct: number;
    onlineNow: number;
    onlineByDevice: { name: string; value: number }[];
  };
  reach: {
    countries: number;
    topCountry: string;
    latestCountry: string;
    unknown?: number;
    countriesList: { name: string; value: number }[];
    browsers: { name: string; value: number }[];
    operatingSystems: { name: string; value: number }[];
    devices: { name: string; value: number }[];
  };
  reading: {
    totalPageViews: number;
    avgPagesPerVisit: number;
    topPages: { name: string; value: number }[];
    topTools: { name: string; value: number }[];
  };
  recent: {
    visitorId: string;
    country: string;
    browser: string;
    os: string;
    ago: number;
    online: boolean;
  }[];
  lastActivity: string | null;
  trends: {
    weekly: { date: string; value: number }[];
    monthly: { date: string; value: number }[];
  };
};

type PresenceState = {
  data: AnalyticsData | null;
  loading: boolean;
  returning: boolean;
  visitorId: string;
};

let state: PresenceState = {
  data: null,
  loading: true,
  returning: false,
  visitorId: "",
};

let initialized = false;

if (typeof window !== "undefined") {
  state = {
    ...state,
    returning: isReturningVisitor(),
    visitorId: getVisitorId(),
  };
  initialized = true;
}

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;
let inFlight = false;

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const setState = (next: Partial<PresenceState>) => {
  state = { ...state, ...next };
  emit();
};

const refreshShared = async () => {
  if (inFlight) return;
  inFlight = true;
  try {
    const result = (await fetchAnalytics()) as AnalyticsData | null;
    if (result) {
      setState({ data: result, loading: false });
    }
  } finally {
    inFlight = false;
    if (state.loading) {
      setState({ loading: false });
    }
  }
};

const onVisibility = () => {
  if (document.visibilityState === "visible") {
    refreshShared();
  }
};

/**
 * One shared poll serves both the footer preview and the dashboard, so they
 * never double the request count. Polls every 30 seconds while visible.
 */
const startPolling = () => {
  if (intervalId || typeof document === "undefined") return;
  refreshShared();
  intervalId = setInterval(() => {
    if (document.visibilityState === "visible") {
      refreshShared();
    }
  }, 30000);
  document.addEventListener("visibilitychange", onVisibility);
};

const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  document.removeEventListener("visibilitychange", onVisibility);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) {
    startPolling();
  }
  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;
    if (subscriberCount === 0) {
      stopPolling();
    }
  };
};

const getSnapshot = () => state;

export const usePresence = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const refresh = useCallback(() => {
    refreshShared();
  }, []);

  return { ...snapshot, initialized, refresh };
};
