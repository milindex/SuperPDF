import StaticPage from "@/components/StaticPage/StaticPage";
import { aboutMilestones } from "@/data/page-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "SuperPDF is a free PDF toolkit for people who would rather keep the file to themselves. The work happens in your browser, on your device.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <StaticPage
      centered
      path="/about"
      title="About"
      intro="SuperPDF is a free PDF toolkit for people who would rather keep the file to themselves. The work happens in your browser, on your device."
      sections={[
        {
          heading: "Why this exists",
          body: [
            "Most PDF sites ask for the file before they do anything. For a contract, a medical record, or a client's accounts, that is a needless exposure.",
            "The browser can do this work now. SuperPDF was built to make that the normal way to handle a PDF, not a technical demo.",
          ],
        },
        ...aboutMilestones.map((milestone) => ({
          heading: milestone.title,
          body: [milestone.description],
        })),
        {
          heading: "What we will not do",
          bullets: [
            "We do not upload your files.",
            "We do not require an account to use a tool.",
            "We do not add our watermark to the output.",
            "We do not build features that need a server copy of the document.",
          ],
        },
      ]}
    />
  );
}
