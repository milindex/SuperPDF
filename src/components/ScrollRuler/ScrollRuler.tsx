"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./ScrollRuler.module.scss";

interface RulerSection {
  id: string;
  label: string;
  number: string;
  top: number;
}

/**
 * Custom document ruler on the right edge, modelled on the ArtCraft site.
 *
 * Ticks are drawn at 1% of the document height (one tick per percent, in
 * document pixels, so the rail literally scrolls with the page). Every fifth
 * tick gets a label and a longer rule. Section links sit in the lower-right
 * margin and jump to their section; the active one is highlighted.
 *
 * The native scrollbar is hidden on desktop by the boot script in the root
 * layout, which also reserves the rail gutter before first paint.
 */
export default function ScrollRuler() {
  const pathname = usePathname();
  const railRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const sectionsRef = useRef<RulerSection[]>([]);
  const [docHeight, setDocHeight] = useState(0);
  const [sections, setSections] = useState<RulerSection[]>([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const measure = () => {
      const enabled = wide.matches;
      document.documentElement.setAttribute(
        "data-ruler",
        enabled ? "on" : "off",
      );
      setVisible(enabled);
      const height = document.documentElement.scrollHeight;
      setDocHeight(height);

      const found = Array.from(
        document.querySelectorAll<HTMLElement>("[data-ruler-label]"),
      ).map((element) => ({
        id: element.id,
        label: element.dataset.rulerLabel ?? "",
        number: element.dataset.rulerNumber ?? "",
        top: element.getBoundingClientRect().top + window.scrollY,
      }));
      sectionsRef.current = found;
      setSections(found);
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (layerRef.current) {
        layerRef.current.style.transform = `translate3d(0, ${-y}px, 0)`;
      }

      const total = document.documentElement.scrollHeight;
      const maxScroll = Math.max(1, total - window.innerHeight);
      const progress = Math.max(0, Math.min(1, y / maxScroll));
      if (total > 0) {
        railRef.current?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
      }
      if (needleRef.current && railRef.current) {
        const start = 60;
        const available = Math.max(0, railRef.current.clientHeight - start);
        needleRef.current.style.transform = `translate3d(0, ${progress * available}px, 0)`;
      }
      if (percentRef.current) {
        percentRef.current.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")}%`;
      }

      if (sectionsRef.current.length > 0) {
        const line = y + 120;
        let next = 0;
        for (let index = 0; index < sectionsRef.current.length; index += 1) {
          if (sectionsRef.current[index].top <= line) next = index;
        }
        setActive((current) => (current === next ? current : next));
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    measure();
    update();

    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    wide.addEventListener("change", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    // Re-run the active-section check when the measured list changes.
    if (sections.length === 0) return;
    const y = window.scrollY;
    const line = y + 120;
    let next = 0;
    for (let index = 0; index < sections.length; index += 1) {
      if (sections[index].top <= line) next = index;
    }
    setActive(next);
  }, [sections]);

  useEffect(() => {
    // The rail mounts after `visible` flips; position it for the current scroll
    // (including a restored scroll position) without waiting for the next event.
    if (!visible) return;
    const y = window.scrollY;
    if (layerRef.current) {
      layerRef.current.style.transform = `translate3d(0, ${-y}px, 0)`;
    }
    const total = document.documentElement.scrollHeight;
    const maxScroll = Math.max(1, total - window.innerHeight);
    const progress = Math.max(0, Math.min(1, y / maxScroll));
    railRef.current?.setAttribute(
      "aria-valuenow",
      String(Math.round(progress * 100)),
    );
    if (needleRef.current && railRef.current) {
      const start = 60;
      const available = Math.max(0, railRef.current.clientHeight - start);
      needleRef.current.style.transform = `translate3d(0, ${progress * available}px, 0)`;
    }
    if (percentRef.current) {
      percentRef.current.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")}%`;
    }
  }, [visible, docHeight]);

  if (!visible) return null;

  const ticks: { top: number; major: boolean; label?: number }[] = [];
  for (let percent = 0; percent <= 100; percent += 1) {
    ticks.push({
      top: (docHeight * percent) / 100,
      major: percent % 5 === 0,
      label: percent % 5 === 0 ? percent : undefined,
    });
  }

  const jump = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const documentY =
      window.scrollY + (event.clientY - rect.top) - 60;
    window.scrollTo({
      top: Math.max(0, Math.min(documentY, docHeight - window.innerHeight)),
      behavior: "smooth",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const page = window.innerHeight * 0.85;
    if (event.key === "ArrowDown") window.scrollBy({ top: 80 });
    else if (event.key === "ArrowUp") window.scrollBy({ top: -80 });
    else if (event.key === "PageDown") window.scrollBy({ top: page });
    else if (event.key === "PageUp") window.scrollBy({ top: -page });
    else if (event.key === "Home") window.scrollTo({ top: 0 });
    else if (event.key === "End") window.scrollTo({ top: docHeight });
    else return;
    event.preventDefault();
  };

  return (
    <div className={styles.zone}>
      <div
        ref={railRef}
        className={styles.rail}
        role="scrollbar"
        aria-label="Page scroll ruler"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onPointerDown={jump}
        onKeyDown={onKeyDown}
      >
        <div
          ref={layerRef}
          className={styles.layer}
          style={{ height: docHeight || undefined }}
          aria-hidden="true"
        >
          {ticks.map((tick) => (
            <span
              key={`tick-${tick.top}`}
              className={`${styles.tick} ${tick.major ? styles.major : ""}`}
              style={{ top: tick.top }}
            />
          ))}
          {ticks
            .filter((tick) => tick.label !== undefined)
            .map((tick) => (
              <span
                key={`label-${tick.top}`}
                className={styles.label}
                style={{ top: tick.top }}
              >
                {tick.label}
              </span>
            ))}
          {sections.map((section, index) => (
            <span
              key={section.id}
              className={`${styles.sectionMark} ${
                index === active ? styles.sectionMarkActive : ""
              }`}
              style={{ top: section.top }}
            >
              <span className={styles.sectionMarkNumber}>{section.number}</span>
              {section.label}
            </span>
          ))}
        </div>
        <div ref={needleRef} className={styles.needle} aria-hidden="true">
          <span ref={percentRef} className={styles.needleLabel}>
            000%
          </span>
        </div>
        {sections.length > 0 && (
          <span className={styles.currentSection} aria-hidden="true">
            <span className={styles.currentNumber}>
              {sections[active]?.number}
            </span>
            {sections[active]?.label}
          </span>
        )}
      </div>
    </div>
  );
}
