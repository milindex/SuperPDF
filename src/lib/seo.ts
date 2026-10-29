import type { Metadata } from "next";
import { APP_VERSION } from "@/lib/version";
/** Canonical origin for the site. Keep in sync with `metadataBase`. */
export const SITE_URL = "https://superpdf.milinds.dev";
export const SITE_NAME = "SuperPDF";
export const SITE_EMAIL = "connect@milinds.dev";
export const SITE_GITHUB = "https://github.com/milindex/SuperPDF";
export const SITE_ISSUES = `${SITE_GITHUB}/issues`;

export const SITE_TITLE = "SuperPDF — PDF tools that never upload your files";

export const SITE_DESCRIPTION =
  "Merge, split, compress, convert, sign and protect PDFs without uploading them. No account, no tracking, no daily limits — your files stay on your device.";

/** Social card served from `public/og-image.png` (1200×630). */
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "SuperPDF — private PDF tools that keep your files on your device.",
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    authors: [{ name: "Milind Sonawane", url: "https://milinds.dev" }],
    creator: "Milind Sonawane",
    publisher: SITE_NAME,
    category: "PDF tools",
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
    description: SITE_DESCRIPTION,
    sameAs: [SITE_GITHUB],
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon-512.png"),
      width: 512,
      height: 512,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE_EMAIL,
      contactType: "customer support",
    },
    founder: {
      "@type": "Person",
      name: "Milind Sonawane",
      url: "https://milinds.dev",
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
    alternateName: "Super PDF",
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
  featureList,
}: {
  name: string;
  description: string;
  path: `/${string}`;
  featureList?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript and HTML5.",
    softwareVersion: APP_VERSION,
    isAccessibleForFree: true,
    sameAs: [SITE_GITHUB],
    license: "https://opensource.org/licenses/MIT",
    ...(featureList && featureList.length > 0 ? { featureList } : {}),
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
