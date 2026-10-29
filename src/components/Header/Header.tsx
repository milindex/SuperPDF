"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SuperPDFIcon from "@/components/logos/SuperPDFIcon";
import SettingsDialog from "@/components/SettingsDialog/SettingsDialog";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
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
  { name: "About", href: "/about" },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

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
      <header className={styles.header}>
        <div className={styles.bar}>
          <div className={styles.left}>
            <Link
              href="/"
              className={styles.logo}
              aria-label="SuperPDF home"
              onClick={closeAll}
            >
              <SuperPDFIcon title="" className={styles.logoMark} />
              <span className={styles.brandWord}>
                Super<span className={styles.brandAccent}>PDF</span>
              </span>
            </Link>

            <nav className={styles.desktopNav} aria-label="Primary">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.navLink}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.actions}>
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
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.iconButton} ${styles.settingsButton}`}
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
                <path d="M4 6h10" />
                <path d="M18 6h2" />
                <circle cx="16" cy="6" r="2" />
                <path d="M4 12h2" />
                <path d="M10 12h10" />
                <circle cx="8" cy="12" r="2" />
                <path d="M4 18h10" />
                <path d="M18 18h2" />
                <circle cx="16" cy="18" r="2" />
              </svg>
            </button>

            <ThemeToggle />

            <Link href="/tools" className={styles.cta} onClick={closeAll}>
              Open workbench
            </Link>

            <button
              type="button"
              className={styles.menuToggle}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 5h16" />
                  <path d="M4 12h16" />
                  <path d="M4 19h16" />
                </svg>
              )}
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
              placeholder="Try merge, compress, or Word"
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
        id="mobile-nav"
        className={`${styles.mobilePanel} ${
          mobileOpen ? styles.mobilePanelOpen : ""
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className={styles.mobileNav} aria-label="Mobile">
          {primaryNav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              onClick={closeAll}
            >
              <span className={styles.mobileNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
        <Link href="/tools" className={styles.mobileCta} onClick={closeAll}>
          Open workbench
        </Link>
      </div>
    </>
  );
}
