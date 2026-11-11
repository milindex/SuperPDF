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

const SCROLLABLE_CACHE_TTL_MS = 250;

type ScrollableCacheEntry = { scrollable: boolean; at: number };

/**
 * Gives the page ArtCraft-style wheel smoothing. It only takes over on precise
 * pointers (mouse/trackpad) and leaves touch, reduced-motion, zoom gestures,
 * selects, and nested scroll areas to the browser.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    // Per-target cache for the ancestor scrollability walk. `getComputedStyle`
    // forces a style recalculation, so doing it for every ancestor on every
    // wheel event (dozens per second) janks the scroll it is meant to smooth.
    // The short TTL is safe because scrolling alone cannot change the result:
    // it depends on computed overflow and scrollHeight/clientHeight, and moving
    // the viewport changes neither. resize/visibilitychange invalidate it.
    let scrollableCache = new WeakMap<Element, ScrollableCacheEntry>();

    const isScrollable = (element: HTMLElement): boolean => {
      const now = performance.now();
      const cached = scrollableCache.get(element);
      if (cached && now - cached.at < SCROLLABLE_CACHE_TTL_MS) {
        return cached.scrollable;
      }

      let scrollable = false;
      let node: HTMLElement | null = element;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const y = style.overflowY;
        if (
          (y === "auto" || y === "scroll") &&
          node.scrollHeight > node.clientHeight + 1
        ) {
          scrollable = true;
          break;
        }
        node = node.parentElement;
      }

      scrollableCache.set(element, { scrollable, at: now });
      return scrollable;
    };

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

    // Layout and viewport changes can invalidate cached geometry. Deliberately
    // not cleared on scroll: that would defeat the cache for the whole gesture.
    const clearScrollableCache = () => {
      scrollableCache = new WeakMap<Element, ScrollableCacheEntry>();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", clearScrollableCache);
    document.addEventListener("visibilitychange", clearScrollableCache);
    return () => {
      stopSmoothScroll();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", clearScrollableCache);
      document.removeEventListener("visibilitychange", clearScrollableCache);
    };
  }, []);

  return null;
}
