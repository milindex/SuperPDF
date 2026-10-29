import Link from "next/link";
import styles from "./not-found.module.scss";

export const metadata = {
  title: "Page not found",
  description:
    "This page is not here. Head back to the PDF tools or the home page.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={styles.main}>
      <div className={styles.panel}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>This page is not in the document.</h1>
        <p className={styles.body}>
          The link may be old, or the page may have moved. Start from the tool
          list, or go back to the home page.
        </p>
        <div className={styles.actions}>
          <Link href="/tools" className={styles.primary}>
            Open the tool list
          </Link>
          <Link href="/" className={styles.secondary}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
