"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { toolsRegistry } from "@/registry/tools";
import styles from "./ToolsFilter.module.scss";

const CATEGORY_GROUPS = [
  { value: "all", label: "All", categories: [] as string[] },
  { value: "organize", label: "Organize", categories: ["Organize"] },
  {
    value: "convert",
    label: "Convert",
    categories: ["Convert To PDF", "Convert From PDF"],
  },
  { value: "edit", label: "Edit", categories: ["Edit"] },
  { value: "security", label: "Security", categories: ["Security"] },
  { value: "optimize", label: "Optimize", categories: ["Optimization"] },
  { value: "create", label: "Create & forms", categories: ["Create & Forms"] },
];

const CONVERT_SUBS = [
  { value: "to-pdf", label: "To PDF", category: "Convert To PDF" },
  { value: "from-pdf", label: "From PDF", category: "Convert From PDF" },
];

const POPULAR = [
  "merge-pdf",
  "split-pdf",
  "compress",
  "pdf-to-word",
  "jpg-to-pdf",
  "sign-pdf",
  "page-numbers",
  "protect",
];

const allTools = toolsRegistry.map((tool) => ({
  id: tool.id,
  name: tool.name,
  description: tool.description,
  href: `/tools/${tool.slug}`,
  category: tool.category,
  wip: tool.wip ?? false,
}));

const WORKFLOW_CARD = {
  name: "Workflow",
  description:
    "Chain several PDF tools into one repeatable run on the same file.",
  href: "/workflow",
};

export default function ToolsFilter({ limit = 1000 }: { limit?: number }) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState("all");

  const group = CATEGORY_GROUPS.find(
    (item) => item.value === activeCategory,
  );

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allTools.filter((tool) => {
      if (term) {
        const haystack = `${tool.name} ${tool.description}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (activeCategory !== "all") {
        if (!group?.categories.includes(tool.category)) return false;
      }
      if (activeCategory === "convert" && activeSubcategory !== "all") {
        const sub = CONVERT_SUBS.find(
          (item) => item.value === activeSubcategory,
        );
        if (sub && tool.category !== sub.category) return false;
      }
      return true;
    });
  }, [query, activeCategory, activeSubcategory, group]);

  const isBrowsingAll = query.trim() === "" && activeCategory === "all";
  const visible = isBrowsingAll
    ? [...matches].sort((a, b) => {
        const aIndex = POPULAR.indexOf(a.href.replace("/tools/", ""));
        const bIndex = POPULAR.indexOf(b.href.replace("/tools/", ""));
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      }).slice(0, limit)
    : matches;

  const showWorkflow = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return `${WORKFLOW_CARD.name} ${WORKFLOW_CARD.description}`
      .toLowerCase()
      .includes(term);
  }, [query]);

  const cardCount = visible.length + (showWorkflow ? 1 : 0);

  const chooseCategory = (value: string) => {
    setActiveCategory(value);
    setActiveSubcategory("all");
  };

  const reset = () => {
    setQuery("");
    setActiveCategory("all");
    setActiveSubcategory("all");
  };

  return (
    <div className={styles.finder}>
      <div className={styles.searchRow}>
        <label className={styles.searchLabel} htmlFor={searchId}>
          Search tools
        </label>
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder="Merge, compress, Word, sign…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className={styles.filterRow} role="group" aria-label="Filter by category">
        {CATEGORY_GROUPS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={activeCategory === item.value}
            onClick={() => chooseCategory(item.value)}
            className={`${styles.filterPill} ${
              activeCategory === item.value ? styles.filterPillActive : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeCategory === "convert" && (
        <div className={styles.subRow} role="group" aria-label="Conversion direction">
          {CONVERT_SUBS.map((sub) => (
            <button
              key={sub.value}
              type="button"
              aria-pressed={activeSubcategory === sub.value}
              onClick={() =>
                setActiveSubcategory((current) =>
                  current === sub.value ? "all" : sub.value,
                )
              }
              className={`${styles.subPill} ${
                activeSubcategory === sub.value ? styles.subPillActive : ""
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.statusRow}>
        <p className={styles.count} role="status">
          {cardCount === 0
            ? "No tools match"
            : isBrowsingAll
              ? `${allTools.length} tools · workflow`
              : `${cardCount} ${cardCount === 1 ? "match" : "matches"} found`}
        </p>
        {isBrowsingAll && visible.length < allTools.length && (
          <Link href="/tools" className={styles.seeAll}>
            See all {allTools.length} tools
          </Link>
        )}
      </div>

      {cardCount === 0 ? (
        <div className={styles.empty}>
          <p>
            No tool matches{" "}
            {query.trim() ? <strong>“{query.trim()}”</strong> : "this filter"}.
          </p>
          <button type="button" className={styles.reset} onClick={reset}>
            Clear search and filters
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {visible.map((tool) => (
            <li key={tool.id}>
              <Link href={tool.href} className={styles.card}>
                {tool.wip && <span className={styles.wip}>WIP</span>}
                <span className={styles.cardName}>{tool.name}</span>
                <span className={styles.cardDesc}>{tool.description}</span>
              </Link>
            </li>
          ))}
          {showWorkflow && (
            <li>
              <Link
                href={WORKFLOW_CARD.href}
                className={`${styles.card} ${styles.cardWorkflow}`}
              >
                <span className={styles.builder}>Builder</span>
                <span className={styles.cardName}>{WORKFLOW_CARD.name}</span>
                <span className={styles.cardDesc}>
                  {WORKFLOW_CARD.description}
                </span>
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
