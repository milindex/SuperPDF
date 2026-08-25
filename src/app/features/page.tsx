import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import StaticPage from "@/components/StaticPage/StaticPage";
import { toolsRegistry, type ToolCategory } from "@/registry/tools";
import styles from "./page.module.scss";

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  Organize: "Organize",
  "Convert To PDF": "Convert To PDF",
  "Convert From PDF": "Convert From PDF",
  Edit: "Edit & Review",
  Security: "Security",
  Optimization: "Optimize",
  Extraction: "Extraction",
  "Create & Forms": "Create & Forms",
};

const CATEGORY_DESCRIPTIONS: Record<ToolCategory, string> = {
  Organize: "Combine, split, reorder, and clean up your documents.",
  "Convert To PDF": "Turn Office documents, images, text, and webpages into PDFs.",
  "Convert From PDF": "Extract content and convert PDFs into other formats.",
  Edit: "Sign, redact, watermark, resize, and fill in documents.",
  Security: "Protect, unlock, and manage document metadata.",
  Optimization: "Compress, repair, OCR, and prepare files for archiving.",
  Extraction: "Pull text and images out of PDFs.",
  "Create & Forms": "Scan with your camera and fill in digital forms.",
};

const PILLARS = [
  {
    icon: "security",
    title: "Privacy-first by design",
    description:
      "Every tool processes files locally in your browser. Documents never leave your device, so there is no server to trust, no upload to worry about, and no data to leak.",
  },
  {
    icon: "rocket",
    title: "Fast, no upload latency",
    description:
      "Because there is no network transfer, operations complete as fast as your device can compute. Large files often process faster than server-based alternatives.",
  },
  {
    icon: "check",
    title: "Free, no accounts",
    description:
      "No sign-up, no watermarks, no hidden limits. Open a tool, drop a file, and download the result.",
  },
  {
    icon: "convert",
    title: "Built on real engines",
    description:
      "SuperPDF uses proven libraries compiled for the browser — pdf-lib, pdf.js, qpdf (WASM), tesseract.js, docx, xlsx, and more.",
  },
];

export default function FeaturesPage() {
  const categories = [...new Set(toolsRegistry.map((t) => t.category))];

  return (
    <StaticPage
      title="Features"
      intro="A complete, privacy-first PDF toolkit — 44 tools that run entirely in your browser."
    >
      <section className={styles.pillars}>
        {PILLARS.map((p) => (
          <div key={p.title} className={styles.pillar}>
            <div className={styles.pillarIcon}>
              <Icon name={p.icon} size={24} />
            </div>
            <h2 className={styles.pillarTitle}>{p.title}</h2>
            <p className={styles.pillarDesc}>{p.description}</p>
          </div>
        ))}
      </section>

      <section className={styles.toolGroups}>
        <h2 className={styles.toolsHeading}>All tools</h2>
        {categories.map((cat) => (
          <div key={cat} className={styles.group}>
            <h3 className={styles.groupTitle}>{CATEGORY_LABELS[cat]}</h3>
            <p className={styles.groupDesc}>{CATEGORY_DESCRIPTIONS[cat]}</p>
            <div className={styles.toolGrid}>
              {toolsRegistry
                .filter((t) => t.category === cat)
                .map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className={styles.toolCard}
                  >
                    <div className={styles.toolIcon}>
                      <Icon name={tool.icon} size={20} />
                    </div>
                    <div>
                      <h4 className={styles.toolName}>{tool.name}</h4>
                      <p className={styles.toolDesc}>{tool.description}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </section>
    </StaticPage>
  );
}