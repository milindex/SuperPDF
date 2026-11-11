import Icon from "@/components/Icon/Icon";
import FAQSection from "@/components/FAQSection/FAQSection";
import ShareRow from "@/components/ShareRow/ShareRow";
import StaticPage from "@/components/StaticPage/StaticPage";
import SupportCta from "@/components/SupportCta/SupportCta";
import {
  GITHUB_SPONSORS_URL,
  fundingItems,
  supportFaqs,
  supportWays,
  supporters,
} from "@/data/support-content";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Support SuperPDF",
  description:
    "SuperPDF is free and open source. Support the project on Ko-fi to cover hosting, dependencies and the time behind new PDF tools.",
  path: "/support",
});

const facts = [
  { value: "0", label: "Uploads" },
  { value: "0", label: "Accounts" },
  { value: "100%", label: "Free to use" },
  { value: "MIT", label: "Licensed" },
];

export default function SupportPage() {
  return (
    <StaticPage
      centered
      path="/support"
      title="Support SuperPDF"
      intro="SuperPDF is free, open source and has no ads, accounts or uploads. If it saves you time, you can help cover what it costs to keep running."
    >
      <section className={styles.hero} aria-labelledby="support-hero-title">
        <div className={styles.heroCopy}>
          <p className={`hud-label ${styles.kicker}`}>
            No paywall. No ads. No catch.
          </p>
          <h2 id="support-hero-title" className={styles.heroTitle}>
            Keep the tools free for everyone.
          </h2>
          <p className={styles.heroText}>
            There is no premium tier to sell, because the files never touch a
            server. Donations pay for the small, unglamorous costs of running
            the project and buy time for the next tool.
          </p>
          <div className={styles.actions}>
            <SupportCta label="Buy me a coffee" />
            {GITHUB_SPONSORS_URL && (
              <a
                href={GITHUB_SPONSORS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryAction}
              >
                Sponsor on GitHub
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            )}
          </div>
          <p className={`hud-label ${styles.note}`}>
            One-off or monthly · Ko-fi opens in a new tab
          </p>
        </div>

        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt className={`hud-label ${styles.factLabel}`}>{fact.label}</dt>
              <dd className={styles.factValue}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.block} aria-labelledby="funding-title">
        <div className={styles.blockHead}>
          <p className={`hud-label ${styles.eyebrow}`}>Where it goes</p>
          <h2 id="funding-title" className={styles.blockTitle}>
            A small budget, spent carefully.
          </h2>
          <p className={styles.blockLede}>
            Donations are not revenue. They cover the bills first; anything left
            over becomes development time.
          </p>
        </div>
        <ul className={styles.fundingGrid}>
          {fundingItems.map((item) => (
            <li key={item.title} className={styles.fundingCard}>
              <span className={styles.cardIcon} aria-hidden="true">
                <Icon name={item.icon} size={22} />
              </span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby="ways-title">
        <div className={styles.blockHead}>
          <p className={`hud-label ${styles.eyebrow}`}>Ways to help</p>
          <h2 id="ways-title" className={styles.blockTitle}>
            Money is one option. Not the only one.
          </h2>
        </div>
        <div className={styles.waysGrid}>
          {supportWays.map((way) => (
            <a
              key={way.title}
              href={way.href}
              target={way.external ? "_blank" : undefined}
              rel={way.external ? "noopener noreferrer" : undefined}
              className={styles.wayCard}
            >
              <span className={styles.cardIcon} aria-hidden="true">
                <Icon name={way.icon} size={22} />
              </span>
              <h3 className={styles.cardTitle}>{way.title}</h3>
              <p className={styles.cardDesc}>{way.description}</p>
              <span className={styles.wayAction}>
                {way.action}
                <Icon name="arrow-right" size={14} />
                {way.external && (
                  <span className="visually-hidden">
                    {" "}
                    (opens in a new tab)
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
        <div className={styles.shareWrap}>
          <p className={`hud-label ${styles.shareLabel}`}>
            Or pass it on
          </p>
          <ShareRow title="SuperPDF: PDF tools that never upload your files" />
        </div>
      </section>

      {supporters.length > 0 && (
        <section className={styles.block} aria-labelledby="supporters-title">
          <div className={styles.blockHead}>
            <p className={`hud-label ${styles.eyebrow}`}>Thank you</p>
            <h2 id="supporters-title" className={styles.blockTitle}>
              Supporters
            </h2>
            <p className={styles.blockLede}>
              Named only with permission. Adding your name is always optional.
            </p>
          </div>
          <ul className={styles.supporterList}>
            {supporters.map((supporter) => (
              <li key={supporter.name} className={styles.supporter}>
                {supporter.href ? (
                  <a
                    href={supporter.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.supporterName}
                  >
                    {supporter.name}
                  </a>
                ) : (
                  <span className={styles.supporterName}>{supporter.name}</span>
                )}
                {supporter.message && (
                  <p className={styles.supporterMessage}>{supporter.message}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.block}>
        <FAQSection
          faqs={supportFaqs}
          heading="Questions about donating"
          description="What a donation does, and what it does not."
        />
      </div>

      <p className={styles.thanks}>
        Every tip is read, and every bug report is appreciated. Thank you.
      </p>
    </StaticPage>
  );
}
