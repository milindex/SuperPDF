import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import styles from "./page.module.scss";

const LEGAL_PAGES = [
  {
    href: "/privacy",
    title: "Privacy Policy",
    description:
      "How we handle your documents and what little information we collect.",
  },
  {
    href: "/terms",
    title: "Terms & Conditions",
    description: "The terms governing your use of SuperPDF.",
  },
  {
    href: "/cookies",
    title: "Cookie Policy",
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
      title="Legal"
      intro="Legal information about SuperPDF — our policies and how we handle your data."
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