import Link from "next/link";
import styles from "./offline.module.scss";

export const metadata = {
  title: "Offline",
  description:
    "You are offline. Saved SuperPDF pages and tools you have already visited should still open.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className={styles.main}>
      <div className={styles.panel}>
        <h1 className={styles.title}>You are offline.</h1>
        <p className={styles.body}>
          This page was not saved for offline use. The main pages and any tool
          page you have visited should still open.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Try the home page
          </Link>
          <Link href="/tools" className={styles.secondary}>
            Open the tool list
          </Link>
        </div>
      </div>
    </div>
  );
}
