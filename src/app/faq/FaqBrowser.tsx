"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { searchFaqs, suggestFaqs, type FaqLike } from "@/lib/faq-search";
import styles from "./page.module.scss";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string): ReactNode {
  const terms = Array.from(
    new Set(
      query
        .split(/[\s*?]+/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3),
    ),
  );
  if (terms.length === 0) return text;

  const pattern = new RegExp(
    `(${terms.map((term) => escapeRegExp(term)).join("|")})`,
    "gi",
  );
  const lower = new Set(terms.map((term) => term.toLowerCase()));

  return text.split(pattern).map((part, index) =>
    lower.has(part.toLowerCase()) ? (
      <mark key={index} className={styles.mark}>
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function FaqBrowser({ faqs }: { faqs: FaqLike[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const trimmed = deferred.trim();
  const hasQuery = trimmed.length > 0;

  const results = useMemo(() => searchFaqs(trimmed, faqs), [trimmed, faqs]);
  const bestQuestion = results[0]?.faq.question ?? null;
  const suggestions = useMemo(
    () =>
      hasQuery && results.length === 0
        ? suggestFaqs(trimmed, faqs, 3)
        : [],
    [hasQuery, results.length, trimmed, faqs],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, FaqLike[]>();
    for (const { faq } of results) {
      const category = faq.category || "General";
      const list = map.get(category);
      if (list) list.push(faq);
      else map.set(category, [faq]);
    }
    return Array.from(map.entries());
  }, [results]);

  return (
    <>
      <div className={styles.searchPanel}>
        <div className={styles.searchHead}>
          <label className={`hud-label ${styles.searchLabel}`} htmlFor="faq-search">
            Search the FAQ
          </label>
          <p className={`hud-label ${styles.searchCount}`} role="status">
            {hasQuery
              ? `${results.length} ${results.length === 1 ? "answer" : "answers"}`
              : `${faqs.length} answers`}
          </p>
        </div>

        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            id="faq-search"
            type="search"
            className={styles.searchInput}
            placeholder="Try privacy, merge*, or passw?rd"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby="faq-search-hint"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setQuery("")}
              aria-label="Clear FAQ search"
            >
              Clear
            </button>
          )}
        </div>

        <p id="faq-search-hint" className={styles.hint}>
          Wildcards: <kbd className={styles.kbd}>*</kbd> matches any text,{" "}
          <kbd className={styles.kbd}>?</kbd> matches one character. Typos and
          near misses still find the nearest answer.
        </p>
      </div>

      {hasQuery && results.length === 0 ? (
        <div className={styles.noResults}>
          <p className={styles.noResultsTitle}>
            No answers matched “{trimmed}”.
          </p>
          <p className={styles.noResultsBody}>
            Check the spelling, or try a broader wildcard such as{" "}
            <code className={styles.inlineCode}>pass*</code> or{" "}
            <code className={styles.inlineCode}>*.pdf</code>.
          </p>

          {suggestions.length > 0 && (
            <>
              <p className={`hud-label ${styles.suggestionsLabel}`}>
                Nearest questions
              </p>
              <ul className={styles.suggestions}>
                {suggestions.map((faq) => (
                  <li key={faq.question}>
                    <button
                      type="button"
                      className={styles.suggestionButton}
                      onClick={() => setQuery(faq.question)}
                    >
                      {faq.question}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <button
            type="button"
            className={styles.resetSearch}
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className={styles.categories}>
          {grouped.map(([category, items]) => (
            <section key={category} className={styles.category}>
              <h2 className={styles.categoryTitle}>
                {highlight(category, trimmed)}
              </h2>
              <div className={styles.faqList}>
                {items.map((faq) => (
                  <details
                    key={faq.question}
                    className={styles.faqItem}
                    open={
                      hasQuery && faq.question === bestQuestion
                        ? true
                        : undefined
                    }
                  >
                    <summary className={styles.faqQuestion}>
                      {highlight(faq.question, trimmed)}
                    </summary>
                    <p className={styles.faqAnswer}>
                      {highlight(faq.answer, trimmed)}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
