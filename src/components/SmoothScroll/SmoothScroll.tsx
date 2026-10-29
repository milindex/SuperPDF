"use client";

import { useEffect } from "react";
import { chaseBy, stopSmoothScroll } from "@/lib/smooth-scroll";

const KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

function isScrollable(element: HTMLElement): boolean {
  let node: HTMLElement | null = element;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const y = style.overflowY;
    if (
      (y === "auto" || y === "scroll") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

/**
 * Gives the page ArtCraft-style wheel smoothing. It only takes over on precise
 * pointers (mouse/trackpad) and leaves touch, reduced-motion, zoom gestures,
 * selects, and nested scroll areas to the browser.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    const onWheel = (event: WheelEvent) => {
      if (
        reduced.matches ||
        !fine.matches ||
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented
      ) {
        return;
      }

      const element = event.target as HTMLElement | null;
      if (!element) return;
      if (element.closest("select, option")) return;
      if (isScrollable(element)) return;

      let delta = event.deltaY;
      if (!delta) return;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= window.innerHeight;

      event.preventDefault();
      chaseBy(delta);
    };

    const cancel = () => stopSmoothScroll();
    const onKeyDown = (event: KeyboardEvent) => {
      if (KEYS.has(event.key)) stopSmoothScroll();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      stopSmoothScroll();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
