import StaticPage from "@/components/StaticPage/StaticPage";
import { aboutMilestones } from "@/data/page-content";

export default function AboutPage() {
  return (
    <StaticPage
      title="About Us"
      intro="SuperPDF is a privacy-first PDF toolkit built on a simple idea: your documents belong to you, and processing them should never require handing them to a server."
      sections={[
        {
          heading: "Our mission",
          body: [
            "Most PDF tools upload your documents to a server to process them. That means trusting a third party with files that may contain contracts, medical records, financial data, or personal information.",
            "Modern browsers are powerful enough to do this work locally. SuperPDF was built to prove it — a complete PDF toolkit that runs entirely in the browser using proven client-side engines.",
          ],
        },
        ...aboutMilestones.map((m) => ({
          heading: m.title,
          body: [m.description],
        })),
        {
          heading: "Our values",
          bullets: [
            "Privacy is a feature, not a checkbox — files should never leave your device.",
            "Free tools should not come at the cost of your data.",
            "Transparency matters — we tell you exactly how processing works.",
            "Fast, reliable tools beat feature bloat.",
          ],
        },
      ]}
    />
  );
}