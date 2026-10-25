"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  clearRecent,
  getRecent,
  subscribeToRecent,
  type RecentEntry,
} from "@/lib/recent";
import styles from "./RecentBanner.module.scss";

export default function RecentBanner() {
  const [items, setItems] = useState<RecentEntry[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getRecent());
    refresh();
    return subscribeToRecent(refresh);
  }, []);

  const visible = items.slice(0, 4);

  return (
    <section className={styles.banner} aria-labelledby="recent-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id="recent-heading" className={styles.heading}>
            Recently used
          </h2>
          {visible.length > 0 && (
            <button type="button" className={styles.clear} onClick={clearRecent}>
              Clear history
            </button>
          )}
        </div>

        {visible.length > 0 ? (
          <ul className={styles.list}>
            {visible.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link href={item.href} className={styles.item}>
                  <span className={styles.kind}>
                    {item.kind === "workflow" ? "Workflow" : "Tool"}
                  </span>
                  <span className={styles.name}>{item.name}</span>
                  {item.kind === "workflow" && item.meta ? (
                    <span className={styles.meta}>{item.meta}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            Tools and workflows you open will appear here.
          </p>
        )}
      </div>
    </section>
  );
}
