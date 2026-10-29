import type { CSSProperties } from "react";
import styles from "./WorkbenchPreview.module.scss";

type Variant = "hero" | "organize" | "palette" | "reader";

function PageCard({
  index,
  selected,
  rotated,
}: {
  index: number;
  selected?: boolean;
  rotated?: boolean;
}) {
  return (
    <div
      className={`${styles.page} ${selected ? styles.pageSelected : ""} ${
        rotated ? styles.pageRotated : ""
      }`}
    >
      <span className={styles.pageNumber}>{String(index).padStart(2, "0")}</span>
      <span className={styles.pageRule} />
      <span className={styles.pageLine} style={{ width: "78%" }} />
      <span className={styles.pageLine} style={{ width: "64%" }} />
      <span className={styles.pageLine} style={{ width: "82%" }} />
      <span className={styles.pageLine} style={{ width: "48%" }} />
      {selected && <span className={styles.pageScan} aria-hidden="true" />}
      {rotated && (
        <span className={styles.rotateBadge} aria-hidden="true">
          90°
        </span>
      )}
    </div>
  );
}

export default function WorkbenchPreview({
  variant = "hero",
  className,
  style,
}: {
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
}) {
  if (variant === "organize") {
    return (
      <div
        className={`${styles.shell} ${styles.organize} ${className ?? ""}`}
        style={style}
        role="img"
        aria-label="SuperPDF page organizer with a grid of page thumbnails and three pages selected"
      >
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.chromeDots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.chromeTitle}>Organize pages</span>
          <span className={styles.chromeMeta}>annual-report.pdf · 12 pages</span>
        </div>
        <div className={styles.organizeBar} aria-hidden="true">
          <span className={styles.pillActive}>Select</span>
          <span className={styles.pill}>Rotate</span>
          <span className={styles.pill}>Delete</span>
          <span className={styles.pill}>Extract</span>
          <span className={styles.spacer} />
          <span className={styles.selectionCount}>3 selected</span>
        </div>
        <div className={styles.organizeGrid} aria-hidden="true">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
            <PageCard
              key={index}
              index={index}
              selected={index === 2 || index === 3 || index === 6}
              rotated={index === 5}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "palette") {
    return (
      <div
        className={`${styles.shell} ${styles.paletteShell} ${className ?? ""}`}
        style={style}
        role="img"
        aria-label="SuperPDF command palette listing page and document tools"
      >
        <div className={styles.paletteBackdrop} aria-hidden="true">
          <span className={styles.paletteGhostRule} />
          <span className={styles.paletteGhostRule} />
          <span className={styles.paletteGhostRule} />
          <span className={styles.paletteGhostRule} />
        </div>
        <div className={styles.palette} aria-hidden="true">
          <div className={styles.paletteInput}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" strokeLinecap="round" />
            </svg>
            <span>page</span>
            <kbd>ESC</kbd>
          </div>
          <p className={`hud-label ${styles.paletteGroup}`}>Pages</p>
          <div className={`${styles.paletteRow} ${styles.paletteRowActive}`}>
            <span>Organize pages</span>
            <kbd>⌘ O</kbd>
          </div>
          <div className={styles.paletteRow}>
            <span>Rotate page</span>
            <kbd>R</kbd>
          </div>
          <div className={styles.paletteRow}>
            <span>Delete pages</span>
            <kbd>⌫</kbd>
          </div>
          <p className={`hud-label ${styles.paletteGroup}`}>Document</p>
          <div className={styles.paletteRow}>
            <span>Add page numbers</span>
            <kbd>⌘ N</kbd>
          </div>
          <div className={styles.paletteRow}>
            <span>Export page as image</span>
            <kbd>⇧ E</kbd>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "reader") {
    return (
      <div
        className={`${styles.shell} ${styles.reader} ${className ?? ""}`}
        style={style}
        role="img"
        aria-label="SuperPDF two-up read mode in the dark theme"
      >
        <div className={styles.readerBar} aria-hidden="true">
          <span>Read · Two-up</span>
          <span className={styles.readerMeta}>64 / 128</span>
        </div>
        <div className={styles.readerStage} aria-hidden="true">
          {[1, 2].map((page) => (
            <div key={page} className={styles.paper}>
              <span className={styles.paperChapter}>Chapter {page}</span>
              <span className={styles.paperTitle} />
              <span className={styles.paperTitleShort} />
              <span className={styles.paperParagraph} />
              <span className={styles.paperParagraph} />
              <span className={styles.paperParagraph} />
              <span className={styles.paperParagraphShort} />
              <span className={styles.paperFoot}>{page + 64}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.shell} ${styles.heroShell} ${className ?? ""}`}
      style={style}
      role="img"
      aria-label="The SuperPDF workbench showing a PDF split into page cards with a document panel"
    >
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.chromeDots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.chromeTitle}>annual-report.pdf</span>
        <span className={styles.chromeMeta}>64 pages · on this device</span>
      </div>

      <div className={styles.heroToolbar} aria-hidden="true">
        <span className={styles.pillActive}>Pages</span>
        <span className={styles.pill}>Edit</span>
        <span className={styles.pill}>Sign</span>
        <span className={styles.pill}>Secure</span>
        <span className={styles.spacer} />
        <span className={styles.heroChip}>Merge</span>
        <span className={styles.heroChip}>Compress</span>
        <span className={styles.heroChip}>Export</span>
      </div>

      <div className={styles.heroBody} aria-hidden="true">
        <div className={styles.rail}>
          {["page", "grid", "pen", "lock"].map((icon) => (
            <span key={icon} className={styles.railItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                {icon === "page" && (
                  <>
                    <path d="M14 3v4h4" />
                    <path d="M6 3h8l4 4v14H6z" />
                  </>
                )}
                {icon === "grid" && (
                  <>
                    <rect x="4" y="4" width="6" height="6" />
                    <rect x="14" y="4" width="6" height="6" />
                    <rect x="4" y="14" width="6" height="6" />
                    <rect x="14" y="14" width="6" height="6" />
                  </>
                )}
                {icon === "pen" && (
                  <>
                    <path d="M4 20l4-1 10-10-3-3L5 16z" />
                    <path d="M14 6l3 3" />
                  </>
                )}
                {icon === "lock" && (
                  <>
                    <rect x="5" y="11" width="14" height="10" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </>
                )}
              </svg>
            </span>
          ))}
        </div>

        <div className={styles.stage}>
          <div className={styles.stageHead}>
            <span className={styles.stageTitle}>Pages</span>
            <span className={styles.stageMeta}>Drag to reorder</span>
          </div>
          <div className={styles.heroPages}>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <PageCard
                key={index}
                index={index}
                selected={index === 2}
                rotated={index === 5}
              />
            ))}
          </div>
          <div className={styles.stageFoot}>
            <span>1 / 64</span>
            <span>Fit width</span>
          </div>
        </div>

        <div className={styles.panel}>
          <p className={`hud-label ${styles.panelLabel}`}>Document</p>
          <dl className={styles.panelList}>
            <div>
              <dt>Size</dt>
              <dd>4.2 MB</dd>
            </div>
            <div>
              <dt>Pages</dt>
              <dd>64</dd>
            </div>
            <div>
              <dt>Encryption</dt>
              <dd className={styles.panelGood}>AES-256</dd>
            </div>
            <div>
              <dt>Server copy</dt>
              <dd>None</dd>
            </div>
          </dl>
          <p className={`hud-label ${styles.panelLabel}`}>Quick actions</p>
          <div className={styles.panelActions}>
            <span>Merge</span>
            <span>Split</span>
            <span>Compress</span>
            <span>Protect</span>
          </div>
          <div className={styles.panelNote}>
            <span className={styles.panelDot} />
            Processing locally
          </div>
        </div>
      </div>
    </div>
  );
}
