import type { Metadata } from "next";

/** Canonical origin for the site. Keep in sync with `metadataBase`. */
export const SITE_URL = "https://superpdf.com";
export const SITE_NAME = "SuperPDF";

/** Shown on every legal page; bump when the policies change. */
export const LEGAL_LAST_UPDATED = "25 October 2026";

/**
 * Builds page metadata with a unique title, description, canonical URL, and
 * matching social cards. Use this instead of a bare `metadata` object so every
 * indexable route has an explicit canonical.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: `/${string}`;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
