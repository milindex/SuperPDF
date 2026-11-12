// Cloudflare Pages Function: edge proxy for SuperPDF analytics.
//
// Supabase Edge Functions never receive CF-IPCountry, so the country is stamped
// here and forwarded to `superpdf-track`. Only pageviews go through this proxy;
// heartbeats go directly to the Supabase function.
//
// The raw IP is used only for the in-memory rate limiter. It is never stored.

const MAX_BODY_SIZE = 4 * 1024;
const UPSTREAM_TIMEOUT = 5000;

const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW = 60_000;
const MAX_RATE_LIMIT_ENTRIES = 5000;

const NON_COUNTRY_CODES = new Set(['XX', 'T1']);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (rateLimitMap.get(ip) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    for (const key of rateLimitMap.keys()) {
      if (rateLimitMap.size <= MAX_RATE_LIMIT_ENTRIES) {
        break;
      }
      rateLimitMap.delete(key);
    }
  }

  return false;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
  const upstreamUrl =
    env.SUPABASE_TRACK_URL ||
    env.NEXT_PUBLIC_SUPABASE_TRACK_URL ||
    (supabaseUrl ? `${supabaseUrl}/functions/v1/superpdf-track` : '');
  if (!upstreamUrl) {
    return json({ error: 'Tracking not configured.' }, 503);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return json({ error: 'Too many requests.' }, 429);
  }

  const contentLength = parseInt(
    request.headers.get('Content-Length') || '0',
    10
  );
  if (contentLength > MAX_BODY_SIZE) {
    return json({ error: 'Request too large.' }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  const { visitorId, pathname, type } = body || {};

  if (typeof visitorId !== 'string' || !visitorId || visitorId.length > 64) {
    return json({ error: 'Invalid visitorId.' }, 400);
  }
  if (type !== 'pageview' && type !== 'heartbeat') {
    return json({ error: 'Invalid type.' }, 400);
  }
  if (
    pathname !== undefined &&
    (typeof pathname !== 'string' || pathname.length > 512)
  ) {
    return json({ error: 'Invalid pathname.' }, 400);
  }

  const cfCountry = (request.headers.get('CF-IPCountry') || '').toUpperCase();
  const country =
    cfCountry && !NON_COUNTRY_CODES.has(cfCountry) ? cfCountry : undefined;

  const payload = { visitorId, type };
  if (pathname) {
    payload.pathname = pathname;
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('User-Agent') || '',
        // This is the only source of country data. The Supabase function
        // ignores any client-provided country and never geolocates on its own.
        'X-SuperPDF-CF-Country': country || '',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT),
    });

    if (!upstream.ok) {
      return json({ error: 'Upstream error.' }, 502);
    }
  } catch {
    return json({ error: 'Upstream unreachable.' }, 502);
  }

  return json({ ok: true });
}
