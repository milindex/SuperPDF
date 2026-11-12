import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * SuperPDF analytics reader.
 *
 * Deploy to the shared Supabase project as `superpdf-analytics`. It reads the
 * `superpdf_*` tables only and returns aggregate, anonymous counts.
 */

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://superpdf.milinds.dev",
];

type Counted = { name: string; value: number };

function getCorsHeaders(origin: string | null) {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function isKnownCountry(code: string | null | undefined): code is string {
  return (
    typeof code === "string" &&
    /^[A-Z]{2}$/.test(code) &&
    code !== "XX" &&
    code !== "T1"
  );
}

function countBy(
  data: Array<Record<string, unknown>> | null,
  key: string,
  limit = 6
): Counted[] {
  const map: Record<string, number> = {};
  for (const row of data || []) {
    const value = (row[key] as string) || "Unknown";
    map[value] = (map[value] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function topToolPaths(data: Array<{ pathname: string }> | null): Counted[] {
  const map: Record<string, number> = {};
  for (const row of data || []) {
    const slug = row.pathname
      .replace(/^\/tools\//, "")
      .split("/")[0]
      ?.replace(/\/$/, "");
    if (!slug) continue;
    map[slug] = (map[slug] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
}

function topPagePaths(data: Array<{ pathname: string }> | null): Counted[] {
  const map: Record<string, number> = {};
  for (const row of data || []) {
    const path = row.pathname === "/" ? "Home" : row.pathname.replace(/^\//, "");
    if (!path) continue;
    map[path] = (map[path] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
}

/** A complete UTC day window ending today, so charts always show the window. */
function sparkline(
  data: Array<{ timestamp: string }> | null,
  days: number
): { date: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const day = row.timestamp.split("T")[0]!;
    counts[day] = (counts[day] || 0) + 1;
  }

  const result: { date: string; value: number }[] = [];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - offset);
    const key = date.toISOString().split("T")[0]!;
    result.push({ date: key, value: counts[key] || 0 });
  }
  return result;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const headers = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SB_URL") ||
      Deno.env.get("SUPABASE_URL") ||
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ||
      "",
    Deno.env.get("SB_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY") ||
      ""
  );

  const now = new Date();
  const today = now.toISOString().split("T")[0]!;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setDate(now.getDate() - 30);
  const onlineThreshold = new Date(Date.now() - 60000).toISOString();

  try {
    const [
      totalVisitors,
      todayVisitors,
      weekVisitors,
      monthVisitors,
      totalVisits,
      onlineNow,
      onlineDeviceData,
      countryData,
      browserData,
      osData,
      deviceData,
      totalPageViews,
      topPages,
      topToolData,
      recentVisitors,
      onlinePresence,
      returningVisitors,
      weeklyTrend,
      monthlyTrend,
    ] = await Promise.all([
      supabase
        .from("superpdf_visitors")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("superpdf_visitors")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", today),
      supabase
        .from("superpdf_visitors")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", weekStart.toISOString()),
      supabase
        .from("superpdf_visitors")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", monthStart.toISOString()),
      supabase.from("superpdf_visitors").select("visit_count"),
      supabase
        .from("superpdf_presence")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", onlineThreshold),
      supabase
        .from("superpdf_presence")
        .select("visitor_id, superpdf_visitors!inner(device)")
        .gte("last_seen", onlineThreshold),
      supabase.from("superpdf_visitors").select("country"),
      supabase.from("superpdf_visitors").select("browser"),
      supabase.from("superpdf_visitors").select("os"),
      supabase.from("superpdf_visitors").select("device"),
      supabase
        .from("superpdf_page_views")
        .select("*", { count: "exact", head: true }),
      supabase.from("superpdf_page_views").select("pathname"),
      supabase
        .from("superpdf_page_views")
        .select("pathname")
        .ilike("pathname", "/tools/%"),
      supabase
        .from("superpdf_visitors")
        .select("visitor_id,country,browser,os,last_seen")
        .order("last_seen", { ascending: false })
        .limit(8),
      supabase
        .from("superpdf_presence")
        .select("visitor_id")
        .gte("last_seen", onlineThreshold),
      supabase
        .from("superpdf_visitors")
        .select("*", { count: "exact", head: true })
        .gt("visit_count", 1),
      supabase
        .from("superpdf_page_views")
        .select("timestamp")
        .gte("timestamp", weekStart.toISOString())
        .order("timestamp", { ascending: true }),
      supabase
        .from("superpdf_page_views")
        .select("timestamp")
        .gte("timestamp", monthStart.toISOString())
        .order("timestamp", { ascending: true }),
    ]);

    const countryRows = (countryData.data || []) as Array<{
      country: string | null;
    }>;
    const knownCountryRows = countryRows.filter((row) =>
      isKnownCountry(row.country)
    );
    const unknownVisitors = countryRows.length - knownCountryRows.length;
    const knownCountryCodes = new Set(
      knownCountryRows.map((row) => row.country)
    );
    const countriesList = countBy(
      knownCountryRows as unknown as Array<Record<string, unknown>>,
      "country"
    );
    const latestCountry =
      (recentVisitors.data || []).find((visitor) =>
        isKnownCountry(visitor.country)
      )?.country || "—";

    const totalVisitsSum = (totalVisits.data || []).reduce(
      (sum, row) => sum + row.visit_count,
      0
    );
    const returningPct =
      (totalVisitors.count || 0) > 0
        ? Math.round(
            ((returningVisitors.count || 0) / (totalVisitors.count || 1)) * 100
          )
        : 0;

    const onlineDeviceMap: Record<string, number> = {};
    for (const row of onlineDeviceData.data || []) {
      const device =
        (row as { superpdf_visitors?: { device?: string } })
          .superpdf_visitors?.device || "Unknown";
      onlineDeviceMap[device] = (onlineDeviceMap[device] || 0) + 1;
    }
    const onlineByDevice = Object.entries(onlineDeviceMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    const onlineIds = new Set(
      (onlinePresence.data || []).map((row) => row.visitor_id)
    );

    return new Response(
      JSON.stringify({
        visitors: {
          total: totalVisitors.count || 0,
          today: todayVisitors.count || 0,
          week: weekVisitors.count || 0,
          month: monthVisitors.count || 0,
          totalVisits: totalVisitsSum,
          returningPct,
          onlineNow: onlineNow.count || 0,
          onlineByDevice,
        },
        reach: {
          countries: knownCountryCodes.size,
          topCountry: countriesList[0]?.name || "—",
          latestCountry,
          unknown: unknownVisitors,
          countriesList,
          browsers: countBy(browserData.data, "browser"),
          operatingSystems: countBy(osData.data, "os"),
          devices: countBy(deviceData.data, "device"),
        },
        reading: {
          totalPageViews: totalPageViews.count || 0,
          avgPagesPerVisit:
            (totalVisitors.count || 0) > 0
              ? Math.round(
                  (totalPageViews.count || 0) / (totalVisitors.count || 1)
                )
              : 0,
          topPages: topPagePaths(topPages.data),
          topTools: topToolPaths(topToolData.data),
        },
        recent: (recentVisitors.data || []).map((visitor) => ({
          visitorId: visitor.visitor_id,
          country: visitor.country,
          browser: visitor.browser,
          os: visitor.os,
          ago: Math.round(
            (Date.now() - new Date(visitor.last_seen).getTime()) / 60000
          ),
          online: onlineIds.has(visitor.visitor_id),
        })),
        lastActivity: recentVisitors.data?.[0]?.last_seen || null,
        trends: {
          weekly: sparkline(weeklyTrend.data, 7),
          monthly: sparkline(monthlyTrend.data, 30),
        },
      }),
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
