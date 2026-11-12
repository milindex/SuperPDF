import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Live analytics",
  description:
    "Privacy-first, real-time traffic for SuperPDF. No cookies, no IP storage and no fingerprinting — only anonymous visitor counts.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}
