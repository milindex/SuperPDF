import type { ReactNode } from "react";
import styles from "./Section.module.scss";

export default function Section({
  id,
  number,
  label,
  meta,
  children,
  className,
  bodyClassName,
}: {
  id: string;
  number: string;
  label: string;
  meta: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      id={id}
      className={`${styles.section} ${className ?? ""}`}
      data-choreo
      data-ruler-label={label}
      data-ruler-number={number}
    >
      <span aria-hidden="true" data-draw-rule className={styles.rule} />
      <div className={styles.frame}>
        <span
          aria-hidden="true"
          data-draw-tick
          className={`tick tick-half ${styles.tickLeft}`}
        />
        <span
          aria-hidden="true"
          data-draw-tick
          className={`tick tick-half ${styles.tickRight}`}
        />
        <div className={styles.eyebrow} data-draw-eyebrow>
          <p className={`hud-label ${styles.eyebrowLabel}`}>
            <span className={styles.number}>{number}</span>
            {label}
          </p>
          <p className={`hud-label ${styles.eyebrowMeta}`}>{meta}</p>
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </section>
  );
}
