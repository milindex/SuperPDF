import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { fullFaqs } from "@/data/page-content";
import styles from "./page.module.scss";

export default function FaqPage() {
  const categories = [...new Set(fullFaqs.map((f) => f.category).filter(Boolean))];

  return (
    <StaticPage
      title="Frequently Asked Questions"
      intro="Answers to common questions about SuperPDF — privacy, usage, formats, limitations, and more."
    >
      <div className={styles.categories}>
        {categories.map((cat) => (
          <section key={cat} className={styles.category}>
            <h2 className={styles.categoryTitle}>{cat}</h2>
            <div className={styles.faqList}>
              {fullFaqs
                .filter((f) => f.category === cat)
                .map((faq, i) => (
                  <details key={i} className={styles.faqItem}>
                    <summary className={styles.faqQuestion}>{faq.question}</summary>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </details>
                ))}
            </div>
          </section>
        ))}
      </div>
      <p className={styles.footerNote}>
        Still have a question?{" "}
        <Link href="/contact" className={styles.link}>
          Contact us
        </Link>{" "}
        and we'll help.
      </p>
    </StaticPage>
  );
}