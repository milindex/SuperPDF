import StaticPage from "@/components/StaticPage/StaticPage";
import { pageMetadata } from "@/lib/seo";
import styles from "./changelog.module.scss";

const RELEASES = [
  {
    version: "v2.1.1",
    date: "25 October 2026",
    title: "Discovery, policies, and a smaller site",
    current: true,
    changes: [
      "Added a generated sitemap and robots.txt, with canonical URLs and unique titles and descriptions on every page.",
      "Removed the blog for now; its routes, data, and links are gone from the site.",
      "Rewrote the privacy, terms, cookie, and security policies to match what the app actually does, each with a last-updated date.",
      "Linked the footer copyright credit to milinds.dev.",
    ],
  },
  {
    version: "v2.1.0",
    date: "25 October 2026",
    title: "Redesign, workflows, and offline use",
    changes: [
      "New paper palette, two typefaces, and a quieter layout across every page, plus six more tools and automatic form-field detection.",
      "A workflow builder that chains PDF tools and reruns the same steps on one file.",
      "Recently used tools and workflows, plus a settings dialog to remember or clear them.",
      "An offline copy of the main pages and tool code, with an installable web manifest.",
      "Easy and Advanced control levels for each tool, saved per tool in this browser.",
    ],
  },
  {
    version: "v2.0.1",
    date: "26 August 2026",
    title: "Content and discovery",
    changes: [
      "Added the tools index at /tools, grouped by category.",
      "Added About, FAQ, Legal, Press, Privacy, Terms, Cookies, and Security pages.",
      "Added PDF to Markdown and new split modes for ranges, pages, size, and bookmarks.",
      "Added the version badge in the footer and the generated tool documentation.",
    ],
  },
  {
    version: "v2.0.0",
    date: "20 to 22 August 2026",
    title: "The browser toolkit",
    changes: [
      "Rebuilt the app on Next.js, React, TypeScript, and SCSS modules.",
      "Added the tool registry, service worker router, shared message contract, and CI checks.",
      "Built the shared tool shell: layout, header, drop zone, options, and download banner.",
      "Added 45 tools across organise, convert, edit, security, optimisation, and extraction.",
      "Brought pdf.js, qpdf, tesseract.js, docx, xlsx, and image engines into the browser.",
    ],
  },
  {
    version: "v0.1.0",
    date: "20 August 2026",
    title: "Initial scaffold",
    changes: [
      "Created the Next.js app with SCSS modules and a test setup.",
      "Added the first header, footer, logo, icon set, and homepage sections.",
      "Added the tool registry, service worker contract, and documentation generator.",
      "Added the first end-to-end tests for the shell, merge, split, and rotate.",
    ],
  },
];

export const metadata = pageMetadata({
  title: "Changelog",
  description:
    "Every release of SuperPDF, from the first scaffold to the current browser toolkit.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <StaticPage
      path="/changelog"
      title="Changelog"
      intro="What changed, from the first scaffold to the current release."
    >
      <div className={styles.list}>
        {RELEASES.map((release) => (
          <section key={release.version} className={styles.release}>
            <div className={styles.releaseHead}>
              <h2 className={styles.version}>{release.version}</h2>
              <span className={styles.date}>{release.date}</span>
              {release.current && (
                <span className={styles.current}>Current</span>
              )}
            </div>
            <p className={styles.releaseTitle}>{release.title}</p>
            <ul className={styles.changes}>
              {release.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className={styles.note}>
        Releases follow the commit history in the repository. Small fixes that do
        not change a tool may ship between these entries.
      </p>
    </StaticPage>
  );
}
