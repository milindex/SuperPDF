import styles from "./DocumentStack.module.scss";

/**
 * A pile of paper with a live metadata card. Used as the hero's right-hand
 * plate instead of a screenshot — it gives the page a PDF-specific motif that
 * is not tied to any one tool.
 */
export default function DocumentStack() {
  return (
    <div className={styles.stack} aria-hidden="true">
      <div className={styles.board}>
        <span className={`tick ${styles.tickTopLeft}`} />
        <span className={`tick ${styles.tickTopRight}`} />
        <span className={`tick ${styles.tickBottomLeft}`} />
        <span className={`tick ${styles.tickBottomRight}`} />

        <div className={`${styles.sheet} ${styles.sheetBack}`}>
          <span className={styles.sheetRule} />
          <span className={styles.sheetLine} />
          <span className={styles.sheetLineShort} />
          <span className={styles.sheetFolio}>03</span>
        </div>

        <div className={`${styles.sheet} ${styles.sheetMid}`}>
          <span className={styles.sheetRule} />
          <span className={styles.sheetLine} />
          <span className={styles.sheetLineShort} />
          <span className={styles.sheetFolio}>02</span>
        </div>

        <div className={`${styles.sheet} ${styles.sheetFront}`}>
          <span className={styles.fold} />
          <div className={styles.docHead}>
            <span className={styles.docEyebrow}>Annual report · 2026</span>
            <span className={styles.docType}>PDF</span>
          </div>
          <span className={styles.docTitle} />
          <span className={styles.docTitleShort} />
          <div className={styles.docLines}>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <span className={styles.redaction} />
          <div className={styles.docLines}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.docFoot}>
            <span>SuperPDF</span>
            <span>01 / 64</span>
          </div>
        </div>

        <div className={styles.metaCard}>
          <p className={`hud-label ${styles.metaLabel}`}>File profile</p>
          <dl className={styles.metaList}>
            <div>
              <dt>Pages</dt>
              <dd>64</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>4.2 MB</dd>
            </div>
            <div>
              <dt>Encryption</dt>
              <dd>AES-256</dd>
            </div>
            <div>
              <dt>Server copy</dt>
              <dd className={styles.safe}>None</dd>
            </div>
          </dl>
          <p className={styles.local}>
            <span className={styles.localDot} />
            Processing locally
          </p>
        </div>

        <span className={styles.sideNote}>Sheet 01 · on device</span>
      </div>
    </div>
  );
}
