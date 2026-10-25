import Link from "next/link";
import ToolsFilter from "@/components/ToolsFilter/ToolsFilter";
import { toolsRegistry } from "@/registry/tools";
import styles from "./page.module.scss";

export const metadata = {
  title: "All PDF tools",
  description:
    "Every SuperPDF tool in one list. Merge, split, compress, convert, sign, and protect PDFs without uploading them.",
};

export default function ToolsPage() {
  const toolCount = toolsRegistry.length;

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Tools</span>
        </nav>

        <header className={styles.head}>
          <h1 className={styles.title}>All {toolCount} PDF tools</h1>
          <p className={styles.intro}>
            Search by the job. Every tool runs in the browser and leaves the file on your device.
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
