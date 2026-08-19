"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon/Icon";
import type { HomepageTool } from "@/data/homepage-tools";
import styles from "./ToolsFilter.module.scss";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "organize", label: "Organize" },
  { value: "convert", label: "Convert" },
  { value: "edit-review", label: "Edit & Review" },
  { value: "security", label: "Security" },
  { value: "create-forms", label: "Create & Forms" },
  { value: "optimize", label: "Optimize" },
  { value: "ai", label: "AI" },
];

const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
  convert: [
    { value: "all", label: "All" },
    { value: "to-pdf", label: "To PDF" },
    { value: "from-pdf", label: "From PDF" },
  ],
};

export default function ToolsFilter({ tools }: { tools: HomepageTool[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState("all");

  const handleCategory = (value: string) => {
    setActiveCategory(value);
    setActiveSubcategory("all");
  };

  const filteredTools = tools.filter((t) => {
    if (activeCategory !== "all" && t.category !== activeCategory) return false;
    if (activeSubcategory !== "all" && t.subcategory !== activeSubcategory)
      return false;
    return true;
  });

  const subs = SUBCATEGORIES[activeCategory];

  return (
    <>
      <div className={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategory(cat.value)}
            className={`${styles.filterPill} ${
              activeCategory === cat.value ? styles.filterPillActive : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {subs && (
        <div className={styles.subRow}>
          {subs.map((sub) => (
            <button
              key={sub.value}
              onClick={() => setActiveSubcategory(sub.value)}
              className={`${styles.subPill} ${
                activeSubcategory === sub.value ? styles.subPillActive : ""
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {filteredTools.length === 0 ? (
        <div className={styles.empty}>No tools found in this category.</div>
      ) : (
        <div className={styles.grid}>
          {filteredTools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className={`animate-border-run ${styles.card}`}
            >
              <div className={styles.cardIcon}>
                <Icon name={tool.icon} size={28} />
              </div>
              <h3 className={styles.cardTitle}>
                {tool.name}
                {tool.category === "ai" && (
                  <span className={styles.proBadge}>PRO</span>
                )}
              </h3>
              <p className={styles.cardDesc}>{tool.description}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
