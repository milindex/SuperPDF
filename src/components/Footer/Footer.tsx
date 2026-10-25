import Link from "next/link";
import SuperPDFLogo from "@/components/logos/SuperPDFLogo";
import { APP_VERSION } from "@/lib/version";
import styles from "./Footer.module.scss";

const footerLinks: Record<string, { name: string; href: string }[]> = {
  Product: [
    { name: "All tools", href: "/tools" },
    { name: "Workflow", href: "/workflow" },
    { name: "How it works", href: "/#how-it-works" },
    { name: "FAQ", href: "/faq" },
    { name: "Changelog", href: "/changelog" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
  ],
  Legal: [
    { name: "Privacy policy", href: "/privacy" },
    { name: "Terms and conditions", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
    { name: "Security", href: "/security-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink} aria-label="SuperPDF home">
              <SuperPDFLogo style={{ height: 32, width: "auto" }} />
            </Link>
            <p className={styles.statement}>
              PDF tools for the files you would rather not upload. Everything
              runs in this tab.
            </p>
          </div>

          <div className={styles.grid}>
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className={styles.column}>
                <h2 className={styles.columnTitle}>{category}</h2>
                <ul className={styles.columnList}>
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.columnLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            &copy; 2026 Milind Sonawane
          </span>
          <span className={styles.version}>SuperPDF v{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
}
