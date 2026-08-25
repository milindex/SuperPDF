import Link from "next/link";
import Icon from "@/components/Icon/Icon";
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

export default function ToolsPage() {
  const categories = [...new Set(toolsRegistry.map((t) => t.category))];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.crumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Tools</span>
        </nav>
        <h1 className={styles.title}>All PDF Tools</h1>
        <p className={styles.intro}>
          Privacy-first PDF tools that run entirely in your browser. Your files
          never leave your device.
        </p>

        {categories.map((cat) => {
          const tools = toolsRegistry.filter((t) => t.category === cat);
          return (
            <section key={cat} className={styles.group}>
              <h2 className={styles.groupTitle}>{CATEGORY_LABELS[cat]}</h2>
              <div className={styles.grid}>
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className={styles.card}
                  >
                    <div className={styles.cardIcon}>
                      <Icon name={tool.icon} size={24} />
                    </div>
                    <div>
                      <h3 className={styles.cardName}>{tool.name}</h3>
                      <p className={styles.cardDesc}>{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}