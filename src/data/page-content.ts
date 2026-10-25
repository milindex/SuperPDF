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
      "No. The tool runs in your browser. The file is read on your device, the work happens there, and the result is downloaded there. Nothing is uploaded or stored.",
  },
  {
    category: "Privacy and files",
    question: "How can a PDF be processed without a server?",
    answer:
      "The browser has the engines: pdf-lib for editing, pdf.js for rendering, and WebAssembly builds such as qpdf for encryption. They run in the tab, on the file you chose.",
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
      "The file is only as exposed as your device. Password protection uses AES-256, applied in the browser with qpdf.",
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
      "Yes. The tools are free, with no account, no watermark from us, and no file-count limit.",
  },
  {
    category: "Using the tools",
    question: "Do I need an account?",
    answer:
      "No. Open a tool, add a file, download the result.",
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
      "Most tools work offline once the page and its engines have loaded. OCR downloads a language model on first use.",
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
      "Use the contact page or email support@superpdf.com. Include the tool name, browser version, and what happened.",
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

export const securityControls = [
  {
    title: "Processing in the browser",
    description:
      "JavaScript and WebAssembly do the work in your tab. There is no server pipeline that receives the file.",
  },
  {
    title: "Encryption engine (qpdf/WASM)",
    description:
      "Password protection and unlocking use qpdf compiled to WebAssembly, with AES-256 and standard PDF encryption, on your device.",
  },
  {
    title: "Rendering engine (pdf.js)",
    description:
      "Page rendering and text or image extraction use pdf.js, which runs in the browser without network access.",
  },
  {
    title: "Cross-origin isolation",
    description:
      "Pages that need SharedArrayBuffer are served with COOP and COEP headers, so the browser enforces an isolated context.",
  },
  {
    title: "No file telemetry",
    description:
      "We do not collect or transmit file names, contents, or anything derived from your documents.",
  },
];

export const privacySections = [
  {
    heading: "1. Documents and files",
    body: [
      "SuperPDF processes documents inside your web browser. Files are read from your device, changed by browser engines, and the result is downloaded back to your device.",
      "We do not upload, store, transmit, or analyse your documents, file names, or contents. Because no server receives your files, we cannot access them and neither can a third party.",
    ],
  },
  {
    heading: "2. Information we collect",
    body: [
      "We collect minimal, anonymous usage analytics, such as which tool pages are visited and aggregate tool counts, to understand what is useful and keep the site running.",
      "We do not use this data to build profiles of individual users, and we do not link it to a personal identifier.",
    ],
  },
  {
    heading: "3. Cookies and local storage",
    body: [
      "We use a small number of functional and analytics cookies. The Cookie Policy has the details.",
      "Engines and language models downloaded by tools, such as the OCR model, are cached by your browser. They stay on your device and are not sent to us.",
    ],
  },
  {
    heading: "4. How long data is retained",
    body: [
      "We do not retain your documents. Working copies live in the tab and are released when you close it.",
    ],
  },
  {
    heading: "5. Third-party services",
    body: [
      "SuperPDF does not use third-party document processing services. Code and models such as pdf.js, tesseract, and qpdf are delivered from our hosting, and some may be fetched from a content delivery network at runtime.",
    ],
  },
  {
    heading: "6. Children's privacy",
    body: [
      "We do not knowingly collect personal information from children. The tools need no account and no personal details, so there is no personal data to collect from any user.",
    ],
  },
  {
    heading: "7. Your choices",
    body: [
      "You can disable cookies in your browser at any time. Since document processing is local, doing so does not stop the PDF tools from working.",
    ],
  },
  {
    heading: "8. Changes to this policy",
    body: [
      "We may update this policy. A material change will show in the date at the top of this page.",
    ],
  },
];

export const termsSections = [
  {
    heading: "1. Agreement",
    body: [
      "By using SuperPDF, you agree to these Terms and Conditions. If you do not agree, stop using the service.",
    ],
  },
  {
    heading: "2. The service",
    body: [
      "SuperPDF provides browser-based PDF tools that process documents on your device. We do not guarantee that every tool is available, error-free, or suitable for a particular purpose.",
    ],
  },
  {
    heading: "3. Acceptable use",
    body: [
      "Do not use SuperPDF to process unlawful content, infringe the rights of others, distribute malware, or misuse the service. You are responsible for the documents you process and for the lawful use of the output.",
    ],
  },
  {
    heading: "4. Intellectual property",
    body: [
      "SuperPDF, its name, logo, and the software behind the service belong to their respective owners. You keep all rights to the documents you process and the files you create.",
    ],
  },
  {
    heading: "5. Disclaimer of warranties",
    body: [
      "The service is provided as is and as available, without warranties of any kind, express or implied, including implied warranties of merchantability and fitness for a particular purpose. We do not warrant uninterrupted or error-free operation.",
    ],
  },
  {
    heading: "6. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, SuperPDF and its providers are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost data or profits, arising from your use of the service.",
    ],
  },
  {
    heading: "7. Third-party libraries",
    body: [
      "The service relies on open-source libraries including pdf-lib, pdf.js, qpdf, and tesseract.js, each under its own licence. Their inclusion does not imply endorsement or liability.",
    ],
  },
  {
    heading: "8. Changes to these terms",
    body: [
      "We may revise these terms. Continued use after a change takes effect means you accept the revised terms.",
    ],
  },
  {
    heading: "9. Governing law",
    body: [
      "These terms are governed by the laws of the jurisdiction where the service operator is established, without regard to conflict-of-law principles.",
    ],
  },
  {
    heading: "10. Contact",
    body: ["Questions about these terms can go to support@superpdf.com."],
  },
];

export const cookieSections = [
  {
    heading: "1. What are cookies?",
    body: [
      "Cookies are small text files your browser stores on your device. They are commonly used to make a website work, or work more efficiently.",
    ],
  },
  {
    heading: "2. Cookies we use",
    body: [
      "Functional cookies: needed to keep the tools working smoothly, such as remembering a preference during a session.",
      "Analytics cookies: used to count tool usage anonymously so we can improve the site. They contain no document data.",
    ],
  },
  {
    heading: "3. No tracking of document contents",
    body: [
      "Our cookies never store or transmit information about the files you process. Document contents are processed locally and never leave your device.",
    ],
  },
  {
    heading: "4. Managing cookies",
    body: [
      "You can block or delete cookies in your browser settings. Since the PDF tools work locally, blocking cookies does not stop them.",
    ],
  },
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
      "The browser can do the work. SuperPDF uses pdf-lib, pdf.js, qpdf (WebAssembly), and other engines to read and change the file in the tab.",
  },
  {
    title: "The result",
    description:
      `${TOOL_COUNT} PDF tools and a workflow builder, free to use, with no account, no upload, and no server copy.`,
  },
];

export const blogPosts = [
  {
    slug: "privacy-first-pdf-tools",
    title: "Why local PDF tools matter",
    excerpt:
      "Most online PDF tools upload your document before they do anything. Browser processing removes that step, and the risk that comes with it.",
    date: "2026-01-15",
    readTime: "5 min",
    tags: ["Privacy", "Security"],
    body: [
      "When you upload a document to an online tool, you trust the provider to protect it. Files may be stored, analysed, or exposed in a breach, and the content is often something you never meant to share.",
      "Browser processing removes the upload. The document is opened in the tab, changed by engines running there, and the result is downloaded. There is no server copy to breach, no log to leak, and no third party with access.",
      "SuperPDF is built this way. pdf-lib edits documents, pdf.js renders pages, qpdf compiled to WebAssembly handles encryption, and tesseract.js performs OCR. The file stays on the device throughout.",
      "The trade-offs are real. Exact Office to PDF conversion needs engines the browser does not have, and large files use device memory. For most PDF work, the browser is enough, and the privacy stays intact.",
    ],
  },
  {
    slug: "pdf-encryption-in-the-browser",
    title: "How PDF encryption works in your browser",
    excerpt:
      "Password protection usually means uploading the file. qpdf compiled to WebAssembly changes that. Here is how it works.",
    date: "2026-02-03",
    readTime: "6 min",
    tags: ["Security", "Encryption"],
    body: [
      "PDF encryption is well defined: the document is encrypted with AES-128 or AES-256 using keys derived from the user and owner passwords. qpdf implements it correctly, but it is written in C++ and needs somewhere to run.",
      "We compile qpdf to WebAssembly. The engine loads in the browser, reads the file directly, and produces an encrypted copy without a network request.",
      "One technical detail: WebAssembly builds that use SharedArrayBuffer need the page to be cross-origin isolated. We serve those pages with COOP and COEP headers, and the browser enforces the context.",
      "The practical result is simple. You can add or remove a password, and the file never leaves your device.",
    ],
  },
  {
    slug: "ocr-without-the-cloud",
    title: "OCR without the cloud",
    excerpt:
      "Scanned pages usually need a cloud service to become searchable. tesseract.js runs the recognition in the browser instead.",
    date: "2026-03-10",
    readTime: "5 min",
    tags: ["OCR", "Privacy"],
    body: [
      "Optical character recognition turns a scan into searchable text. Cloud OCR services ask you to upload the scan, which is a problem for contracts, medical records, and research.",
      "tesseract.js compiles the Tesseract engine to WebAssembly. The recognition runs in the browser, and the language model is downloaded once and cached on the device.",
      "Accuracy is comparable to many cloud services for clean printed English. Handwriting and poor scans remain hard for any engine.",
      "In SuperPDF, the OCR tool renders each page, runs tesseract.js, and returns the recognised text as a download. The scan stays on the device.",
    ],
  },
  {
    slug: "building-a-client-side-pdf-suite",
    title: "What it takes to run a PDF suite in the browser",
    excerpt:
      "The engines, the Service Worker, and the hard limits behind a PDF toolkit that runs in the browser.",
    date: "2026-04-22",
    readTime: "7 min",
    tags: ["Engineering", "Architecture"],
    body: [
      "A full PDF toolkit in the browser is a set of constraints. No single library does everything, so SuperPDF combines pdf-lib for editing, pdf.js for rendering and text extraction, qpdf (WebAssembly) for encryption, html2pdf.js for HTML, and tesseract.js for OCR.",
      "A Service Worker routes processing tasks and keeps large operations off the main thread where possible. The same shared shell gives every tool a consistent drop zone, options, and result banner.",
      "The limits are clear. There is no reliable browser renderer for PowerPoint, so PPTX to PDF is not offered. Webpage to PDF can only fetch pages that allow the read.",
      `Within those limits, ${TOOL_COUNT} tools run in the browser. That is enough to cover most of the PDF work people actually do.`,
    ],
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
