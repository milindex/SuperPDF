import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import StaticPage from "@/components/StaticPage/StaticPage";
import { businessBenefits, businessUseCases } from "@/data/page-content";
import styles from "./page.module.scss";

export default function BusinessPage() {
  return (
    <StaticPage
      title="SuperPDF for Business"
      intro="Handle sensitive documents without exposing them. SuperPDF's browser-native tools keep every file on the device — ideal for teams that work with confidential client data."
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
        <h2 className={styles.sectionTitle}>Why teams choose SuperPDF</h2>
        <ul className={styles.benefitList}>
          {businessBenefits.map((b) => (
            <li key={b} className={styles.benefit}>
              <span className={styles.benefitCheck}>✓</span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.workflow}>
        <h2 className={styles.sectionTitle}>How it fits into your workflow</h2>
        <p className={styles.workflowText}>
          SuperPDF works alongside your existing tools. Employees open a tool,
          drop in a file, and download the result — no training, no accounts, no
          IT setup. Because processing is local, documents used for contracts,
          proposals, and client files never leave the organization.
        </p>
        <p className={styles.workflowText}>
          The same engines that protect files with AES-256 also compress, sign,
          and convert them — giving teams one private toolset for common PDF
          tasks.
        </p>
      </section>

      <p className={styles.cta}>
        Want to roll SuperPDF out across your team?{" "}
        <Link href="/contact" className={styles.link}>
          Contact us
        </Link>
        .
      </p>
    </StaticPage>
  );
}