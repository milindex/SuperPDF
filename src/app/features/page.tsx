import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import StaticPage from "@/components/StaticPage/StaticPage";
import { TOOL_COUNT, toolsRegistry, type ToolCategory } from "@/registry/tools";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Features",
  description: `All ${TOOL_COUNT} SuperPDF tools by category, from merging and splitting to OCR, encryption, and conversion.`,
  path: "/features",
});

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  Organize: "Organize",
  "Convert To PDF": "Convert to PDF",
  "Convert From PDF": "Convert from PDF",
  Edit: "Edit and review",
  Security: "Security",
  Optimization: "Optimize",
  Extraction: "Extraction",
  "Create & Forms": "Create and forms",
};

const CATEGORY_DESCRIPTIONS: Record<ToolCategory, string> = {
  Organize: "Combine, split, reorder, and clean up documents.",
  "Convert To PDF": "Turn Office documents, images, text, and pages into PDFs.",
  "Convert From PDF": "Pull content out and turn PDFs into other formats.",
  Edit: "Sign, redact, watermark, resize, and fill documents.",
  Security: "Protect, unlock, and manage document metadata.",
  Optimization: "Compress, repair, run OCR, and prepare files for archiving.",
  Extraction: "Pull text and images out of PDFs.",
  "Create & Forms": "Scan with your camera and fill in digital forms.",
};

const PILLARS = [
  {
    icon: "security",
    title: "No upload",
    description:
      "The file is read on your device. There is no server copy to leak, sell, or delete.",
  },
  {
    icon: "rocket",
    title: "No waiting on a network",
    description:
      "Processing starts when you add the file. Most tasks finish in seconds, and large files often beat a server round trip.",
  },
  {
    icon: "check",
    title: "Free, no account",
    description:
      "No sign-up, no watermark, no file-count limit. Open a tool, add a file, download the result.",
  },
  {
    icon: "convert",
    title: "Real PDF engines",
    description:
      "The PDF engines run in the browser: pdf-lib, pdf.js, qpdf in WebAssembly, tesseract.js, docx, and xlsx.",
  },
];

export default function FeaturesPage() {
  const categories = [...new Set(toolsRegistry.map((t) => t.category))];

  return (
    <StaticPage
      path="/features"
      title="Features"
      intro={`${TOOL_COUNT} PDF tools that run in the browser, on the file you chose.`}
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
                    {tool.wip && <span className={styles.wip}>WIP</span>}
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