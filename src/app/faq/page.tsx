import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { fullFaqs } from "@/data/page-content";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "Answers on privacy, supported formats, limits, and how SuperPDF does the work in your browser.",
  path: "/faq",
});

export default function FaqPage() {
  const categories = [...new Set(fullFaqs.map((f) => f.category).filter(Boolean))];

  return (
    <StaticPage
      path="/faq"
      title="Frequently Asked Questions"
      intro="Answers on privacy, formats, limits, and how the browser does the work."
    >
      <JsonLd data={faqJsonLd(fullFaqs)} />
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
        and we will help.
      </p>
    </StaticPage>
  );
}