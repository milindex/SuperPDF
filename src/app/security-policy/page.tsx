import StaticPage from "@/components/StaticPage/StaticPage";
import { securityControls } from "@/data/page-content";

export default function SecurityPolicyPage() {
  return (
    <StaticPage
      title="Security"
      intro="How SuperPDF keeps your documents private and secure."
      updated="2026"
      sections={[
        {
          heading: "The core guarantee",
          body: [
            "SuperPDF processes every document in your browser. There is no document-processing server, so your files cannot be intercepted, stored, analyzed, or leaked at the network level.",
          ],
        },
        ...securityControls.map((c) => ({
          heading: c.title,
          body: [c.description],
        })),
        {
          heading: "What this means in practice",
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