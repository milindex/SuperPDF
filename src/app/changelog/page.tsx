import StaticPage from "@/components/StaticPage/StaticPage";
import { pageMetadata } from "@/lib/seo";
import styles from "./changelog.module.scss";

const RELEASES = [
  {
    version: "v3.0.3",
    date: "12 November 2026",
    title: "A lighter, faster workbench",
    current: true,
    changes: [
      "Tool pages now load only the code for the selected tool, so pages open faster and download less.",
      "Image, OCR, compression and document exports now encode straight to binary instead of giant base64 strings, cutting memory use on large PDFs.",
      "Files move between the page and the service worker without an extra copy, so large merges and edits finish sooner.",
      "Preview images are released as soon as they are replaced or you leave a page, so long sessions no longer hold on to memory.",
      "Offline downloads are fetched in a bounded queue, and shared chunks are only stored once.",
      "Scrolling no longer re-measures the page on every wheel tick.",
      "Development builds no longer serve edited code from a stale service-worker cache.",
      "Removed unused dependencies and split the test suite into DOM and non-DOM runs.",
    ],
  },
  {
    version: "v3.0.2",
    date: "11 November 2026",
    title: "Support the project",
    changes: [
      "Added a Support page explaining where donations go, with one-off tips and monthly memberships through Ko-fi.",
      "Added a quiet support callout to the homepage, About page and footer — still no ads, accounts or paywall.",
      "Added unit tests for the conversion tools, settings, workflows, the service-worker contract and image helpers.",
      "Upgraded Next.js to 16.4.6.",
    ],
  },
  {
    version: "v3.0.1",
    date: "29 October 2026",
    title: "A smoother workbench",
    changes: [
      "The right-edge ruler now works like a real scrollbar: hover to see the whole page, then click or drag to move.",
      "Section links stay in view, highlight as you reach each section, and animate one letter at a time.",
      "Scrolling is smoother, mobile footer text is centered, and form fields no longer show a boxy focus outline.",
    ],
  },
  {
    version: "v3.0.0",
    date: "29 October 2026",
    title: "SuperPDF 3.0",
    changes: [
      "New SuperPDF name, crimson identity, and superpdf.milinds.dev domain.",
      "Redesigned homepage, typography, dark mode, and mobile layout.",
      "Tool pages gained a preview rail and a simpler file flow.",
      "FAQ search is friendlier, with fuzzy matching and suggestions.",
    ],
  },
  {
    version: "v2.1.1",
    date: "25 October 2026",
    title: "Discovery and policies",
    changes: [
      "Added a sitemap, robots file, canonical URLs, and clearer page descriptions.",
      "Rewrote the privacy, terms, cookie, and security pages.",
      "Removed the blog and tidied footer links.",
    ],
  },
  {
    version: "v2.1.0",
    date: "25 October 2026",
    title: "Workflows and offline use",
    changes: [
      "New design, six more tools, and a workflow builder for repeatable jobs.",
      "Added recent tools, a settings panel, offline support, and Easy/Advanced modes.",
    ],
  },
  {
    version: "v2.0.1",
    date: "26 August 2026",
    title: "Content and discovery",
    changes: [
      "Added the tools index and the main information pages.",
      "Added PDF to Markdown, more split modes, and generated tool docs.",
      "Added the footer version badge.",
    ],
  },
  {
    version: "v2.0.0",
    date: "20 to 22 August 2026",
    title: "The browser toolkit",
    changes: [
      "Rebuilt the app with a modern browser stack.",
      "Added the shared tool shell and 45 tools.",
      "Brought PDF, OCR, document, and image engines into the browser.",
    ],
  },
  {
    version: "v0.1.0",
    date: "20 August 2026",
    title: "Initial scaffold",
    changes: [
      "Started the app with its first layout, tools, tests, and docs.",
    ],
  },
];

export const metadata = pageMetadata({
  title: "Changelog",
  description:
    "Every release of SuperPDF, from the first version to today.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <StaticPage
      centered
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
