import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * SuperPDF pageview + heartbeat receiver.
 *
 * Deploy to the shared Supabase project as `superpdf-track`. It writes to the
 * `superpdf_*` tables only.
 *
 * Country is never supplied by the browser. The Cloudflare Pages Function
 * (`functions/api/track.js`) stamps `X-SuperPDF-CF-Country` from CF-IPCountry;
 * the raw IP is not stored anywhere.
 */

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://superpdf.milinds.dev",
];

const KNOWN_BOTS = [
  "bot",
  "crawler",
  "spider",
  "scraper",
  "curl",
  "wget",
  "headless",
  "selenium",
  "puppeteer",
  "playwright",
];

function getCorsHeaders(origin: string | null) {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function parseUA(ua: string) {
  // A missing User-Agent is never a real browser. These slip past KNOWN_BOTS
  // because no pattern matches an empty string.
  if (!ua) {
    return { browser: "Bot", os: "Bot" };
  }

  let browser = "Unknown";
  if (/edg|edgios/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/ucbrowser/i.test(ua)) browser = "UC Browser";
  else if (/yaapp|yabrowser/i.test(ua)) browser = "Yandex";
  else if (/crios/i.test(ua)) browser = "Chrome";
  else if (/fxios/i.test(ua)) browser = "Firefox";
  else if (/chrome|chromium/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  // ChromeOS UAs read "X11; CrOS x86_64" — no "linux", no "windows".
  else if (/cros/i.test(ua)) os = "Chrome OS";
  else if (/iphone|ipad|ipod|ios/i.test(ua)) os = "iOS";
  // iPadOS 13+ masquerades as desktop Safari ("Macintosh; Intel Mac OS X") but
  // keeps the "Mobile/" token that real macOS Safari does not send.
  else if (/mac os|macintosh/i.test(ua)) {
    os = /mobile\//i.test(ua) ? "iOS" : "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  return { browser, os };
}

function getDevice(ua: string, os: string) {
  if (!ua) return "Bot";
  if (os === "Android") {
    // Android tablets omit the "Mobile" token; phones always include it.
    return /mobile/i.test(ua) ? "Mobile" : "Tablet";
  }
  if (os === "iOS") {
    if (/iphone|ipod/i.test(ua)) return "Mobile";
    // iPad, or an iPadOS 13+ UA that claimed to be a Mac.
    return "Tablet";
  }
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const headers = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, headers);
  }

  const ua = req.headers.get("User-Agent") || "";
  if (KNOWN_BOTS.some((bot) => ua.toLowerCase().includes(bot))) {
    return json({ skipped: "bot" }, 200, headers);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400, headers);
  }

  const { visitorId, pathname, type } = body;

  if (typeof visitorId !== "string" || !visitorId || visitorId.length > 64) {
    return json({ error: "Invalid visitorId" }, 400, headers);
  }

  if (type !== "pageview" && type !== "heartbeat") {
    return json({ error: "Invalid type" }, 400, headers);
  }

  if (
    pathname !== undefined &&
    (typeof pathname !== "string" || pathname.length > 512)
  ) {
    return json({ error: "Invalid pathname" }, 400, headers);
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

  const { browser, os } = parseUA(ua);
  const device = getDevice(ua, os);

  // Country comes exclusively from the Cloudflare Pages Function. There is no
  // client country fallback and no IP-based geolocation here.
  const cfCountry = (
    req.headers.get("X-SuperPDF-CF-Country") || ""
  ).toUpperCase();
  const country =
    /^[A-Z]{2}$/.test(cfCountry) && cfCountry !== "XX" && cfCountry !== "T1"
      ? cfCountry
      : "Unknown";

  const now = new Date().toISOString();

  try {
    const { data: existing, error: lookupError } = await supabase
      .from("superpdf_visitors")
      .select("visitor_id, visit_count")
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing) {
      if (type === "heartbeat") {
        await supabase
          .from("superpdf_visitors")
          .update({ last_seen: now })
          .eq("visitor_id", visitorId);
      } else {
        const updates: Record<string, unknown> = {
          last_seen: now,
          browser,
          os,
          device,
          visit_count: existing.visit_count + 1,
        };
        // Never downgrade a country we already resolved to "Unknown".
        if (country !== "Unknown") {
          updates.country = country;
        }
        await supabase
          .from("superpdf_visitors")
          .update(updates)
          .eq("visitor_id", visitorId);
      }
    } else {
      await supabase.from("superpdf_visitors").insert({
        visitor_id: visitorId,
        first_seen: now,
        last_seen: now,
        browser,
        os,
        device,
        country,
        visit_count: 1,
      });
    }

    await supabase
      .from("superpdf_presence")
      .upsert(
        { visitor_id: visitorId, last_seen: now },
        { onConflict: "visitor_id" }
      );

    if (type === "pageview" && typeof pathname === "string" && pathname) {
      await supabase.from("superpdf_page_views").insert({
        visitor_id: visitorId,
        pathname,
        timestamp: now,
      });
    }

    return json({ ok: true }, 200, headers);
  } catch {
    return json({ error: "Internal error" }, 500, headers);
  }
});
