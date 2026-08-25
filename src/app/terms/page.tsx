import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { termsSections } from "@/data/page-content";

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms & Conditions"
      intro="The terms that govern your use of SuperPDF."
      updated="2026"
      sections={termsSections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Questions about these terms?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand)", textDecoration: "none" }}>
          Contact us
        </Link>
        .
      </p>
    </StaticPage>
  );
}