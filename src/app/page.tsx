import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import ToolsFilter from "@/components/ToolsFilter/ToolsFilter";
import Testimonials from "@/components/Testimonials/Testimonials";
import FAQSection from "@/components/FAQSection/FAQSection";
import { tools } from "@/data/homepage-tools";
import { testimonials, features, stats, faqs } from "@/data/homepage-content";
import styles from "./page.module.scss";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SuperPDF",
  description:
    "Privacy-first PDF toolkit that runs entirely in your browser. Merge, split, compress, and convert PDFs without uploading files.",
  url: "https://SuperPDF.com",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "PDF Merge",
    "PDF Split",
    "PDF Compression",
    "PDF to Word Conversion",
    "PDF to Excel Conversion",
    "PDF Editing",
    "Digital Signatures",
    "PDF Security",
    "PDF OCR",
    "80+ PDF Tools",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Tools Grid */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.head}>
            <h2 className={styles.h2}>Powerful PDF Tools</h2>
            <p className={styles.sub}>
              Everything you need to work with PDFs, all in one place
            </p>
          </div>
          <ToolsFilter tools={tools} />
        </div>
      </section>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <div className={styles.heroBadge}>
              <div className={styles.heroBadgeDot} />
              Private by design — files never leave your browser
            </div>

            <h1 className={styles.heroTitle}>SuperPDF</h1>

            <p className={styles.heroSubtitle}>
              The ultimate privacy-first PDF toolkit. Merge, split, compress,
              and convert your PDFs instantly — all without uploading a single
              file.
            </p>

            <div className={styles.heroActions}>
              <Link href="/tools/merge-pdf" className={styles.primaryBtn}>
                Start Using Tools
                <span className={styles.arrowIcon}>
                  <Icon name="arrow-right" size={20} />
                </span>
              </Link>
              <a href="#features" className={styles.secondaryBtn}>
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className={`${styles.floatEl} ${styles.floatEl1}`} />
        <div className={`${styles.floatEl} ${styles.floatEl2}`} />
        <div className={`${styles.floatEl} ${styles.floatEl3}`} />
      </section>

      {/* Quick Stats */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <div className={styles.statIcon}>
                  <Icon name={stat.icon} size={32} />
                </div>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.head}>
            <h2 className={styles.h2}>Why Choose SuperPDF?</h2>
            <p className={styles.sub}>
              Built with privacy, performance, and user experience at its core
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`animate-border-run ${styles.featureCard}`}
              >
                <div className={styles.featureIcon}>
                  <Icon name={feature.icon} size={32} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={`${styles.container} ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Ready to Transform Your PDFs?</h2>
          <p className={styles.ctaSub}>
            Join thousands of users who trust SuperPDF for their document
            processing needs
          </p>
          <Link href="/tools/merge-pdf" className={styles.ctaBtn}>
            Get Started Now
            <span className={styles.arrowIcon}>
              <Icon name="arrow-right" size={24} />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
