import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { privacySections } from "@/data/legal-content";
import { LEGAL_LAST_UPDATED, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "What SuperPDF collects, what stays in your browser, and what happens to your documents. No accounts, no analytics, no uploads.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticPage
      centered
      path="/privacy"
      title="Privacy policy"
      intro="What SuperPDF collects, what it does not collect, and what happens to your files."
      updated={LEGAL_LAST_UPDATED}
      sections={privacySections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Questions about this policy?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand-strong)", textDecoration: "underline" }}>
          Contact us
        </Link>{" "}
        or email connect@milinds.dev.
      </p>
    </StaticPage>
  );
}
