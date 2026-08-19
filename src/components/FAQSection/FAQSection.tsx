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
          {faqs.map((faq, index) => (
            <div key={index} className={styles.item}>
              <button
                onClick={() => toggleFaq(index)}
                className={styles.itemBtn}
                aria-expanded={openFaq === index}
              >
                <div className={styles.itemHeader}>
                  <h3 className={styles.question}>{faq.question}</h3>
                  <span
                    className={`${styles.chevron} ${
                      openFaq === index ? styles.chevronOpen : ""
                    }`}
                  >
                    <svg
                      className={styles.chevronSvg}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              </button>
              {openFaq === index && (
                <div className={styles.answer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
