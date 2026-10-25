import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { securitySections } from "@/data/legal-content";
import { LEGAL_LAST_UPDATED, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Security",
  description:
    "How SuperPDF keeps documents on your device, which engines run locally, and how to report a vulnerability.",
  path: "/security-policy",
});

export default function SecurityPolicyPage() {
  return (
    <StaticPage
      title="Security"
      intro="How the browser processing works, and what it means for your files."
      updated={LEGAL_LAST_UPDATED}
      sections={securitySections}
    >
      <p style={{ marginTop: "2.5rem", color: "var(--color-text-secondary)" }}>
        Found something that does not look right?{" "}
        <Link href="/contact" style={{ color: "var(--color-brand-strong)", textDecoration: "underline" }}>
          Contact us
        </Link>{" "}
        or email security@superpdf.com.
      </p>
    </StaticPage>
  );
}
