import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Schibsted_Grotesk } from "next/font/google";
import { SwProvider } from "@/components/SwProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import RecentTracker from "@/components/RecentTracker/RecentTracker";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.scss";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SuperPDF | PDF work without the upload",
    template: "%s | SuperPDF",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  openGraph: {
    title: "SuperPDF | PDF work without the upload",
    description:
      "PDF tools that run in the browser. No upload, no account, no server copy.",
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "SuperPDF | PDF work without the upload",
    description:
      "PDF tools that run in the browser. No upload, no account, no server copy.",
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf6",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${schibsted.variable} ${instrument.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <SwProvider>
          <RecentTracker />
          <div className="app-shell">
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <Header />
            <main id="main-content" className="app-content">
              {children}
            </main>
            <Footer />
          </div>
        </SwProvider>
      </body>
    </html>
  );
}
