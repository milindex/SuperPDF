import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { LEGAL_LAST_UPDATED, pageMetadata } from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Legal",
  description:
    "SuperPDF policies: privacy, terms, cookies, and security. The short version is that files stay on your device.",
  path: "/legal",
});

const LEGAL_PAGES = [
  {
    href: "/privacy",
    title: "Privacy policy",
    description:
      "How we handle your documents and what little information we collect.",
  },
  {
    href: "/terms",
    title: "Terms and conditions",
    description: "The terms governing your use of SuperPDF.",
  },
  {
    href: "/cookies",
    title: "Cookie policy",
    description: "How we use cookies and similar technologies.",
  },
  {
    href: "/security-policy",
    title: "Security",
    description: "How processing stays local and what that means for your data.",
  },
];

export default function LegalPage() {
  return (
    <StaticPage
      path="/legal"
      title="Legal"
      intro="Policies for SuperPDF. The short version: files stay on your device."
      updated={LEGAL_LAST_UPDATED}
    >
      <div className={styles.grid}>
        {LEGAL_PAGES.map((p) => (
          <Link key={p.href} href={p.href} className={styles.card}>
            <h2 className={styles.cardTitle}>{p.title}</h2>
            <p className={styles.cardDesc}>{p.description}</p>
          </Link>
        ))}
      </div>
    </StaticPage>
  );
}
