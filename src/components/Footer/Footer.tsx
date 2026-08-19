import Link from "next/link";
import SuperPDFLogo from "@/components/logos/SuperPDFLogo";
import styles from "./Footer.module.scss";

const footerLinks: Record<string, { name: string; href: string }[]> = {
  Product: [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Tools", href: "/tools" },
    { name: "FAQ", href: "/faq" },
  ],
  Solutions: [
    { name: "Business", href: "/business" },
    { name: "Education", href: "/education" },
    { name: "Legal", href: "/legal" },
    { name: "Security", href: "/security-policy" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Press", href: "/press" },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className={styles.columnTitle}>{category}</h3>
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
        <div className={styles.bottom}>
          <Link href="/" className={styles.logoLink} aria-label="SuperPDF home">
            <SuperPDFLogo style={{ height: 40, width: "auto" }} />
          </Link>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} SuperPDF. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
