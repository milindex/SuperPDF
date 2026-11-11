import Link from "next/link";
import SupportCta from "@/components/SupportCta/SupportCta";
import styles from "./SupportCallout.module.scss";

/**
 * Contextual, non-blocking nudge used on the homepage and About page. The
 * dedicated page carries the full explanation.
 */
export default function SupportCallout() {
  return (
    <aside className={styles.callout} aria-label="Support SuperPDF">
      <div className={styles.copy}>
        <p className={`hud-label ${styles.kicker}`}>Support the project</p>
        <h3 className={styles.title}>Free to use. Not free to run.</h3>
        <p className={styles.body}>
          No ads, no accounts, no uploads. If SuperPDF saved you a minute, a
          coffee helps cover the bills and the next tool.
        </p>
      </div>
      <div className={styles.actions}>
        <SupportCta variant="secondary" label="Support SuperPDF" />
        <Link href="/support" className={styles.link}>
          Where the money goes
        </Link>
      </div>
    </aside>
  );
}
