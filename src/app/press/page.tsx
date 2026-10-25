import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { pressBoilerplate, pressFacts } from "@/data/page-content";
import styles from "./page.module.scss";

export default function PressPage() {
  return (
    <StaticPage
      title="Press"
      intro="Press information and a short fact sheet."
      updated="2026"
    >
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About SuperPDF</h2>
        <p className={styles.boilerplate}>{pressBoilerplate}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Fact sheet</h2>
        <table className={styles.table}>
          <tbody>
            {pressFacts.map(([k, v]) => (
              <tr key={k}>
                <th className={styles.th}>{k}</th>
                <td className={styles.td}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Press contact</h2>
        <p className={styles.contact}>
          For media inquiries, email{" "}
          <a href="mailto:press@superpdf.com">press@superpdf.com</a>.
        </p>
      </section>

      <p className={styles.note}>
        Founder: Milind Sonawane. Read more{" "}
        <Link href="/about" className={styles.link}>
          about the project
        </Link>{" "}
        or{" "}
        <Link href="/blog" className={styles.link}>
          the blog
        </Link>
        .
      </p>
    </StaticPage>
  );
}