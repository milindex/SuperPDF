import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { privacySections } from "@/data/page-content";

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy policy"
      intro="What SuperPDF collects, what it does not collect, and what happens to your files."
      updated="2026"
      sections={privacySections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Questions?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand-strong)", textDecoration: "underline" }}>
          Contact us
        </Link>
        .
      </p>
    </StaticPage>
  );
}