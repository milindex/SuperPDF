import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import StaticPage from "@/components/StaticPage/StaticPage";
import { businessBenefits, businessUseCases } from "@/data/page-content";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "SuperPDF for business",
  description:
    "Handle client documents without sending them to another company. Browser-based PDF tools for teams, with no upload and no account.",
  path: "/business",
});

export default function BusinessPage() {
  return (
    <StaticPage
      path="/business"
      title="SuperPDF for business"
      intro="Handle client documents without sending them to another company. Every tool runs in the browser, on the device."
    >
      <section className={styles.useCases}>
        {businessUseCases.map((u) => (
          <div key={u.title} className={styles.case}>
            <div className={styles.caseIcon}>
              <Icon name={u.icon} size={24} />
            </div>
            <h2 className={styles.caseTitle}>{u.title}</h2>
            <p className={styles.caseDesc}>{u.description}</p>
          </div>
        ))}
      </section>

      <section className={styles.benefits}>
        <h2 className={styles.sectionTitle}>What changes for the team</h2>
        <ul className={styles.benefitList}>
          {businessBenefits.map((b) => (
            <li key={b} className={styles.benefit}>
              <span className={styles.benefitCheck} aria-hidden="true">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.workflow}>
        <h2 className={styles.sectionTitle}>Where it fits</h2>
        <p className={styles.workflowText}>
          Employees open a tool, add the file, and download the result. No
          account, no install, no IT setup. Contracts, proposals, and client
          files stay inside the organisation.
        </p>
        <p className={styles.workflowText}>
          The same engines that apply AES-256 also compress, sign, and convert,
          so one private toolkit covers the common PDF work.
        </p>
      </section>

      <p className={styles.cta}>
        Want to use SuperPDF across a team?{" "}
        <Link href="/contact" className={styles.link}>
          Contact us
        </Link>
        .
      </p>
    </StaticPage>
  );
}