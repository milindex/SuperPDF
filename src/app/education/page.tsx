import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import StaticPage from "@/components/StaticPage/StaticPage";
import { educationBenefits, educationUseCases } from "@/data/page-content";
import styles from "./page.module.scss";

export default function EducationPage() {
  return (
    <StaticPage
      title="SuperPDF for Education"
      intro="Free, privacy-first PDF tools for students, teachers, and researchers. Every file is processed on the device — no student data is ever uploaded."
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
        <h2 className={styles.sectionTitle}>Why classrooms trust SuperPDF</h2>
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
          Because SuperPDF performs all processing in the browser, it aligns
          with data-protection requirements for student information. There are
          no accounts to manage, no data stores to audit, and nothing to
          configure — teachers and students simply open a tool and use it.
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