"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const GROUP_STAGGER = 70;

/**
 * Scroll choreography, modelled on the ArtCraft site.
 *
 * Sections marked `data-choreo` draw their top rule, fade in the sticky
 * eyebrow and pop their corner ticks. Elements marked `data-reveal` rise,
 * unblur and fade in. Children of `data-reveal-group` are staggered.
 *
 * The `choreo` class is set by an inline script in the root layout so the
 * initial state is applied before first paint. We never hide content when
 * JavaScript is unavailable, and reduced-motion users skip it entirely.
 */
export default function Choreography() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const root = document.documentElement;
    root.classList.add("choreo");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.classList.add("is-revealed");
          observer.unobserve(target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    const revealTarget = (element: Element, delay = 0) => {
      if (delay > 0) {
        (element as HTMLElement).style.setProperty(
          "--reveal-delay",
          `${delay}ms`,
        );
      }
      observer.observe(element);
    };

    // Section furniture: rule, eyebrow, ticks.
    document.querySelectorAll<HTMLElement>("[data-choreo]").forEach((section) => {
      const rule = section.querySelector("[data-draw-rule]");
      const eyebrow = section.querySelector("[data-draw-eyebrow]");
      const ticks = Array.from(
        section.querySelectorAll("[data-draw-tick]"),
      ) as HTMLElement[];

      if (rule) observer.observe(rule);
      if (eyebrow) observer.observe(eyebrow);
      ticks.forEach((tick, index) => revealTarget(tick, 120 + index * 60));

      if (!rule && !eyebrow && ticks.length === 0) {
        observer.observe(section);
      }
    });

    // Standalone reveals (not inside a group).
    document
      .querySelectorAll<HTMLElement>(
        "[data-reveal]:not([data-reveal-group] [data-reveal])",
      )
      .forEach((element) => observer.observe(element));

    // Staggered groups.
    document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
      const children = Array.from(
        group.querySelectorAll<HTMLElement>("[data-reveal]"),
      );
      children.forEach((child, index) => revealTarget(child, index * GROUP_STAGGER));
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
