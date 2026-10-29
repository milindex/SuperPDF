import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Instrument_Sans,
  Instrument_Serif,
} from "next/font/google";
import { SwProvider } from "@/components/SwProvider";
import Choreography from "@/components/Choreography/Choreography";
import ScrollRuler from "@/components/ScrollRuler/ScrollRuler";
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

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const bootScript = `(function(){try{var t=localStorage.getItem("superpdf-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("choreo");}}catch(e){}try{if(matchMedia("(min-width: 1024px)").matches){document.documentElement.setAttribute("data-ruler","on");}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SuperPDF | The open PDF workbench",
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
    title: "SuperPDF | The open PDF workbench",
    description:
      "A private, browser-native PDF workbench. Merge, split, compress, convert and sign without uploading.",
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "SuperPDF | The open PDF workbench",
    description:
      "A private, browser-native PDF workbench. Merge, split, compress, convert and sign without uploading.",
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f1ee" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <SwProvider>
          <Choreography />
          <ScrollRuler />
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
