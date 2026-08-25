"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AnimatedLogo from "@/components/logos/AnimatedLogo";
import Icon from "@/components/Icon/Icon";
import styles from "./Header.module.scss";

/* ------------------------- Tool data (ported from v1) ------------------------- */

type ToolLink = { name: string; href: string; icon?: string };

const pdfTools: Record<string, ToolLink[]> = {
  Organize: [
    { name: "Merge PDF", href: "/tools/merge-pdf" },
    { name: "Split PDF", href: "/tools/split-pdf" },
    { name: "Remove Pages", href: "/tools/delete-pdf-pages" },
    { name: "Extract Pages", href: "/tools/extract-pdf-pages" },
    { name: "Rearrange Pages", href: "/tools/reorder-pages" },
    { name: "Rotate PDF", href: "/tools/rotate-pdf" },
    { name: "Organize Pages", href: "/tools/organize" },
    { name: "Add Page Numbers", href: "/tools/page-numbers" },
    { name: "Flatten PDF", href: "/tools/flatten-pdf" },
  ],
  "Convert To PDF": [
    { name: "Word to PDF", href: "/tools/word-to-pdf" },
    { name: "Excel to PDF", href: "/tools/excel-to-pdf" },
    { name: "JPG to PDF", href: "/tools/jpg-to-pdf" },
    { name: "PNG to PDF", href: "/tools/png-to-pdf" },
    { name: "WEBP to PDF", href: "/tools/webp-to-pdf" },
    { name: "HEIC to PDF", href: "/tools/heic-to-pdf" },
    { name: "SVG to PDF", href: "/tools/svg-to-pdf" },
    { name: "TIFF to PDF", href: "/tools/tiff-to-pdf" },
    { name: "Text to PDF", href: "/tools/text-to-pdf" },
    { name: "CSV to PDF", href: "/tools/csv-to-pdf" },
    { name: "Webpage to PDF", href: "/tools/webpage-to-pdf" },
  ],
  "Convert From PDF": [
    { name: "PDF to Word", href: "/tools/pdf-to-word" },
    { name: "PDF to PowerPoint", href: "/tools/pdf-to-powerpoint" },
    { name: "PDF to Excel", href: "/tools/pdf-to-excel" },
    { name: "PDF to JPG", href: "/tools/pdf-to-jpg" },
    { name: "PDF to PNG", href: "/tools/pdf-to-png" },
    { name: "Extract Images", href: "/tools/extract-pdf-images" },
    { name: "PDF to SVG", href: "/tools/pdf-to-svg" },
    { name: "PDF to HTML", href: "/tools/pdf-to-html" },
    { name: "PDF to Text", href: "/tools/pdf-to-text" },
    { name: "PDF to Markdown", href: "/tools/pdf-to-markdown" },
  ],
  "Edit & Review": [
    { name: "Sign PDF", href: "/tools/sign-pdf" },
    { name: "Crop PDF", href: "/tools/crop" },
    { name: "Redact PDF", href: "/tools/redact" },
    { name: "Watermark PDF", href: "/tools/watermark" },
    { name: "Change Page Size", href: "/tools/page-size" },
  ],
  Security: [
    { name: "Protect PDF", href: "/tools/protect" },
    { name: "Unlock PDF", href: "/tools/unlock" },
    { name: "Remove Metadata", href: "/tools/remove-metadata" },
    { name: "Change PDF Info", href: "/tools/edit-metadata" },
  ],
  "Create & Forms": [
    { name: "Scan to PDF", href: "/tools/scan-to-pdf" },
    { name: "Fill Out PDF", href: "/tools/fill-forms" },
  ],
  Optimize: [
    { name: "Compress PDF", href: "/tools/compress" },
    { name: "Repair PDF", href: "/tools/repair-pdf" },
    { name: "PDF OCR", href: "/tools/ocr-pdf" },
    { name: "PDF to PDF/A", href: "/tools/pdf-to-pdfa" },
  ],
};

const popularTools: ToolLink[] = [
  { name: "Merge PDF", href: "/tools/merge-pdf" },
  { name: "Split PDF", href: "/tools/split-pdf" },
  { name: "Compress PDF", href: "/tools/compress" },
  { name: "Word to PDF", href: "/tools/word-to-pdf" },
  { name: "PDF to Word", href: "/tools/pdf-to-word" },
  { name: "Sign PDF", href: "/tools/sign-pdf" },
];

const allTools: ToolLink[] = Object.values(pdfTools)
  .flat()
  .map((t) => ({ ...t }));

const navItems: ToolLink[] = [
  { name: "Split PDF", href: "/tools/split-pdf" },
  { name: "Compress PDF", href: "/tools/compress" },
  { name: "Merge PDF", href: "/tools/merge-pdf" },
];

/* ------------------------- Mega menu columns ------------------------- */

function MegaColumn({
  categories,
  tools,
  closeMenu,
}: {
  categories: string[];
  tools: Record<string, ToolLink[]>;
  closeMenu: () => void;
}) {
  return (
    <div className={styles.megaColumn}>
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className={styles.megaTitle}>{cat}</h3>
          <div className={styles.megaLinks}>
            {tools[cat]?.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                onClick={closeMenu}
                className={styles.megaLink}
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------- Mobile category dropdown ------------------------- */

function MobileCategoryDropdown({
  category,
  tools,
  closeMenu,
}: {
  category: string;
  tools: ToolLink[];
  closeMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.mobileCat}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`cat-${category}`}
        className={styles.mobileCatBtn}
      >
        <span className={styles.mobileCatLabel}>{category}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <Icon name="arrow-right" size={16} />
        </span>
      </button>
      <div
        id={`cat-${category}`}
        className={`${styles.mobileCatBody} ${open ? styles.mobileCatBodyOpen : ""}`}
      >
        <div className={styles.mobileCatLinks}>
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              onClick={closeMenu}
              className={styles.mobileCatLink}
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Header ------------------------- */

export default function ResponsiveHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toolsBtnRef = useRef<HTMLButtonElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const searchMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleToolsMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown("tools");
    setSearchOpen(false);
  }, []);

  const handleToolsMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setSearchQuery("");
    }, 150);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setActiveDropdown(null);
        setSearchOpen(false);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (activeDropdown === "tools") {
        const btn = toolsBtnRef.current;
        const menu = toolsMenuRef.current;
        if (btn?.contains(e.target as Node)) return;
        if (menu?.contains(e.target as Node)) return;
        setActiveDropdown(null);
      }
      if (searchOpen) {
        const menu = searchMenuRef.current;
        if (menu?.contains(e.target as Node)) return;
      }
    };
    if (isMenuOpen || activeDropdown || searchOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClick);
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("mousedown", handleClick);
      };
    }
  }, [isMenuOpen, activeDropdown, searchOpen]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setSearchOpen(false);
  };
  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  };

  const headerClass = `${styles.header} ${isScrolled ? styles.headerScrolled : ""}`;

  return (
    <>
      <header className={headerClass}>
        <div className={styles.container}>
          <div className={styles.bar}>
            {/* Logo */}
            <Link
              href="/"
              className={styles.logo}
              aria-label="SuperPDF home"
              onClick={closeMenu}
            >
              <span className={styles.logoDesktop}>
                <AnimatedLogo height={36} />
              </span>
              <span className={styles.logoMobile}>
                <AnimatedLogo height={36} autoHide={false} />
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className={styles.desktopNav} aria-label="Primary">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={styles.navLink}
                >
                  {item.name}
                </Link>
              ))}
              <div
                className={styles.megaWrap}
                onMouseEnter={handleToolsMouseEnter}
                onMouseLeave={handleToolsMouseLeave}
              >
                <button
                  ref={toolsBtnRef}
                  className={`${styles.megaBtn} ${
                    activeDropdown === "tools" ? styles.megaBtnActive : ""
                  }`}
                >
                  All PDF Tools
                  <svg
                    className={`${styles.btnChevron} ${
                      activeDropdown === "tools" ? styles.btnChevronOpen : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {activeDropdown === "tools" && (
                  <div
                    ref={toolsMenuRef}
                    onMouseEnter={handleToolsMouseEnter}
                    onMouseLeave={handleToolsMouseLeave}
                    className={styles.megaMenu}
                  >
                    <div className={styles.megaInner}>
                      {/* Popular */}
                      <h3 className={styles.megaSectionLabel}>Popular</h3>
                      <div className={styles.popularRow}>
                        {popularTools.map((tool) => (
                          <Link
                            key={tool.name}
                            href={tool.href}
                            onClick={() => {
                              setActiveDropdown(null);
                              setSearchQuery("");
                            }}
                            className={styles.popularPill}
                          >
                            {tool.name}
                          </Link>
                        ))}
                      </div>

                      {/* Category columns */}
                      <div className={styles.megaGrid}>
                        <MegaColumn
                          categories={["Organize", "Security"]}
                          tools={pdfTools}
                          closeMenu={() => setActiveDropdown(null)}
                        />
                        <MegaColumn
                          categories={["Convert To PDF"]}
                          tools={pdfTools}
                          closeMenu={() => setActiveDropdown(null)}
                        />
                        <MegaColumn
                          categories={["Convert From PDF"]}
                          tools={pdfTools}
                          closeMenu={() => setActiveDropdown(null)}
                        />
                        <MegaColumn
                          categories={["Edit & Review", "Create & Forms"]}
                          tools={pdfTools}
                          closeMenu={() => setActiveDropdown(null)}
                        />
                        <MegaColumn
                          categories={["Optimize"]}
                          tools={pdfTools}
                          closeMenu={() => setActiveDropdown(null)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search toggle */}
              <button
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  if (activeDropdown === "tools") setActiveDropdown(null);
                }}
                className={`${styles.iconBtn} ${
                  searchOpen ? styles.iconBtnActive : ""
                }`}
                aria-label="Search tools"
              >
                <svg
                  className={styles.iconSvg}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6 -6" />
                </svg>
              </button>
            </nav>

            {/* Mobile actions */}
            <div className={styles.mobileActions}>
              <button
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  if (isMenuOpen) setIsMenuOpen(false);
                }}
                className={`${styles.iconBtn} ${
                  searchOpen ? styles.iconBtnActive : ""
                }`}
                aria-label="Search tools"
              >
                <svg
                  className={styles.iconSvg}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6 -6" />
                </svg>
              </button>
              <button
                onClick={toggleMenu}
                className={`${styles.hamburger} ${
                  isMenuOpen ? styles.hamburgerActive : ""
                }`}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                <div className={styles.burgerIcon}>
                  <span
                    className={`${styles.burgerLine} ${
                      isMenuOpen ? styles.burgerLine1 : ""
                    }`}
                  />
                  <span
                    className={`${styles.burgerLine} ${
                      isMenuOpen ? styles.burgerLine2 : ""
                    }`}
                  />
                  <span
                    className={`${styles.burgerLine} ${
                      isMenuOpen ? styles.burgerLine3 : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop blur for tools/search */}
      {(activeDropdown === "tools" || searchOpen) && (
        <div className={styles.backdrop} />
      )}

      {/* Global Search Dropdown */}
      {searchOpen && (
        <>
          <div
            className={styles.searchDismiss}
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
          />
          <div ref={searchMenuRef} className={styles.searchPanel}>
            <div className={styles.searchInner}>
              <div className={styles.searchBox}>
                <svg
                  className={styles.searchIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6 -6" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
              <div className={styles.searchGrid}>
                {(() => {
                  const q = searchQuery.toLowerCase();
                  let results = allTools.filter((t) =>
                    t.name.toLowerCase().includes(q),
                  );
                  if (!q) results = results.slice(0, 15);
                  return results.length > 0 ? (
                    results.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className={styles.searchResult}
                      >
                        <span className={styles.searchResultIcon}>
                          <Icon name={tool.icon || "pdf-to-word"} size={20} />
                        </span>
                        <span className={styles.searchResultName}>{tool.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className={styles.searchEmpty}>
                      <Icon name="search" size={48} />
                      <p className={styles.searchEmptyText}>
                        No tools found. Try a different search term.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileOverlay} ${
          isMenuOpen ? styles.mobileOverlayOpen : ""
        }`}
      >
        <div className={styles.mobileBackdrop} onClick={closeMenu} />
        <div
          className={`${styles.mobilePanel} ${
            isMenuOpen ? styles.mobilePanelOpen : ""
          }`}
        >
          <nav className={styles.mobileNav}>
            <div className={styles.mobileQuick}>
              <h3 className={styles.mobileHeading}>Quick Links</h3>
              <div className={styles.mobileQuickLinks}>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={styles.mobileQuickLink}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.mobileTools}>
              <h3 className={styles.mobileHeading}>All PDF Tools</h3>
              {Object.entries(pdfTools).map(([category, tools]) => (
                <MobileCategoryDropdown
                  key={category}
                  category={category}
                  tools={tools}
                  closeMenu={closeMenu}
                />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
