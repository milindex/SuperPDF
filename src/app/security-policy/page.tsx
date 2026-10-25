import StaticPage from "@/components/StaticPage/StaticPage";
import { securityControls } from "@/data/page-content";

export default function SecurityPolicyPage() {
  return (
    <StaticPage
      title="Security"
      intro="How the browser processing works, and what it means for your files."
      updated="2026"
      sections={[
        {
          heading: "The short version",
          body: [
            "The document is read and changed in your browser. There is no document-processing server, so there is no network copy to intercept, store, or leak.",
          ],
        },
        ...securityControls.map((c) => ({
          heading: c.title,
          body: [c.description],
        })),
        {
          heading: "In practice",
          bullets: [
            "Files are read directly from your device and results are downloaded locally.",
            "Password-protected PDFs use AES-256, computed on your device.",
            "OCR language models and engine assets are downloaded once and cached by your browser.",
            "We never see, store, or transmit your document contents.",
          ],
        },
      ]}
    />
  );
}