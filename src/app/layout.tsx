import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Schibsted_Grotesk } from "next/font/google";
import { SwProvider } from "@/components/SwProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import RecentTracker from "@/components/RecentTracker/RecentTracker";
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
  metadataBase: new URL("https://superpdf.com"),
  title: {
    default: "SuperPDF | PDF work without the upload",
    template: "%s | SuperPDF",
  },
  description:
    "Merge, split, compress, convert, and sign PDFs in your browser. Files stay on your device, with no account and no upload.",
  applicationName: "SuperPDF",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "SuperPDF",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "SuperPDF | PDF work without the upload",
    description:
      "PDF tools that run in the browser. No upload, no account, no server copy.",
    type: "website",
    siteName: "SuperPDF",
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
