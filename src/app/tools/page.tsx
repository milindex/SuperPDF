import Link from "next/link";
import ToolsFilter from "@/components/ToolsFilter/ToolsFilter";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { toolsRegistry } from "@/registry/tools";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
  pageMetadata,
} from "@/lib/seo";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "51 private PDF tools",
  description:
    "All 51 PDF tools in one list. Merge, split, compress, convert, sign and protect files without uploading them.",
  path: "/tools",
});

export default function ToolsPage() {
  const toolCount = toolsRegistry.length;

  return (
    <div className={styles.main}>
      <JsonLd
        data={itemListJsonLd({
          name: "PDF tools",
          items: toolsRegistry.map((tool) => ({
            name: tool.name,
            path: `/tools/${tool.slug}`,
          })),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "All tools", path: "/tools" },
        ])}
      />
      <div className={styles.container}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Tools</span>
        </nav>

        <header className={styles.head}>
          <h1 className={styles.title}>All {toolCount} PDF tools</h1>
          <p className={styles.intro}>
            Search by the job. Every tool works on your device, so the file
            stays with you.
          </p>
        </header>

        <p className={styles.legend}>
          <span className={styles.legendPill}>WIP</span>
          Limited preview. The tool runs, and the known gap is listed on its
          page.
        </p>

        <ToolsFilter limit={toolCount} />
      </div>
    </div>
  );
}
