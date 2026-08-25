import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import styles from "./StaticPage.module.scss";

export interface StaticCard {
  icon?: string;
  title: string;
  description: string;
}

export interface StaticSection {
  heading: string;
  body?: string[];
  cards?: StaticCard[];
  bullets?: string[];
}

/**
 * Shared layout for informational pages (about, faq, legal, etc.).
 * Provides a breadcrumb, page heading, intro, and structured content.
 */
export default function StaticPage({
  title,
  intro,
  updated,
  sections,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  sections?: StaticSection[];
  children?: React.ReactNode;
}) {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.crumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{title}</span>
        </nav>
        <h1 className={styles.title}>{title}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
        {updated && <p className={styles.updated}>Last updated: {updated}</p>}
        <div className={styles.body}>
          {sections?.map((section, i) => (
            <section key={i} className={styles.section}>
              {section.heading && (
                <h2 className={styles.sectionHeading}>{section.heading}</h2>
              )}
              {section.body?.map((p, j) => (
                <p key={j} className={styles.para}>
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className={styles.list}>
                  {section.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {section.cards && (
                <div className={styles.cardGrid}>
                  {section.cards.map((card, j) => (
                    <div key={j} className={styles.card}>
                      {card.icon && (
                        <div className={styles.cardIcon}>
                          <Icon name={card.icon} size={24} />
                        </div>
                      )}
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      <p className={styles.cardDesc}>{card.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
          {children}
        </div>
      </div>
    </main>
  );
}