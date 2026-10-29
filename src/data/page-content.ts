import { TOOL_COUNT } from "@/registry/tools";

export interface Faq {
  question: string;
  answer: string;
  category?: string;
}

export const fullFaqs: Faq[] = [
  {
    category: "Privacy and files",
    question: "Do my files leave my device?",
    answer:
      "No. You choose the file, and it is read in this tab, on your device. Nothing is uploaded, stored, or sent to us.",
  },
  {
    category: "Privacy and files",
    question: "How can a PDF be processed without a server?",
    answer:
      "The browser can do the work now. The tools read and change the file in the tab, using PDF engines that run on your device. There is no server round trip.",
  },
  {
    category: "Privacy and files",
    question: "Can you see the files I process?",
    answer:
      "No. There is no server copy, so there is nothing for us or a third party to open.",
  },
  {
    category: "Privacy and files",
    question: "Is my data secure?",
    answer:
      "The file stays on your device, so it is as safe as your device. For sensitive documents, keep your browser updated and use a password when you share the result.",
  },
  {
    category: "Privacy and files",
    question: "Is SuperPDF safe for contracts and medical records?",
    answer:
      "The file never goes to us. It is read and changed on your device, so there is no server copy to leak. Your device and browser still need to be secure — use a password for anything you send onward.",
  },
  {
    category: "Privacy and files",
    question: "Do you store any files?",
    answer:
      "No. Working copies live in the tab and are released when you close it.",
  },
  {
    category: "Using the tools",
    question: "Is SuperPDF free?",
    answer:
      "Yes. Every tool is free, with no account, no watermark from us, and no daily limit.",
  },
  {
    category: "Using the tools",
    question: "Do I need an account?",
    answer:
      "No. No email, no sign-up, no login. Open a tool, add a file, download the result.",
  },
  {
    category: "Using the tools",
    question: "Why use SuperPDF instead of another PDF site?",
    answer:
      "Most PDF sites upload your document before they do anything. We don't. The file stays on your device, so there is no upload wait and no server copy. You also get all the everyday tools in one place.",
  },
  {
    category: "Using the tools",
    question: "Does SuperPDF work on a phone or tablet?",
    answer:
      "Yes. The tools work in a current mobile browser. Very large files are easier on a computer because they need more memory.",
  },
  {
    category: "Using the tools",
    question: "What does Public Beta mean?",
    answer:
      "The tools work, and we are still smoothing the edges. If something feels wrong, tell us on GitHub. It genuinely helps.",
  },
  {
    category: "Using the tools",
    question: "Is there a file size limit?",
    answer:
      "The limit is your device memory. Large files take longer and use more RAM, but nothing is sent away.",
  },
  {
    category: "Using the tools",
    question: "How fast is processing?",
    answer:
      "There is no upload or download wait. Most tasks finish in seconds; large files depend on the device.",
  },
  {
    category: "Using the tools",
    question: "Which browsers are supported?",
    answer:
      "Current versions of Chrome, Edge, Firefox, and Safari.",
  },
  {
    category: "Using the tools",
    question: "Does it work offline?",
    answer:
      "Yes, after the first load. Add SuperPDF to your home screen and the installed tools keep working without a connection. OCR downloads a language model the first time.",
  },
  {
    category: "Formats",
    question: "Which input formats are supported?",
    answer:
      "PDF, Word (.docx), Excel (.xlsx and .xls), images (JPG, PNG, WEBP, SVG, HEIC, TIFF), text (.txt, .md, .log), and CSV. OCR reads scanned PDFs.",
  },
  {
    category: "Formats",
    question: "Which output formats are supported?",
    answer:
      "PDF for every conversion target, plus Word (.docx), Excel (.xlsx), PowerPoint (.pptx), JPG, PNG, SVG, plain text, Markdown, and HTML.",
  },
  {
    category: "Formats",
    question: "Can I convert a scanned PDF into editable text?",
    answer:
      "Yes. The OCR tool runs tesseract.js in the browser. Clean printed English works best; handwriting and poor scans are harder.",
  },
  {
    category: "Tools",
    question: "How many tools does SuperPDF have?",
    answer:
      `${TOOL_COUNT} tools across organising, editing, security, optimisation, and conversion. The full list is on the tools page.`,
  },
  {
    category: "Tools",
    question: "Can I combine multiple images into one PDF?",
    answer:
      "Yes. The JPG, PNG, WEBP, SVG, HEIC, and TIFF tools accept several files and place one image on each page.",
  },
  {
    category: "Tools",
    question: "Does password protection work in the browser?",
    answer:
      "Yes. qpdf is compiled to WebAssembly and applies AES-256 locally. The password and the file never leave the tab.",
  },
  {
    category: "Tools",
    question: "Can I fill in PDF forms?",
    answer:
      "Yes. The Fill Out PDF tool lists the form fields by name, writes in your values, and can flatten them so they cannot be edited.",
  },
  {
    category: "Tools",
    question: "What does flatten do?",
    answer:
      "It turns interactive fields and annotations into static page content, like printing the values into the page. The result looks the same in every viewer.",
  },
  {
    category: "Tools",
    question: "Can I run several tools on one file?",
    answer:
      "Yes. The workflow builder chains PDF tools in a fixed order, such as compress, add page numbers, then protect. Each step feeds the next.",
  },
  {
    category: "Tools",
    question: "Does compression reduce quality?",
    answer:
      "Compression renders pages as JPEG images, so text stops being selectable and detail drops at lower quality settings. Text-only PDFs may not shrink much.",
  },
  {
    category: "Limits",
    question: "Why can't I convert PowerPoint (.pptx) to PDF?",
    answer:
      "PowerPoint needs a layout engine that is not available in the browser. Word and Excel conversion is supported; PPTX to PDF is not.",
  },
  {
    category: "Limits",
    question: "Are Word and Excel conversions exact?",
    answer:
      "No. They keep text, headings, and tables but simplify complex layouts, charts, and precise styling.",
  },
  {
    category: "Limits",
    question: "Will the PDF/A converter pass conformance checks?",
    answer:
      "It produces a self-contained PDF with embedded fonts and metadata, but it is a best-effort PDF/A copy. Strict conformance also needs ICC profiles.",
  },
  {
    category: "Limits",
    question: "Why does the webpage-to-PDF tool fail on some sites?",
    answer:
      "The browser has to fetch the page first. Many sites block that read, so only pages that allow it can be converted without a server.",
  },
  {
    category: "Technical",
    question: "What powers SuperPDF?",
    answer:
      "Next.js with a Service Worker, pdf-lib, pdf.js, qpdf (WebAssembly), tesseract.js, docx, xlsx, html2pdf.js, heic2any, and utif. All of it runs in the browser.",
  },
  {
    category: "Technical",
    question: "Why do some pages need cross-origin isolation?",
    answer:
      "The encryption engine uses SharedArrayBuffer, which browsers allow only on pages served with COOP and COEP headers. We enable those headers so protect and unlock stay in the browser.",
  },
  {
    category: "Technical",
    question: "Do I need to install anything?",
    answer:
      "No. SuperPDF is a website. Some tools download a small engine or language model on first use, and the browser caches it.",
  },
  {
    category: "Support",
    question: "How do I report a bug or request a feature?",
    answer:
      "Use the contact page or email connect@milinds.dev. Include the tool name, browser version, and what happened.",
  },
  {
    category: "Support",
    question: "Can I suggest a new PDF tool?",
    answer:
      "Yes. Send it through the contact page. We prioritise tools that can run in the browser without a server.",
  },
];

export const businessUseCases = [
  {
    icon: "protect",
    title: "Sign a contract",
    description:
      "Add a signature in the tab. The client's contract never goes to a third-party signing service.",
  },
  {
    icon: "merge",
    title: "Build a client pack",
    description:
      "Merge the proposal, invoice, and report into one PDF before it leaves the office.",
  },
  {
    icon: "convert",
    title: "Send the format they ask for",
    description:
      "Convert Word and Excel files to PDF, or pull PDF content back into an editable Office file.",
  },
  {
    icon: "security",
    title: "Protect what you share",
    description:
      "Add an AES-256 password before a file goes outside the organisation. The password is applied on the sender's device.",
  },
  {
    icon: "organize",
    title: "Keep packs consistent",
    description:
      "Crop, number, and reorder pages so every document set follows the same layout.",
  },
  {
    icon: "ocr",
    title: "Open the paper archive",
    description:
      "Run OCR on scans so they can be searched, without sending them to a cloud recognition service.",
  },
];

export const businessBenefits = [
  "No file leaves the device",
  "No per-seat licence or server cost",
  "AES-256 applied locally",
  "No accounts or admin setup",
  "Runs on the browsers your team already has",
  "A shorter data-protection review",
];

export const educationUseCases = [
  {
    icon: "pdf-to-word",
    title: "Edit lecture handouts",
    description:
      "Turn a PDF handout into an editable Word file, or send it back as a PDF for distribution.",
  },
  {
    icon: "merge",
    title: "Build a reading pack",
    description:
      "Merge the reading list, handouts, and lab sheets into one study file.",
  },
  {
    icon: "ocr",
    title: "Search the archive",
    description:
      "Make scanned articles and old papers searchable with OCR in the browser.",
  },
  {
    icon: "scan",
    title: "Scan from a phone",
    description:
      "Use the camera to capture a worksheet and save it as a clean PDF.",
  },
  {
    icon: "fill-forms",
    title: "Fill in a form",
    description:
      "Complete a digital application without printing it first.",
  },
  {
    icon: "protect",
    title: "Protect student work",
    description:
      "Password-protect a submission before sharing it, with the file staying on the device.",
  },
];

export const educationBenefits = [
  "Free for students and schools",
  "No student file is uploaded",
  "Works on school and personal devices",
  "No accounts to manage",
  "A simpler data-protection review",
];

export const aboutMilestones = [
  {
    title: "The problem",
    description:
      "Most PDF sites ask you to upload the file first. For a contract, a medical record, or a client's accounts, that is a needless exposure.",
  },
  {
    title: "The approach",
    description:
      "The browser can do the work now. SuperPDF reads and changes the file in this tab, using PDF engines that run on your device.",
  },
  {
    title: "The result",
    description:
      `${TOOL_COUNT} PDF tools and a workflow builder, free to use, with no account, no upload, and no server copy.`,
  },
];

export const pressFacts = [
  ["Name", "SuperPDF"],
  ["Founded", "2026"],
  ["Founder", "Milind Sonawane"],
  ["Category", "Browser-based PDF tools"],
  ["Business model", "Free, no accounts"],
  ["Platform", "Web (Next.js, WebAssembly)"],
  ["Tools", String(TOOL_COUNT)],
  ["Data handling", "No uploads, no server copy"],
];

export const pressBoilerplate =
  "SuperPDF is a free PDF toolkit that runs in the browser. It uses pdf-lib, pdf.js, qpdf (WebAssembly), and tesseract.js to merge, split, compress, convert, sign, and protect documents on the user's device. Files are not uploaded, stored, or analysed by a server.";
