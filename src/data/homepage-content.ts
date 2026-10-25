import { TOOL_COUNT } from "@/registry/tools";

export const faqs = [
  {
    question: "Why use SuperPDF instead of another PDF site?",
    answer:
      "Most PDF sites upload the file to a server before they do anything. SuperPDF runs the tool in your browser, so the document stays on your device and the result is ready without a round trip.",
  },
  {
    question: "Are my files uploaded?",
    answer:
      "No. The file is read in the tab with browser engines and WebAssembly. There is no server copy to store, leak, or delete.",
  },
  {
    question: "What can I do with a PDF here?",
    answer:
      `Merge, split, reorder, compress, convert, sign, redact, fill, watermark, and protect. There are ${TOOL_COUNT} tools, and each one opens without an account.`,
  },
  {
    question: "Can I run several tools on one file?",
    answer:
      "Yes. The workflow builder chains PDF tools together, such as compress, add page numbers, then protect. Each step feeds the next, and you run the whole chain once.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Yes, once the page has loaded. Add SuperPDF to your home screen and the installed tools keep working without a connection. OCR needs to download its language model on first use.",
  },
];
