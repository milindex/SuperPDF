import Link from "next/link";
import Section from "@/components/Section/Section";
import ShareRow from "@/components/ShareRow/ShareRow";
import WorkbenchPreview from "@/components/WorkbenchPreview/WorkbenchPreview";
import SuperPDFIcon from "@/components/logos/SuperPDFIcon";
import DocumentStack from "@/components/DocumentStack/DocumentStack";
import ToolsFilter from "@/components/ToolsFilter/ToolsFilter";
import RecentBanner from "@/components/RecentBanner/RecentBanner";
import FAQSection from "@/components/FAQSection/FAQSection";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { faqs } from "@/data/homepage-content";
import { toolsRegistry } from "@/registry/tools";
import { OG_IMAGE, SITE_URL, absoluteUrl, pageMetadata } from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "The open PDF workbench",
  description:
    "Merge, split, compress, convert, sign and protect PDFs in your browser. Files stay on your device, with no account and no upload.",
  path: "/",
});

const toolCount = toolsRegistry.length;

const highlights = [
  {
    title: "Private by default",
    body: "There is no document server. Every tool runs in this tab, so the file never leaves your device.",
  },
  {
    title: "Every format",
    body: `Word, Excel, PowerPoint, JPG, PNG, SVG, HTML and more. ${toolCount} tools, one workbench.`,
  },
  {
    title: "Real page work",
    body: "Reorder, rotate, delete, merge and split with drag and drop, live previews and a deep undo stack.",
  },
  {
    title: "Built-in security",
    body: "Protect, unlock, redact and sign without handing the document to anyone else's server.",
  },
  {
    title: "No account, no limits",
    body: "No sign-up wall, no watermark and no daily quota. Free and open source, all the way down.",
  },
  {
    title: "Works offline",
    body: "Install SuperPDF once and the tools keep opening with the network off. Your files stay local.",
  },
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

const stats = [
  { value: String(toolCount), label: "PDF tools" },
  { value: "0", label: "Uploads" },
  { value: "100%", label: "On device" },
  { value: "MIT", label: "Licensed" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#webapp`,
  name: "SuperPDF",
  description:
    "A private, browser-native PDF workbench. Merge, split, compress, convert and sign files without uploading them.",
  url: SITE_URL,
  image: absoluteUrl(OG_IMAGE.url),
  screenshot: absoluteUrl(OG_IMAGE.url),
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  isAccessibleForFree: true,
  publisher: { "@id": `${SITE_URL}/#organization` },
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
      <JsonLd data={structuredData} />

      <Section
        id="superpdf"
        number="01"
        label="SuperPDF"
        meta="PDF workbench · Public Beta"
        bodyClassName={styles.heroWrap}
      >
        <div className={styles.heroIntro} data-reveal-group>
          <div className={styles.heroCopy}>
            <div className={styles.heroKicker} data-reveal>
              <SuperPDFIcon className={styles.heroKickerIcon} title="" />
              <span className={styles.heroWord}>
                Super<span className={styles.accent}>PDF</span>
              </span>
              <span className={styles.kickerRule} aria-hidden="true" />
              <span className={`hud-label ${styles.kickerMeta}`}>
                PDF workbench · v3
              </span>
            </div>

            <h1 className={styles.heroTitle} data-reveal>
              The PDF workbench you already{" "}
              <span className={styles.accent}>know</span> how to use.
            </h1>

            <p className={styles.heroLede} data-reveal>
              Merge, split, compress, convert, sign and protect PDFs in a fast,
              private workbench that runs entirely in your browser. No account,
              no telemetry, no cloud.
            </p>

            <div className={styles.heroActions} data-reveal>
              <div className={styles.ctaBlock}>
                <Link href="#tools" className={styles.primaryCta}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 17V3" />
                    <path d="m6 11 6 6 6-6" />
                    <path d="M19 21H5" />
                  </svg>
                  Find a tool
                </Link>
                <span className={`hud-label ${styles.ctaNote}`}>
                  No upload · No account
                </span>
              </div>
              <a
                href="https://github.com/milindex/SuperPDF"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryCta}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                View on GitHub
              </a>
            </div>

            <p className={`hud-label ${styles.platforms}`} data-reveal>
              macOS · Windows · Linux · ChromeOS · Web · Free and open source
            </p>

            <div className={styles.heroShare} data-reveal>
              <ShareRow title="SuperPDF: The open PDF workbench" />
            </div>

            <div className={styles.reportRow} data-reveal>
              <a
                href="https://github.com/milindex/SuperPDF/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={`hud-label ${styles.reportLink}`}
              >
                Report issues here
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.heroStack} data-reveal>
            <DocumentStack />
          </div>
        </div>

        <figure className={styles.heroFigure} data-reveal>
          <div className={styles.figureCaption}>
            <figcaption className={`hud-label ${styles.captionLabel}`}>
              Pages, tools and document state in one window
            </figcaption>
            <p className={`hud-label ${styles.captionMeta}`}>Preview</p>
          </div>
          <div className={styles.heroShot}>
            <WorkbenchPreview variant="hero" />
          </div>
        </figure>
      </Section>

      <Section
        id="highlights"
        number="02"
        label="Highlights"
        meta="PDF workbench"
        bodyClassName={styles.highlightsBody}
      >
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} data-reveal>
            What&apos;s <span className={styles.accent}>inside</span>.
          </h2>
        </div>
        <ol className={styles.highlightList} data-reveal-group>
          {highlights.map((item, index) => (
            <li key={item.title} className={styles.highlightRow} data-reveal>
              <span className={`hud-label ${styles.highlightIndex}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.highlightTitle}>{item.title}</h3>
              <p className={styles.highlightBody}>{item.body}</p>
              <span className={styles.highlightSignal} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="gallery"
        number="03"
        label="Screenshots"
        meta="Captured in SuperPDF"
        bodyClassName={styles.galleryBody}
      >
        <div className={styles.galleryGrid} data-reveal-group>
          <figure className={styles.shotWide} data-reveal>
            <WorkbenchPreview variant="organize" />
            <figcaption className={styles.shotCaption}>
              <span className={`hud-label ${styles.captionLabel}`}>
                Organize pages like cards
              </span>
              <span className={`hud-label ${styles.captionMeta}`}>01</span>
            </figcaption>
          </figure>
          <figure className={styles.shot} data-reveal>
            <WorkbenchPreview variant="palette" />
            <figcaption className={styles.shotCaption}>
              <span className={`hud-label ${styles.captionLabel}`}>
                A command palette for every tool
              </span>
              <span className={`hud-label ${styles.captionMeta}`}>02</span>
            </figcaption>
          </figure>
          <figure className={styles.shot} data-reveal>
            <WorkbenchPreview variant="reader" />
            <figcaption className={styles.shotCaption}>
              <span className={`hud-label ${styles.captionLabel}`}>
                Two-up read mode, dark theme
              </span>
              <span className={`hud-label ${styles.captionMeta}`}>03</span>
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section
        id="tools"
        number="04"
        label="The workbench"
        meta={`${toolCount} tools · Runs locally`}
        bodyClassName={styles.toolsBody}
      >
        <div className={styles.toolsHead} data-reveal-group>
          <h2 className={styles.sectionTitle} data-reveal>
            Every tool, <span className={styles.accent}>one place</span>.
          </h2>
          <p className={styles.sectionLede} data-reveal>
            Search by the job, or filter by category. Every tool runs in the
            browser and leaves the file on your device.
          </p>
        </div>
        <p className={`hud-label ${styles.legend}`}>
          <span className={styles.legendPill}>WIP</span>
          Limited preview — the tool runs, and the known gap is on its page.
        </p>
        <RecentBanner />
        <div className={styles.toolsFinder} data-reveal>
          <ToolsFilter />
        </div>
      </Section>

      <Section
        id="how-it-works"
        number="05"
        label="How it works"
        meta="Three steps, no upload"
        bodyClassName={styles.stepsBody}
      >
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} data-reveal>
            Three steps, and the file{" "}
            <span className={styles.accent}>stays with you</span>.
          </h2>
        </div>
        <ol className={styles.stepGrid} data-reveal-group>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step} data-reveal>
              <span className={`hud-label ${styles.stepNumber}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="faq"
        number="06"
        label="Questions"
        meta="Privacy, formats, limits"
        bodyClassName={styles.faqBody}
      >
        <div data-reveal>
          <FAQSection
            faqs={faqs}
            heading="Common questions"
            description="Privacy, formats, and what happens to your file."
          />
        </div>
      </Section>

      <Section
        id="get-superpdf"
        number="07"
        label="Get SuperPDF"
        meta="Free · Open source"
        bodyClassName={styles.closingBody}
      >
        <div className={styles.closing} data-reveal-group>
          <p className={`hud-label ${styles.closingKicker}`} data-reveal>
            The workbench is already open
          </p>
          <h2 className={styles.closingTitle} data-reveal>
            Bring the file.{" "}
            <span className={styles.closingSerif}>Keep the file.</span>
          </h2>
          <p className={styles.closingLede} data-reveal>
            No install, no account and nothing to upload. Open a tool and the
            work happens on your device.
          </p>
          <div className={styles.closingActions} data-reveal>
            <Link href="/tools" className={styles.primaryCta}>
              Open the workbench
            </Link>
            <a
              href="https://github.com/milindex/SuperPDF"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryCta}
            >
              View source on GitHub
            </a>
          </div>
          <dl className={styles.stats} data-reveal>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt className={`hud-label ${styles.statLabel}`}>{stat.label}</dt>
                <dd className={styles.statValue}>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </>
  );
}
