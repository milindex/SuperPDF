import Link from "next/link";
import SuperPDFLogo from "@/components/logos/SuperPDFLogo";
import { APP_VERSION } from "@/lib/version";
import styles from "./Footer.module.scss";

const footerLinks: Record<string, { name: string; href: string }[]> = {
  Product: [
    { name: "All tools", href: "/tools" },
    { name: "Workflow", href: "/workflow" },
    { name: "Features", href: "/features" },
    { name: "Offline", href: "/offline" },
    { name: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { name: "How it works", href: "/#how-it-works" },
    { name: "FAQ", href: "/faq" },
    { name: "Press kit", href: "/press" },
    { name: "Support", href: "/contact" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Business", href: "/business" },
    { name: "Education", href: "/education" },
    { name: "Contact", href: "/contact" },
  ],
  Legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
    { name: "Security", href: "/security-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.frame}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink} aria-label="SuperPDF home">
              <SuperPDFLogo height={30} />
            </Link>
            <p className={styles.statement}>
              A private PDF toolkit. Your file never leaves your device.
            </p>
            <a className={styles.email} href="mailto:connect@milinds.dev">
              connect@milinds.dev
            </a>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <nav
              key={category}
              className={styles.column}
              aria-label={category}
            >
              <p className={`hud-label ${styles.columnTitle}`}>{category}</p>
              <ul className={styles.columnList}>
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={styles.columnLink}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={`hud-label ${styles.legal}`}>
            © 2026 SuperPDF ·{" "}
            <a
              href="https://milinds.dev"
              className={styles.author}
              target="_blank"
              rel="noopener noreferrer"
            >
              Milind Sonawane
            </a>
          </p>
          <p className={`hud-label ${styles.legal}`}>
            Open source · v{APP_VERSION} · No uploads, ever
          </p>
        </div>
      </div>
    </footer>
  );
}
