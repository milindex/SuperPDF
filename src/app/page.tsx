import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/Section/Section";
import ShareRow from "@/components/ShareRow/ShareRow";
// Hidden with the hero figure for now.
// import WorkbenchPreview from "@/components/WorkbenchPreview/WorkbenchPreview";
import SuperPDFIcon from "@/components/logos/SuperPDFIcon";
import DocumentStack from "@/components/DocumentStack/DocumentStack";
import ToolsFilter from "@/components/ToolsFilter/ToolsFilter";
import RecentBanner from "@/components/RecentBanner/RecentBanner";
import FAQSection from "@/components/FAQSection/FAQSection";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { faqs } from "@/data/homepage-content";
import { toolsRegistry } from "@/registry/tools";
import { APP_VERSION } from "@/lib/version";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_GITHUB,
  SITE_URL,
  absoluteUrl,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "PDF tools that never upload your files",
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: "PDF tools that never upload your files | SuperPDF" },
};

const toolCount = toolsRegistry.length;

function GalleryShot({ name, alt }: { name: string; alt: string }) {
  return (
    <div className={styles.shotMedia}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.shotLight}
        src={`/images/screenshots/${name}.webp`}
        alt={alt}
        width={1440}
        height={900}
        loading="lazy"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.shotDark}
        src={`/images/screenshots/${name}-dark.webp`}
        alt={alt}
        width={1440}
        height={900}
        loading="lazy"
      />
    </div>
  );
}

const highlights = [
  {
    title: "Your file stays yours",
    body: "The document opens in this tab and stays on your device. There is no server copy, no upload wait, and nothing to delete afterwards.",
  },
  {
    title: "Nothing to sign up for",
    body: "No account, no email, no daily cap and no watermark. Open the tool you need and get on with your day.",
  },
  {
    title: "Everyday PDF jobs",
    body: `Merge, split, compress, convert, sign, redact and more — ${toolCount} tools in one calm place.`,
  },
  {
    title: "Kind to sensitive files",
    body: "Contracts, invoices, client files and medical records do not need a detour through someone else's server.",
  },
  {
    title: "Works when the signal drops",
    body: "Install it once and the tools keep working offline. OCR downloads its language pack on first use.",
  },
  {
    title: "Free, with no catch",
    body: "Open source, no ads and no upsell. The only real limit is your device's memory.",
  },
];

const steps = [
  {
    title: "Pick the job",
    body: "Merge, split, compress, convert, sign, or line up a few steps in a workflow.",
  },
  {
    title: "Add the file",
    body: "Choose it from your device. Nothing is sent to a server.",
  },
  {
    title: "Take the result",
    body: "Download the finished file. Close the tab and the working copy is gone.",
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
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  image: absoluteUrl(OG_IMAGE.url),
  screenshot: absoluteUrl(OG_IMAGE.url),
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript and HTML5.",
  softwareVersion: APP_VERSION,
  isAccessibleForFree: true,
  sameAs: [SITE_GITHUB],
  license: "https://opensource.org/licenses/MIT",
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Merge PDF",
    "Split PDF",
    "Compress PDF",
    "PDF to Word",
    "PDF to Excel",
    "Sign PDF",
    "Protect PDF",
    "Redact PDF",
    "OCR",
    "Offline use",
    "No upload",
    `${toolCount} browser-based PDF tools`,
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <JsonLd data={faqJsonLd(faqs)} />

      <Section
        id="superpdf"
        number="01"
        label="SuperPDF"
        meta="Private PDF tools · Public Beta"
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
            </div>

            <h1 className={styles.heroTitle} data-reveal>
              Your PDFs <span className={styles.accent}>never leave</span> this
              tab.
            </h1>

            <p className={styles.heroLede} data-reveal>
              Merge, split, compress, convert, sign and protect PDFs without
              sending them anywhere. No account, no tracking, no cloud — just the
              work, done on your device.
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

        {/*
          Hidden for now, kept for reference. Re-enable the WorkbenchPreview
          import above when this figure is turned back on.
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
        */}

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
            PDF work without the <span className={styles.accent}>worry</span>.
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

      {/*
        Screenshots are hidden for now, kept for reference.
      <Section
        id="gallery"
        number="03"
        label="Screenshots"
        meta="Captured in SuperPDF"
        bodyClassName={styles.galleryBody}
      >
        <div className={styles.galleryGrid} data-reveal-group>
          <figure className={styles.shotWide} data-reveal>
            <GalleryShot
              name="split-report"
              alt="Split PDF with a page-range field and a live preview of a Northwind annual report"
            />
            <figcaption className={styles.shotCaption}>
              <span className={`hud-label ${styles.captionLabel}`}>
                Split a report into the pages you need
              </span>
              <span className={`hud-label ${styles.captionMeta}`}>01</span>
            </figcaption>
          </figure>
          <figure className={styles.shot} data-reveal>
            <GalleryShot
              name="tool-search"
              alt="Searching the SuperPDF tool list for compress and seeing matching tools"
            />
            <figcaption className={styles.shotCaption}>
              <span className={`hud-label ${styles.captionLabel}`}>
                Search every tool by the job
              </span>
              <span className={`hud-label ${styles.captionMeta}`}>02</span>
            </figcaption>
          </figure>
          <figure className={styles.shot} data-reveal>
            <GalleryShot
              name="merge-files"
              alt="Merging three sample PDFs with reorder handles and a file preview"
            />
            <figcaption className={styles.shotCaption}>
              <span className={`hud-label ${styles.captionLabel}`}>
                Merge a client pack in order
              </span>
              <span className={`hud-label ${styles.captionMeta}`}>03</span>
            </figcaption>
          </figure>
        </div>
      </Section>
      */}

      <Section
        id="tools"
        number="03"
        label="The workbench"
        meta={`${toolCount} tools · On your device`}
        bodyClassName={styles.toolsBody}
      >
        <div className={styles.toolsHead} data-reveal-group>
          <h2 className={styles.sectionTitle} data-reveal>
            Every tool, <span className={styles.accent}>one place</span>.
          </h2>
          <p className={styles.sectionLede} data-reveal>
            Search by the job, or filter by category. Every tool works on your
            device, so the file stays with you.
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
        number="04"
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
        number="05"
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
        number="06"
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
