"use client";

import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Renders nothing. Mounted once in the root layout to record anonymous
 * pageviews and presence heartbeats.
 */
export default function AnalyticsTracker() {
  useAnalytics();
  return null;
}
