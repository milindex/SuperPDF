import { TOOL_COUNT } from "@/registry/tools";

export const faqs = [
  {
    question: "Do I have to upload my PDF?",
    answer:
      "No. You choose the file, and it is read in this tab. There is no server copy, so there is nothing to store or delete.",
  },
  {
    question: "Is SuperPDF really free?",
    answer:
      "Yes. No account, no watermark, no daily limit and no ads. It is open source, and you can use every tool as often as you need.",
  },
  {
    question: "Is it safe for contracts and private files?",
    answer:
      "The file stays on your device. We never receive it. Your device's own security still matters, so keep your browser updated and use a password for files you share.",
  },
  {
    question: "Why use this instead of a big PDF site?",
    answer:
      "Most PDF sites upload your document first. We don't. That means no upload wait, no server copy and nothing to delete afterwards — plus all the tools in one place.",
  },
  {
    question: "What can I do with a PDF here?",
    answer: `${TOOL_COUNT} tools: merge, split, reorder, compress, convert, sign, redact, fill, watermark and protect. Every one opens without an account.`,
  },
  {
    question: "Do I need an account?",
    answer: "No. No email, no sign-up, no login.",
  },
  {
    question: "Can I use it offline?",
    answer:
      "Yes, after the first load. Add SuperPDF to your home screen and the installed tools keep working without a connection. OCR downloads its language model once.",
  },
  {
    question: "What if my file is very large?",
    answer:
      "The work happens in your browser, so very large files depend on your device's memory. If a file is too heavy, the tool will tell you — nothing is sent away.",
  },
  {
    question: "What does Public Beta mean?",
    answer:
      "The tools work, and we are still smoothing the edges. If something feels wrong, please tell us on GitHub. It genuinely helps.",
  },
];
