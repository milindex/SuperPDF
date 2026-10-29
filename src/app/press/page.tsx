import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { pressBoilerplate, pressFacts } from "@/data/page-content";
import { LEGAL_LAST_UPDATED, pageMetadata } from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Press",
  description:
    "Press information, fact sheet and media contact for SuperPDF.",
  path: "/press",
});

export default function PressPage() {
  return (
    <StaticPage
      centered
      path="/press"
      title="Press"
      intro="Press information and a short fact sheet."
      updated={LEGAL_LAST_UPDATED}
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
          <a href="mailto:connect@milinds.dev">connect@milinds.dev</a>.
        </p>
      </section>

      <p className={styles.note}>
        Founder: Milind Sonawane. Read more{" "}
        <Link href="/about" className={styles.link}>
          about the project
        </Link>
        .
      </p>
    </StaticPage>
  );
}