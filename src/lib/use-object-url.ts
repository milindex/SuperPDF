"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Revoke a list of object URLs, deduplicated. Tolerates a missing
 * implementation (e.g. jsdom) and ignores falsy entries.
 */
export function revokeObjectUrls(urls: Iterable<string>): void {
  if (typeof URL.revokeObjectURL !== "function") return;
  const seen = new Set<string>();
  for (const url of urls) {
    if (url && !seen.has(url)) {
      seen.add(url);
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Drop-in replacement for `useState<string | null>` holding a result object
 * URL. Revokes the previous URL whenever it is replaced (including with null)
 * and revokes the current URL on unmount.
 */
export function useObjectUrlState(): [
  string | null,
  (next: string | null) => void,
] {
  const [url, setUrlState] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const setUrl = useCallback((next: string | null) => {
    const prev = urlRef.current;
    if (prev && prev !== next) {
      revokeObjectUrls([prev]);
    }
    urlRef.current = next;
    setUrlState(next);
  }, []);

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        revokeObjectUrls([urlRef.current]);
        urlRef.current = null;
      }
    };
  }, []);

  return [url, setUrl];
}

/**
 * Drop-in replacement for `useState<string[]>` holding object URLs. Revokes
 * URLs dropped from the list on replacement and all tracked URLs on unmount.
 */
export function useObjectUrlListState(): [
  string[],
  (next: string[]) => void,
] {
  return useObjectUrlItems((url: string) => url);
}

/**
 * For array-output pages that store records carrying an object URL (e.g.
 * `{ url, name }[]`). Tracks the URL of each item via `getUrl`, revokes URLs
 * dropped on replacement, and revokes all tracked URLs on unmount.
 */
export function useObjectUrlItems<T>(
  getUrl: (item: T) => string | null,
): [T[], (next: T[]) => void] {
  const [items, setItemsState] = useState<T[]>([]);
  const urlsRef = useRef<string[]>([]);

  const setItems = (next: T[]) => {
    const nextUrls = next
      .map(getUrl)
      .filter((u): u is string => u !== null);
    const nextSet = new Set(nextUrls);
    const dropped = urlsRef.current.filter((u) => !nextSet.has(u));
    if (dropped.length) {
      revokeObjectUrls(dropped);
    }
    urlsRef.current = nextUrls;
    setItemsState(next);
  };

  useEffect(() => {
    return () => {
      revokeObjectUrls(urlsRef.current);
      urlsRef.current = [];
    };
  }, []);

  return [items, setItems];
}
