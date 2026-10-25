import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import StaticPage from "@/components/StaticPage/StaticPage";
import { educationBenefits, educationUseCases } from "@/data/page-content";
import styles from "./page.module.scss";

export default function EducationPage() {
  return (
    <StaticPage
      title="SuperPDF for education"
      intro="Free PDF tools for students, teachers, and researchers. Files are read on the device, so student work does not go to a server."
    >
      <section className={styles.useCases}>
        {educationUseCases.map((u) => (
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
        <h2 className={styles.sectionTitle}>What it means for a classroom</h2>
        <ul className={styles.benefitList}>
          {educationBenefits.map((b) => (
            <li key={b} className={styles.benefit}>
              <span className={styles.benefitCheck}>✓</span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.note}>
        <h2 className={styles.sectionTitle}>A note for administrators</h2>
        <p>
          Because the work happens in the browser, there is no student file
          store to review. There are no accounts to manage and nothing to
          configure. Teachers and students open a tool and use it.
        </p>
        <p>
          Questions about using SuperPDF in your institution?{" "}
          <Link href="/contact" className={styles.link}>
            Get in touch
          </Link>
          .
        </p>
      </section>
    </StaticPage>
  );
}