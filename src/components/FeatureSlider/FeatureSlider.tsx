"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import styles from "./FeatureSlider.module.scss";

const SLIDES = [
  {
    id: "workflow",
    title: "Run the same steps every time.",
    body: "Build a chain once, then apply it to any PDF: compress it, number the pages, add a watermark, protect it.",
    chain: ["Compress", "Page numbers", "Watermark"],
    link: { label: "Open the workflow builder", href: "/workflow" },
  },
  {
    id: "privacy",
    title: "No upload. No server copy.",
    body: "The browser reads the document itself. There is no file on a server to leak, sell, or forget to delete.",
    facts: [
      "The file stays on your device",
      "No account to create",
      "Works offline after it loads",
    ],
    link: { label: "How privacy works", href: "/security-policy" },
  },
  {
    id: "formats",
    title: "Start from whatever you have.",
    body: "Word, Excel, PowerPoint, images, and Markdown, in both directions where the format allows.",
    formats: ["Word", "Excel", "PowerPoint", "JPG", "PNG", "SVG"],
    link: { label: "Convert a document", href: "/tools/pdf-to-word" },
  },
];

export default function FeatureSlider() {
  const [index, setIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((next: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    viewport.scrollTo({
      left: clamped * viewport.clientWidth,
      behavior: reduced ? "auto" : "smooth",
    });
    setIndex(clamped);
  }, []);

  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = Math.round(viewport.scrollLeft / viewport.clientWidth);
    if (next !== index) setIndex(next);
  };

  return (
    <aside
      className={styles.slider}
      aria-roledescription="carousel"
      aria-label="What SuperPDF does"
    >
      <div
        ref={viewportRef}
        className={styles.viewport}
        onScroll={onScroll}
        tabIndex={0}
        role="group"
        aria-label="Feature slides"
      >
        {SLIDES.map((slide, slideIndex) => (
          <section
            key={slide.id}
            className={styles.slide}
            aria-label={`${slideIndex + 1} of ${SLIDES.length}: ${slide.title}`}
          >
            <h2 className={styles.title}>{slide.title}</h2>
            <p className={styles.body}>{slide.body}</p>

            {slide.chain && (
              <ol className={styles.chain} aria-label="Example workflow">
                {slide.chain.map((step) => (
                  <li key={step} className={styles.chainNode}>
                    {step}
                  </li>
                ))}
              </ol>
            )}

            {slide.facts && (
              <ul className={styles.facts}>
                {slide.facts.map((fact) => (
                  <li key={fact}>
                    <Icon name="check" size={16} />
                    {fact}
                  </li>
                ))}
              </ul>
            )}

            {slide.formats && (
              <ul className={styles.formats} aria-label="Supported formats">
                {slide.formats.map((format) => (
                  <li key={format}>{format}</li>
                ))}
              </ul>
            )}

            {slide.link && (
              <Link href={slide.link.href} className={styles.link}>
                {slide.link.label}
              </Link>
            )}
          </section>
        ))}
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {SLIDES.map((slide, dotIndex) => (
            <button
              key={slide.id}
              type="button"
              className={`${styles.dot} ${
                dotIndex === index ? styles.dotActive : ""
              }`}
              aria-label={`Show feature ${dotIndex + 1}: ${slide.title}`}
              aria-current={dotIndex === index}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Previous feature"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 18-6-6 6-6"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Next feature"
            onClick={() => goTo(index + 1)}
            disabled={index === SLIDES.length - 1}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 18 6-6-6-6"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
