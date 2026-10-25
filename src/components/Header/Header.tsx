"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AnimatedLogo from "@/components/logos/AnimatedLogo";
import SettingsDialog from "@/components/SettingsDialog/SettingsDialog";
import { toolsRegistry } from "@/registry/tools";
import styles from "./Header.module.scss";

const allTools = toolsRegistry.map((tool) => ({
  name: tool.name,
  href: `/tools/${tool.slug}`,
  description: tool.description,
  wip: tool.wip ?? false,
}));

const primaryNav = [
  { name: "Tools", href: "/tools" },
  { name: "Workflow", href: "/workflow" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "FAQ", href: "/faq" },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeAll = () => {
    setSearchOpen(false);
    setMobileOpen(false);
    setSettingsOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (searchOpen) {
        setSearchOpen(false);
        searchButtonRef.current?.focus();
      }
      setMobileOpen(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        searchOpen &&
        !searchPanelRef.current?.contains(target) &&
        !searchButtonRef.current?.contains(target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [searchOpen]);

  const toggleSearch = () => {
    setSearchOpen((open) => !open);
    setSearchQuery("");
    setMobileOpen(false);
  };

  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allTools.slice(0, 12);
    return allTools
      .filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query),
      )
      .slice(0, 12);
  }, [searchQuery]);

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}
      >
        <div className={styles.bar}>
          <Link
            href="/"
            className={styles.logo}
            aria-label="SuperPDF home"
            onClick={closeAll}
          >
            <AnimatedLogo height={34} autoHide={false} />
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Settings"
              aria-haspopup="dialog"
              onClick={() => {
                setSearchOpen(false);
                setMobileOpen(false);
                setSettingsOpen(true);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6h.08a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
              </svg>
            </button>

            <button
              ref={searchButtonRef}
              type="button"
              className={styles.iconButton}
              aria-label="Search tools"
              aria-expanded={searchOpen}
              aria-controls="tool-search"
              onClick={toggleSearch}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-4-4" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.menuToggle} ${
                mobileOpen ? styles.menuToggleOpen : ""
              }`}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          id="tool-search"
          ref={searchPanelRef}
          className={styles.searchPanel}
          role="dialog"
          aria-label="Search tools"
        >
          <div className={styles.searchInner}>
            <label className={styles.searchLabel} htmlFor="tool-search-input">
              Search {allTools.length} PDF tools
            </label>
            <input
              id="tool-search-input"
              type="search"
              className={styles.searchInput}
              placeholder="Try “merge”, “compress”, or “Word”"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
            />

            {results.length > 0 ? (
              <ul className={styles.searchResults}>
                {results.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className={styles.searchResult}
                      onClick={closeAll}
                    >
                      <span className={styles.searchName}>
                        {tool.name}
                        {tool.wip && <span className={styles.searchWip}>WIP</span>}
                      </span>
                      <span className={styles.searchDescription}>
                        {tool.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.searchEmpty}>
                No tool matches “{searchQuery.trim()}”. Try a shorter word, or{" "}
                <Link href="/tools" onClick={closeAll}>
                  open the full list
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      )}

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div
        className={`${styles.mobileScrim} ${
          mobileOpen ? styles.mobileScrimOpen : ""
        }`}
        onClick={closeAll}
        aria-hidden="true"
      />

      <div
        className={`${styles.mobilePanel} ${
          mobileOpen ? styles.mobilePanelOpen : ""
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className={styles.mobileNav} aria-label="Mobile">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              onClick={closeAll}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
