# SuperPDF analytics

SuperPDF uses the same privacy-first analytics stack as `milinds.dev-v2` and
CoderTools: a small client tracker, a Supabase-backed presence store, an
expandable footer preview, and an `/analytics` dashboard.

The Supabase project is shared across sites, so SuperPDF owns only the
`superpdf_*` tables and the `superpdf-track` / `superpdf-analytics` edge
functions. This repository contains the canonical copies in `supabase/`.

```text
superpdf_visitors
superpdf_page_views
superpdf_presence
```

Other sites should keep their own prefix. Do not point SuperPDF at the
`codertools_*` tables.

## How it works

1. `AnalyticsTracker` is mounted in the root layout and calls `/api/track` on
   every client-side route change.
2. On Cloudflare Pages, `functions/api/track.js` stamps `CF-IPCountry` as
   `X-SuperPDF-CF-Country` and forwards the pageview to `superpdf-track`. The
   raw IP is used only for an in-memory rate limiter.
3. `superpdf-track` parses the User-Agent, upserts the visitor and presence
   rows, and records the pageview.
4. `usePresence` polls `superpdf-analytics` every 30 seconds while the page is
   visible. One shared poll serves both the footer preview and the dashboard.
5. Heartbeats go directly to `superpdf-track` every 30 seconds to keep the
   "online now" count accurate.

No cookies, no IP storage and no fingerprinting. The visitor ID is a random
32-character value stored in `localStorage` under `superpdf:visitor-id`.

Tracking is skipped automatically on `localhost` so development traffic does
not pollute production numbers.

## Setup

### 1. Create the tables

Run the migration against the shared Supabase project:

```shell
supabase db push
```

Or paste `supabase/migrations/20261112193000_superpdf_analytics.sql` into the
Supabase SQL editor. The migration only creates and alters `superpdf_*` objects.

The migration filename uses a timestamp rather than a small sequence number
because the shared project already has another site's `001_*.sql` in its
migration history. If the CLI reports that the file sorts before the remote's
latest migration, push it explicitly:

```shell
supabase db push --include-all
```

### 2. Deploy the edge functions

```shell
supabase functions deploy superpdf-track --no-verify-jwt
supabase functions deploy superpdf-analytics --no-verify-jwt
```

Set the function secrets once per project:

```shell
supabase secrets set \
  SB_URL=https://your-project.supabase.co \
  SB_SERVICE_ROLE_KEY=your-service-role-key
```

`SB_SERVICE_ROLE_KEY` is preferred because it bypasses RLS. If it is not set,
the functions fall back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or
`SB_PUBLISHABLE_KEY`). That works with the RLS policies created by the
migration, but the service-role key is the safer option for server-side reads.

`SB_PASSWORD` is the database password used by the Supabase CLI for migrations.
It is not used by the app or the edge functions and must never be exposed to the
browser.

### Environment variables

| Variable                               | Scope                  | Purpose                                                 |
| -------------------------------------- | ---------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Build + runtime        | Supabase project URL; also used to derive function URLs |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Edge Functions         | Public key; fallback for the edge functions             |
| `NEXT_PUBLIC_SUPABASE_TRACK_URL`       | Build                  | Optional explicit track function URL                    |
| `NEXT_PUBLIC_SUPABASE_ANALYTICS_URL`   | Build                  | Optional explicit analytics function URL                |
| `SUPABASE_TRACK_URL`                   | Cloudflare runtime     | Track function URL used by `functions/api/track.js`     |
| `SB_URL`                               | Edge Functions         | Supabase URL secret                                     |
| `SB_SERVICE_ROLE_KEY`                  | Edge Functions         | Preferred server key for table access                   |
| `SB_PASSWORD`                          | Local CLI only         | Database password for `supabase db push`                |
| `NEXT_PUBLIC_ANALYTICS_DEBUG`          | Build                  | Set `true` to track localhost traffic                   |

### 3. Set the build environment

For static export, `NEXT_PUBLIC_*` values are inlined at build time. The
function URLs are derived automatically from `NEXT_PUBLIC_SUPABASE_URL`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
```

That resolves to:

```text
https://<project>.supabase.co/functions/v1/superpdf-track
https://<project>.supabase.co/functions/v1/superpdf-analytics
```

Override them explicitly if the functions live elsewhere:

```text
NEXT_PUBLIC_SUPABASE_TRACK_URL=https://<project>.supabase.co/functions/v1/superpdf-track
NEXT_PUBLIC_SUPABASE_ANALYTICS_URL=https://<project>.supabase.co/functions/v1/superpdf-analytics
```

For Cloudflare Pages, also set the runtime variable used by the proxy:

```text
SUPABASE_TRACK_URL=https://<project>.supabase.co/functions/v1/superpdf-track
```

### 4. Deploy

```shell
npm run build
```

Deploy the static `out/` directory plus the `functions/` directory to Cloudflare
Pages for country detection. On a static-only host, tracking still works through
the direct Supabase fallback, but the country will be recorded as `Unknown`.

## Country data

Country data comes **only** from Cloudflare's `CF-IPCountry` header in
`functions/api/track.js`. The proxy forwards it to the track function as
`X-SuperPDF-CF-Country`. The Supabase function does not accept a country from
the browser and never performs IP geolocation.

`XX` (unknown) and `T1` (Tor) are treated as `Unknown`. Unknown countries are
removed from the visible country list and top-country calculation, but their
visitors remain in the overall totals. The analytics response exposes the count
as `reach.unknown`, and the dashboard shows it as a small note.

## Dashboard

The dashboard is at `/analytics`. It is marked `noindex, nofollow`, is not in
the sitemap, and is disallowed in `robots.ts`.

The footer preview and the dashboard share a single polling store, so opening
both does not multiply requests. Polling pauses while the tab is hidden.

## Local development

Tracking is disabled on `localhost` by default. To test the pipeline locally,
set:

```text
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

and make sure the Supabase URLs are available at build time.
