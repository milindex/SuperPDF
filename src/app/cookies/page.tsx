import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { cookieSections } from "@/data/legal-content";
import { LEGAL_LAST_UPDATED, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cookie policy",
  description:
    "SuperPDF sets no analytics or tracking cookies. See what is stored in your browser, why, and how to clear it.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <StaticPage
      title="Cookie Policy"
      intro="How SuperPDF uses cookies and similar technologies."
      updated={LEGAL_LAST_UPDATED}
      sections={cookieSections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Questions about cookies or stored data?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand-strong)", textDecoration: "underline" }}>
          Contact us
        </Link>{" "}
        or email support@superpdf.com.
      </p>
    </StaticPage>
  );
}
