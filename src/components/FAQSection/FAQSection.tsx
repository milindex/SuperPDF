"use client";

import { useState } from "react";
import styles from "./FAQSection.module.scss";

interface FAQSectionProps {
  faqs: { question: string; answer: string }[];
  heading?: string;
  description?: string;
}

export default function FAQSection({
  faqs,
  heading = "Frequently Asked Questions",
  description = "Everything you need to know about SuperPDF",
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) =>
    setOpenFaq(openFaq === index ? null : index);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
          <p className={styles.subheading}>{description}</p>
        </div>
        <div className={styles.list}>
          {faqs.map((faq, index) => {
            const open = openFaq === index;
            const panelId = `faq-panel-${index}`;
            const triggerId = `faq-trigger-${index}`;

            return (
              <div key={index} className={styles.item}>
                <h3 className={styles.questionWrap}>
                  <button
                    id={triggerId}
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className={styles.itemBtn}
                    aria-expanded={open}
                    aria-controls={panelId}
                  >
                    <span className={styles.itemHeader}>
                      <span className={styles.question}>{faq.question}</span>
                      <span
                        className={`${styles.chevron} ${
                          open ? styles.chevronOpen : ""
                        }`}
                      >
                        <svg
                          className={styles.chevronSvg}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </span>
                  </button>
                </h3>
                {/* Rendered even when closed so the answer is in the HTML. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  hidden={!open}
                  className={styles.answer}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
