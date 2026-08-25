import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { privacySections } from "@/data/page-content";

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      intro="This policy explains what information SuperPDF collects and how your documents are handled."
      updated="2026"
      sections={privacySections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Questions?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand)", textDecoration: "none" }}>
          Contact us
        </Link>
        .
      </p>
    </StaticPage>
  );
}