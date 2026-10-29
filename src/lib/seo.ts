import type { Metadata } from "next";

/** Canonical origin for the site. Keep in sync with `metadataBase`. */
export const SITE_URL = "https://superpdf.milinds.dev";
export const SITE_NAME = "SuperPDF";
export const SITE_EMAIL = "connect@milinds.dev";

export const SITE_DESCRIPTION =
  "A private, browser-native PDF workbench. Merge, split, compress, convert, sign and protect files without uploading them.";

/** Social card served from `public/og-image.png` (1200×630). */
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "SuperPDF — The open PDF workbench.",
};

/** Shown on every legal page; bump when the policies change. */
export const LEGAL_LAST_UPDATED = "29 October 2026";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path}`;
}

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
      locale: "en_US",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export type Breadcrumb = { name: string; path: string };

/** Schema.org Organization, emitted once in the root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: SITE_EMAIL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon-512.png"),
      width: 512,
      height: 512,
    },
    founder: {
      "@type": "Person",
      name: "Milind Sonawane",
    },
  };
}

/** Schema.org WebSite, emitted once in the root layout. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Breadcrumb trail matching the visible breadcrumb on the page. */
export function breadcrumbJsonLd(items: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** One browser-based tool, described as a free SoftwareApplication. */
export function softwareApplicationJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: `/${string}`;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** A list of tools, for the /tools index. */
export function itemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** Questions and answers, for the /faq page. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
