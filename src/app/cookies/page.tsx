import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { cookieSections } from "@/data/page-content";

export default function CookiesPage() {
  return (
    <StaticPage
      title="Cookie Policy"
      intro="How SuperPDF uses cookies and similar technologies."
      updated="2026"
      sections={cookieSections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Questions about cookies?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand)", textDecoration: "none" }}>
          Contact us
        </Link>
        .
      </p>
    </StaticPage>
  );
}