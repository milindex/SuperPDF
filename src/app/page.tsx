import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import ToolsFilter from "@/components/ToolsFilter/ToolsFilter";
import FAQSection from "@/components/FAQSection/FAQSection";
import RecentBanner from "@/components/RecentBanner/RecentBanner";
import FeatureSlider from "@/components/FeatureSlider/FeatureSlider";
import { faqs } from "@/data/homepage-content";
import { toolsRegistry } from "@/registry/tools";
import styles from "./page.module.scss";

const toolCount = toolsRegistry.length;

const starterTools = [
  { name: "Merge PDF", href: "/tools/merge-pdf", icon: "merge" },
  { name: "Split PDF", href: "/tools/split-pdf", icon: "split" },
  { name: "Compress PDF", href: "/tools/compress", icon: "compress" },
  { name: "PDF to Word", href: "/tools/pdf-to-word", icon: "pdf-to-word" },
  { name: "JPG to PDF", href: "/tools/jpg-to-pdf", icon: "jpg" },
  { name: "Protect PDF", href: "/tools/protect", icon: "protect" },
];

const steps = [
  {
    title: "Pick the job",
    body: "Merge, split, compress, convert, sign, or chain several steps into a workflow.",
  },
  {
    title: "Add the file",
    body: "It is read in this tab, on your device. Nothing is sent to a server.",
  },
  {
    title: "Take the result",
    body: "Download the finished file. Reload the page and the working copy is gone.",
  },
];

const optionNotes = [
  {
    option: "Quality",
    where: "Compress",
    body: "How much detail to keep. A lower value makes a smaller file. Pages are rasterised, so text stops being selectable at every setting.",
  },
  {
    option: "Page range",
    where: "Split, extract, delete",
    body: "The pages to act on, written like 1-3, 5, 8-10. Pages you leave out are not included in the result.",
  },
  {
    option: "Position",
    where: "Page numbers, watermark",
    body: "Where the mark sits on every page. Pick top or bottom, then left, centre, or right.",
  },
  {
    option: "Password",
    where: "Protect, unlock",
    body: "The password that opens the file. It is applied in your browser and cannot be recovered, so keep a copy.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SuperPDF",
  description:
    "PDF tools that run in the browser. Merge, split, compress, convert, and sign files without uploading them.",
  url: "https://superpdf.com",
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
    "PDF Signing",
    "PDF Protection",
    "PDF OCR",
    "PDF workflows",
    `${toolCount} browser-based PDF tools`,
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 className={styles.heroTitle}>
                Do the PDF work. Skip the upload.
              </h1>
              <p className={styles.heroLede}>
                Merge, split, compress, convert, and sign PDFs without handing them to a server.
              </p>
              <div className={styles.heroActions}>
                <Link href="#tools" className={styles.primaryButton}>
                  Find a tool
                </Link>
                <Link href="#how-it-works" className={styles.secondaryButton}>
                  How it works
                </Link>
              </div>

              <div className={styles.starters}>
                <p className={styles.startersLabel}>Common jobs</p>
                <ul className={styles.starterGrid}>
                  {starterTools.map((tool) => (
                    <li key={tool.href}>
                      <Link href={tool.href} className={styles.starter}>
                        <span className={styles.starterIcon} aria-hidden="true">
                          <Icon name={tool.icon} size={18} />
                        </span>
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className={styles.starterNote}>
                  The file stays on this device.
                </p>
              </div>
            </div>

            <FeatureSlider />
          </div>
        </div>
      </section>

      <RecentBanner />

      <section id="tools" className={styles.toolsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>All {toolCount} tools</h2>
            <p className={styles.sectionLede}>
              Search by the job, or filter by category. Every tool runs in the
              browser and leaves the file on your device.
            </p>
          </div>
          <ToolsFilter />
        </div>
      </section>

      <section id="how-it-works" className={styles.howSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionLede}>
              Three steps, and the file stays with you.
            </p>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.optionsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Every setting says what it does</h2>
            <p className={styles.sectionLede}>
              No unlabelled sliders. These are the four you will meet most.
            </p>
          </div>
          <dl className={styles.optionList}>
            {optionNotes.map((item) => (
              <div key={item.option} className={styles.optionRow}>
                <dt className={styles.optionTerm}>
                  {item.option}
                  <span className={styles.optionWhere}>{item.where}</span>
                </dt>
                <dd className={styles.optionBody}>{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FAQSection
        faqs={faqs}
        heading="Common questions"
        description="Privacy, formats, and what happens to your file."
      />
    </>
  );
}
