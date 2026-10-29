"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";
import { chaseTo, smoothScrollTo } from "@/lib/smooth-scroll";
import styles from "./ScrollRuler.module.scss";

interface RulerSection {
  id: string;
  label: string;
  number: string;
  /** Document top of the section, used for click targets. */
  top: number;
  /** Centre of the sticky eyebrow, used to place the label. */
  center: number;
  /** Full document height, used for the 50%-viewport active test. */
  height: number;
}

const NAV_HEIGHT = 48;
const EDGE_PAD = 12;
const BASE = NAV_HEIGHT + EDGE_PAD;
const ZOOM_DELAY = 150;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Document ruler on the right edge, modelled on the ArtCraft scrollbar.
 *
 * At rest it is a full-document ruler: ticks sit at their real position in the
 * page and scroll with it. Hovering (or focusing / dragging) compresses the same
 * ticks into a viewport map so the whole document fits in the rail, reveals the
 * viewport bracket, and lets you click or drag anywhere to move the page.
 */
export default function ScrollRuler() {
  const pathname = usePathname();
  const railRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const needleLabelRef = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sectionsRef = useRef<RulerSection[]>([]);
  const zoomTimerRef = useRef<number | null>(null);
  const layerAnimTimerRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const zoomedRef = useRef(false);
  const ghostYRef = useRef<number | null>(null);
  const dragRef = useRef({ active: false, startY: 0, moved: 0 });
  const [visible, setVisible] = useState(false);
  const [docHeight, setDocHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [sections, setSections] = useState<RulerSection[]>([]);
  const [active, setActive] = useState(0);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const span = Math.max(1, viewportHeight - NAV_HEIGHT - EDGE_PAD * 2);

  const tickRows = useMemo(() => {
    return Array.from({ length: 101 }, (_, percent) => {
      const major = percent % 5 === 0;
      const top = (docHeight * percent) / 100;
      const compress = zoomed
        ? BASE + (percent / 100) * (span - docHeight)
        : 0;
      return (
        <div
          key={`tick-${percent}`}
          className={styles.tickRow}
          style={{
            top,
            transform: `translate3d(0, ${compress}px, 0)`,
          }}
        >
          <span
            className={`${styles.tick} ${major ? styles.major : ""}`}
          />
          {major && <span className={styles.tickLabel}>{percent}</span>}
        </div>
      );
    });
  }, [docHeight, span, zoomed]);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    let disposed = false;

    const measure = () => {
      if (disposed) return;
      const enabled = wide.matches;
      document.documentElement.setAttribute(
        "data-ruler",
        enabled ? "on" : "off",
      );
      setVisible(enabled);
      setDocHeight(document.documentElement.scrollHeight);
      setViewportHeight(window.innerHeight);

      const found = Array.from(
        document.querySelectorAll<HTMLElement>("[data-ruler-label]"),
      ).map((element) => {
        // Align the label with the sticky section eyebrow, not the section's
        // outer border. The eyebrow is the row the reader actually sees.
        const eyebrow = element.querySelector<HTMLElement>(
          "[data-draw-eyebrow]",
        );
        // Measure the non-sticky section, not the sticky eyebrow: once the
        // eyebrow pins under the header its viewport top is no longer the
        // section's document position.
        const sectionRect = element.getBoundingClientRect();
        const sectionTop = sectionRect.top + window.scrollY;
        const eyebrowHeight = eyebrow?.offsetHeight ?? 0;
        return {
          id: element.id,
          label: element.dataset.rulerLabel ?? "",
          number: element.dataset.rulerNumber ?? "",
          top: sectionTop,
          center: sectionTop + eyebrowHeight / 2,
          height: sectionRect.height,
        };
      });
      sectionsRef.current = found;
      setSections(found);
    };

    const update = () => {
      frameRef.current = 0;
      const rail = railRef.current;
      if (!rail) return;

      const y = window.scrollY;
      const total = Math.max(1, document.documentElement.scrollHeight);
      const vh = window.innerHeight;
      const maxScroll = Math.max(1, total - vh);
      const progress = clamp01(y / maxScroll);
      const base = NAV_HEIGHT + EDGE_PAD;
      const railSpan = Math.max(1, vh - NAV_HEIGHT - EDGE_PAD * 2);
      const drift = base - progress * (NAV_HEIGHT + EDGE_PAD * 2);

      if (layerRef.current && !zoomedRef.current) {
        layerRef.current.style.transform = `translate3d(0, ${-y + drift}px, 0)`;
      }

      const percent = Math.round(progress * 100);
      rail.setAttribute("aria-valuenow", String(percent));
      rail.setAttribute("aria-valuetext", `${percent} percent`);

      if (needleRef.current) {
        needleRef.current.style.transform = `translate3d(0, ${
          base + progress * railSpan
        }px, 0)`;
        needleRef.current.style.opacity = String(
          Math.min(1, progress / 0.01),
        );
        if (needleLabelRef.current) {
          needleLabelRef.current.style.top =
            base + progress * railSpan > vh - 34 ? "-15px" : "4px";
        }
      }

      const digits = String(percent).padStart(3, "0");
      for (let index = 0; index < 3; index += 1) {
        const column = digitRefs.current[index];
        if (column) {
          column.style.transform = `translateY(${-Number(digits[index])}em)`;
        }
      }

      if (bracketRef.current) {
        if (zoomedRef.current) {
          const top = base + (y / total) * railSpan;
          bracketRef.current.style.transform = `translate3d(0, ${top}px, 0)`;
          if (bracketRef.current.style.opacity !== "1") {
            bracketRef.current.style.opacity = "1";
          }
        } else if (bracketRef.current.style.opacity !== "0") {
          bracketRef.current.style.opacity = "0";
        }
      }

      if (ghostRef.current) {
        const ghostY = ghostYRef.current;
        const showGhost = zoomedRef.current && ghostY !== null;
        const opacity = showGhost ? "0.8" : "0";
        if (ghostRef.current.style.opacity !== opacity) {
          ghostRef.current.style.opacity = opacity;
        }
        if (showGhost) {
          ghostRef.current.style.transform = `translate3d(0, ${ghostY}px, 0)`;
        }
      }

      if (sectionsRef.current.length > 0) {
        // A section becomes active only when it covers at least half of the
        // viewport. If no section owns half the screen, nothing is highlighted.
        let next = -1;
        let bestVisible = 0;
        for (let index = 0; index < sectionsRef.current.length; index += 1) {
          const section = sectionsRef.current[index];
          const visible =
            Math.min(section.top + section.height, y + vh) -
            Math.max(section.top, y);
          const share = Math.max(0, visible) / vh;
          if (share > bestVisible) {
            bestVisible = share;
            next = index;
          }
        }
        if (bestVisible < 0.5) next = -1;
        setActive((current) => (current === next ? current : next));
      }
    };

    const requestUpdate = () => {
      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(update);
      }
    };

    measure();
    update();

    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    if (document.fonts) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    const footer = document.querySelector("footer");
    const footerObserver = footer
      ? new IntersectionObserver(
          (entries) => {
            setFooterVisible(entries[0]?.isIntersecting ?? false);
          },
          { threshold: 0.08 },
        )
      : null;
    if (footer && footerObserver) footerObserver.observe(footer);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", measure);
    wide.addEventListener("change", measure);

    return () => {
      disposed = true;
      observer.disconnect();
      footerObserver?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    // Reposition once the rail exists and the measured sizes are known.
    const rail = railRef.current;
    if (!rail) return;
    const y = window.scrollY;
    const total = Math.max(1, document.documentElement.scrollHeight);
    const vh = window.innerHeight;
    const base = NAV_HEIGHT + EDGE_PAD;
    const railSpan = Math.max(1, vh - NAV_HEIGHT - EDGE_PAD * 2);
    const maxScroll = Math.max(1, total - vh);
    const progress = clamp01(y / maxScroll);

    if (layerRef.current) {
      layerRef.current.style.transform = zoomedRef.current
        ? "translate3d(0, 0, 0)"
        : `translate3d(0, ${
            -y + base - progress * (NAV_HEIGHT + EDGE_PAD * 2)
          }px, 0)`;
    }
    if (needleRef.current) {
      needleRef.current.style.transform = `translate3d(0, ${
        base + progress * railSpan
      }px, 0)`;
      needleRef.current.style.opacity = String(
        Math.min(1, progress / 0.01),
      );
    }
    if (bracketRef.current) {
      bracketRef.current.style.transform = `translate3d(0, ${
        base + (y / total) * railSpan
      }px, 0)`;
      bracketRef.current.style.height = `${(vh / total) * railSpan}px`;
    }
    rail.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  }, [visible, docHeight, viewportHeight, sections.length]);

  useEffect(() => {
    zoomedRef.current = zoomed;
    if (!zoomed) {
      ghostYRef.current = null;
      if (ghostRef.current) ghostRef.current.style.opacity = "0";
    }

    const y = window.scrollY;
    const total = Math.max(1, document.documentElement.scrollHeight);
    const vh = window.innerHeight;
    const base = NAV_HEIGHT + EDGE_PAD;
    const railSpan = Math.max(1, vh - NAV_HEIGHT - EDGE_PAD * 2);

    // When zoomed the ruler is a fixed viewport map, so the layer must stop
    // following the document. That is what keeps 0–100 stuck to the viewport
    // after scrolling instead of disappearing with the first fold.
    if (layerRef.current) {
      const layer = layerRef.current;
      layer.classList.add(styles.layerZooming);
      layer.style.transform = zoomed
        ? "translate3d(0, 0, 0)"
        : `translate3d(0, ${-y + base - clamp01(y / Math.max(1, total - vh)) * (NAV_HEIGHT + EDGE_PAD * 2)}px, 0)`;
      if (layerAnimTimerRef.current) {
        window.clearTimeout(layerAnimTimerRef.current);
      }
      layerAnimTimerRef.current = window.setTimeout(() => {
        layer.classList.remove(styles.layerZooming);
      }, 340);
    }

    if (bracketRef.current) {
      bracketRef.current.style.transform = `translate3d(0, ${
        base + (y / total) * railSpan
      }px, 0)`;
      bracketRef.current.style.height = `${(vh / total) * railSpan}px`;
      bracketRef.current.style.opacity = zoomed ? "1" : "0";
    }
  }, [zoomed]);

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) window.clearTimeout(zoomTimerRef.current);
      if (layerAnimTimerRef.current) {
        window.clearTimeout(layerAnimTimerRef.current);
      }
    };
  }, []);

  const clearZoomTimer = () => {
    if (zoomTimerRef.current) {
      window.clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = null;
    }
  };

  const setZoomNow = (next: boolean) => {
    clearZoomTimer();
    zoomedRef.current = next;
    setZoomed(next);
  };

  const scheduleZoom = (next: boolean) => {
    clearZoomTimer();
    zoomTimerRef.current = window.setTimeout(() => {
      zoomedRef.current = next;
      setZoomed(next);
    }, ZOOM_DELAY);
  };

  const updateGhost = (clientY: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const y = Math.max(BASE, Math.min(BASE + span, clientY - rect.top));
    ghostYRef.current = y;
    if (ghostRef.current) {
      ghostRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      ghostRef.current.style.opacity = zoomedRef.current ? "0.8" : "0";
    }
  };

  const scrollToPointer = (clientY: number, smooth: boolean) => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const y = Math.max(BASE, Math.min(BASE + span, clientY - rect.top));
    const progress = clamp01((y - BASE) / span);
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    if (smooth) smoothScrollTo(progress * maxScroll);
    else chaseTo(progress * maxScroll);
  };

  const onPointerEnter = () => {
    if (dragRef.current.active) return;
    scheduleZoom(true);
  };

  const onPointerLeave = (event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current.active) return;
    // Section labels overhang the 60px rail. Moving onto one must not count as
    // leaving the ruler, otherwise the zoom collapses as soon as you reach it.
    const next = event.relatedTarget;
    if (next instanceof Node && railRef.current?.contains(next)) return;
    ghostYRef.current = null;
    if (ghostRef.current) ghostRef.current.style.opacity = "0";
    scheduleZoom(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!zoomedRef.current && !dragRef.current.active) return;
    updateGhost(event.clientY);
    if (dragRef.current.active) {
      dragRef.current.moved = Math.max(
        dragRef.current.moved,
        Math.abs(event.clientY - dragRef.current.startY),
      );
      if (dragRef.current.moved > 2) {
        scrollToPointer(event.clientY, false);
      }
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragRef.current = {
      active: true,
      startY: event.clientY,
      moved: 0,
    };
    setZoomNow(true);
    updateGhost(event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const wasClick = dragRef.current.moved <= 4;
    dragRef.current.active = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }
    if (wasClick) scrollToPointer(event.clientY, true);

    const rail = railRef.current;
    if (rail) {
      const rect = rail.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        ghostYRef.current = null;
        if (ghostRef.current) ghostRef.current.style.opacity = "0";
        scheduleZoom(false);
      }
    }
  };

  const jumpToSection = (section: RulerSection) => {
    smoothScrollTo(Math.max(0, section.top - NAV_HEIGHT - 8));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const page = window.innerHeight * 0.85;
    if (event.key === "ArrowDown") chaseTo(window.scrollY + 80);
    else if (event.key === "ArrowUp") chaseTo(window.scrollY - 80);
    else if (event.key === "PageDown") chaseTo(window.scrollY + page);
    else if (event.key === "PageUp") chaseTo(window.scrollY - page);
    else if (event.key === "Home") smoothScrollTo(0);
    else if (event.key === "End") smoothScrollTo(docHeight);
    else return;
    event.preventDefault();
  };

  if (!visible) return null;

  return (
    <div className={styles.zone}>
      <div
        ref={railRef}
        className={styles.rail}
        role="scrollbar"
        aria-label="Page position"
        aria-controls="main-content"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        data-zoomed={zoomed ? "true" : "false"}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onFocus={() => setZoomNow(true)}
        onBlur={() => setZoomNow(false)}
        onKeyDown={onKeyDown}
      >
        <div
          ref={layerRef}
          className={styles.layer}
          style={{ height: docHeight || undefined }}
          aria-hidden="true"
        >
          {tickRows}
        </div>

        <div
          ref={bracketRef}
          className={styles.bracket}
          aria-hidden="true"
        />

        <div ref={ghostRef} className={styles.ghost} aria-hidden="true" />

        <div ref={needleRef} className={styles.needle} aria-hidden="true">
          <span className={styles.needleLine} />
          <span ref={needleLabelRef} className={styles.needleLabel}>
            <span className={styles.digitColumns}>
              {[0, 1, 2].map((column) => (
                <span
                  key={column}
                  ref={(element) => {
                    digitRefs.current[column] = element;
                  }}
                  className={styles.digitColumn}
                >
                  {"0123456789".split("").map((digit) => (
                    <span key={digit}>{digit}</span>
                  ))}
                </span>
              ))}
            </span>
            <span className={styles.percentSign}>%</span>
          </span>
        </div>
      </div>

      {sections.length > 0 && (
        <nav
          className={`${styles.sectionList} ${
            footerVisible ? styles.sectionListHidden : ""
          }`}
          aria-label="Page sections"
          data-zoomed={zoomed ? "true" : "false"}
        >
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-label={`Jump to ${section.label}`}
              className={`${styles.sectionLabel} ${
                index === active ? styles.sectionLabelActive : ""
              } ${
                hoveredSection === section.id ? styles.sectionLabelHover : ""
              }`}
              onPointerEnter={() => setHoveredSection(section.id)}
              onPointerLeave={() =>
                setHoveredSection((current) =>
                  current === section.id ? null : current,
                )
              }
              onClick={(event) => {
                event.preventDefault();
                jumpToSection(section);
              }}
            >
              <span className={styles.sectionLabelText} aria-hidden="true">
                {section.label.split("").map((character, characterIndex) => (
                  <span
                    key={`${character}-${characterIndex}`}
                    className={styles.sectionChar}
                    style={{ "--i": characterIndex } as CSSProperties}
                  >
                    {character === " " ? "\u00A0" : character}
                  </span>
                ))}
              </span>
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
