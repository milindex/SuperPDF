import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { termsSections } from "@/data/legal-content";
import { LEGAL_LAST_UPDATED, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms and conditions",
  description:
    "The terms that govern your use of SuperPDF, including acceptable use, warranties, and liability.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <StaticPage
      centered
      path="/terms"
      title="Terms & Conditions"
      intro="The terms that govern your use of SuperPDF."
      updated={LEGAL_LAST_UPDATED}
      sections={termsSections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Questions about these terms?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand-strong)", textDecoration: "underline" }}>
          Contact us
        </Link>{" "}
        or email connect@milinds.dev.
      </p>
    </StaticPage>
  );
}
