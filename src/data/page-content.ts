export interface Faq {
  question: string;
  answer: string;
  category?: string;
}

export const fullFaqs: Faq[] = [
  {
    category: "Privacy & Security",
    question: "Do my files ever leave my device?",
    answer:
      "No. Every tool in SuperPDF runs entirely in your browser using a Service Worker and WebAssembly. Your files are read locally, processed locally, and the result is downloaded to your device. Nothing is uploaded, stored, or transmitted.",
  },
  {
    category: "Privacy & Security",
    question: "How is it possible to process PDFs without a server?",
    answer:
      "Modern browsers are powerful enough to handle PDF processing locally. SuperPDF uses pdf-lib for document manipulation, pdf.js for rendering, and compiled WebAssembly engines (like qpdf) for encryption and decryption — all running in your browser.",
  },
  {
    category: "Privacy & Security",
    question: "Can you see the files I process?",
    answer:
      "No. Because your files never leave your browser, we have no access to their contents — and neither does any third party. This is the core privacy guarantee of SuperPDF.",
  },
  {
    category: "Privacy & Security",
    question: "Is my data secure?",
    answer:
      "Yes. Files stay on your device, so they are only as exposed as your device is. For password protection we use industry-standard AES-256 encryption, applied locally with the qpdf engine.",
  },
  {
    category: "Privacy & Security",
    question: "Do you store any of my files?",
    answer:
      "No. We do not run servers that receive or store documents. Any browser cache of an uploaded file is cleared when the page is closed.",
  },
  {
    category: "Usage",
    question: "Is SuperPDF free to use?",
    answer:
      "Yes. All core tools are completely free, with no accounts, no watermarks, and no file count limits. If premium features are introduced in the future, the essential tools will remain free.",
  },
  {
    category: "Usage",
    question: "Do I need to create an account?",
    answer:
      "No account is required. Open any tool, drop in a file, and download the result. There is no sign-up and no login.",
  },
  {
    category: "Usage",
    question: "Is there a file size limit?",
    answer:
      "There is no artificial limit. The practical ceiling is your device memory — large PDFs (hundreds of MB) may use significant RAM, so performance depends on your hardware.",
  },
  {
    category: "Usage",
    question: "How fast is processing?",
    answer:
      "Because processing happens locally, there is no upload or download latency. Most operations complete in seconds, and large files process faster than server-based tools because no network transfer is involved.",
  },
  {
    category: "Usage",
    question: "Which browsers are supported?",
    answer:
      "SuperPDF works in all modern browsers: Chrome, Edge, Firefox, and Safari. We recommend the latest stable version of your browser for the best performance.",
  },
  {
    category: "Usage",
    question: "Does it work offline?",
    answer:
      "Most tools work offline once the page and its engines are loaded. Some tools that download model files (like OCR) need an internet connection on first use.",
  },
  {
    category: "Formats",
    question: "Which input formats are supported?",
    answer:
      "PDF, Word (.docx), Excel (.xlsx/.xls), images (JPG, PNG, WEBP, SVG, HEIC, TIFF), text (.txt, .md, .log), and CSV. OCR extracts text from scanned PDFs.",
  },
  {
    category: "Formats",
    question: "Which output formats are supported?",
    answer:
      "PDF for all conversion targets, plus Word (.docx), Excel (.xlsx), PowerPoint (.pptx), images (JPG, PNG, SVG), plain text (.txt), and HTML.",
  },
  {
    category: "Formats",
    question: "Can I convert a scanned PDF into editable text?",
    answer:
      "Yes. The PDF OCR tool extracts text from scanned documents using tesseract.js, which runs in your browser. English is supported; accuracy depends on scan quality.",
  },
  {
    category: "Tools",
    question: "How many tools does SuperPDF have?",
    answer:
      "SuperPDF currently offers 44 tools across organizing, editing, security, optimization, and conversion categories — with more added regularly.",
  },
  {
    category: "Tools",
    question: "Can I combine multiple images into one PDF?",
    answer:
      "Yes. JPG, PNG, WEBP, SVG, HEIC, and TIFF to-PDF tools accept multiple files and place one image per page in a single PDF.",
  },
  {
    category: "Tools",
    question: "Does password protection really work in the browser?",
    answer:
      "Yes. We bundle the qpdf engine compiled to WebAssembly. Protecting and unlocking PDFs uses the same AES-256 / RC4 algorithms as server tools, done locally on your device.",
  },
  {
    category: "Tools",
    question: "Can I fill in PDF forms?",
    answer:
      "Yes. The Fill Out PDF tool lists form fields by name; you enter values, and they are written into the document. You can also flatten fields so they become non-editable.",
  },
  {
    category: "Tools",
    question: "What is 'flatten' when filling forms?",
    answer:
      "Flattening converts interactive form fields into static content, like printing the values into the page. The result is a non-editable document that renders consistently in any viewer.",
  },
  {
    category: "Tools",
    question: "Does compression reduce quality?",
    answer:
      "Compression re-renders pages as JPEG images, so text becomes non-selectable and there is some quality trade-off at lower quality settings. Text-only PDFs may not shrink much.",
  },
  {
    category: "Limitations",
    question: "Why can't I convert a PowerPoint (.pptx) file to PDF?",
    answer:
      "The Office conversion tools cover Word and Excel. PowerPoint rendering requires a layout engine that isn't available in-browser, so we currently don't offer pptx-to-PDF.",
  },
  {
    category: "Limitations",
    question: "Are converted Word/Excel files perfect replicas?",
    answer:
      "No. Word and Excel conversions preserve text, headings, and tables but simplify complex layouts, charts, and precise styling. For pixel-perfect output, consider our PDF-to-PDF options.",
  },
  {
    category: "Limitations",
    question: "Is the PDF/A converter guaranteed to pass conformance checks?",
    answer:
      "It produces a self-contained, single-layer PDF with embedded fonts and metadata — a best-effort PDF/A approximation. It is not guaranteed to pass strict conformance validation, which requires ICC profiles.",
  },
  {
    category: "Limitations",
    question: "Why does the webpage-to-PDF tool fail on many sites?",
    answer:
      "Converting a webpage requires fetching its HTML. Most third-party sites block browser-side cross-origin reads (CORS), so only same-origin or CORS-enabled pages can be converted without a server.",
  },
  {
    category: "Technical",
    question: "What technology powers SuperPDF?",
    answer:
      "Next.js with a Service Worker, pdf-lib, pdf.js, qpdf (WASM), tesseract.js, docx, xlsx, html2pdf.js, heic2any, and utif. Everything is bundled to run client-side.",
  },
  {
    category: "Technical",
    question: "Why do some pages require cross-origin isolation?",
    answer:
      "The encryption engine uses SharedArrayBuffer, which browsers only allow on pages served with COOP/COEP headers. We enable these headers so protect/unlock work entirely in-browser.",
  },
  {
    category: "Technical",
    question: "Do I need to install anything?",
    answer:
      "No. SuperPDF is a website. Some tools download a small engine or language model on first use (e.g., OCR), which is cached by your browser.",
  },
  {
    category: "Support",
    question: "How do I report a bug or request a feature?",
    answer:
      "Use the contact page to reach us, or email support@superpdf.com. Include the tool name, browser version, and a description of the issue.",
  },
  {
    category: "Support",
    question: "Can I suggest a new PDF tool?",
    answer:
      "Absolutely. We prioritize privacy-first, client-side tools. Send your idea through the contact page and we'll consider it for the roadmap.",
  },
];

export const businessUseCases = [
  {
    icon: "protect",
    title: "Sign contracts securely",
    description:
      "Use the Sign PDF tool to add signatures to contracts. Documents never leave the device, so client data stays within your organization.",
  },
  {
    icon: "merge",
    title: "Combine client files",
    description:
      "Merge proposals, invoices, and reports into a single document for sharing — without uploading confidential data to a third-party service.",
  },
  {
    icon: "convert",
    title: "Share in the right format",
    description:
      "Convert Word and Excel files to PDF for reliable viewing, or extract PDF content into editable Office formats for your team.",
  },
  {
    icon: "security",
    title: "Protect sensitive documents",
    description:
      "Add AES-256 password protection to files before sharing externally, all processed locally on the sender's device.",
  },
  {
    icon: "organize",
    title: "Standardize document layout",
    description:
      "Remove watermarks, crop margins, add page numbers, and reorganize pages to meet your company's document standards.",
  },
  {
    icon: "ocr",
    title: "Digitize paper archives",
    description:
      "Run OCR on scanned documents to make them searchable — without sending sensitive scans to an external OCR service.",
  },
];

export const businessBenefits = [
  "Zero data exposure — files never leave the device",
  "No per-seat licensing or server costs",
  "AES-256 encryption, computed locally",
  "No accounts or admin overhead",
  "Consistent, fast processing on any modern browser",
  "Compliance-friendly for handling client data",
];

export const educationUseCases = [
  {
    icon: "pdf-to-word",
    title: "Convert lecture notes",
    description:
      "Turn PDF handouts into editable Word documents for annotation, or back into PDFs for distribution.",
  },
  {
    icon: "merge",
    title: "Combine course materials",
    description:
      "Merge reading lists, handouts, and lab sheets into a single study packet.",
  },
  {
    icon: "ocr",
    title: "Digitize research papers",
    description:
      "Make scanned articles and archives searchable with in-browser OCR.",
  },
  {
    icon: "scan",
    title: "Scan documents with a phone",
    description:
      "Use the camera to capture worksheets and handouts and save them as clean PDFs.",
  },
  {
    icon: "fill-forms",
    title: "Fill in application forms",
    description:
      "Complete digital forms directly in the browser without printing.",
  },
  {
    icon: "protect",
    title: "Protect student work",
    description:
      "Password-protect submissions before sharing, keeping student data on the device.",
  },
];

export const educationBenefits = [
  "Free — no cost to schools or students",
  "Private — no student data is uploaded",
  "Works on school devices and personal laptops",
  "No accounts needed, works in any modern browser",
  "Fulfils data-protection requirements for minors",
];

export const securityControls = [
  {
    title: "In-browser processing",
    description:
      "All document manipulation is performed by JavaScript and WebAssembly running in your browser. There is no server-side processing pipeline that ever receives your files.",
  },
  {
    title: "Encryption engine (qpdf/WASM)",
    description:
      "Password protection and unlocking use the qpdf library compiled to WebAssembly, implementing AES-256 and standard PDF encryption directly on your device.",
  },
  {
    title: "Rendering engine (pdf.js)",
    description:
      "Page rendering and text/image extraction use pdf.js, which executes entirely in the browser and requires no network access.",
  },
  {
    title: "Cross-origin isolation",
    description:
      "Pages that need SharedArrayBuffer are served with COOP/COEP headers, ensuring the browser enforces a strict, isolated execution context.",
  },
  {
    title: "No telemetry of file contents",
    description:
      "We do not collect or transmit file names, contents, or any data derived from your documents.",
  },
];

export const privacySections = [
  {
    heading: "1. Documents and files",
    body: [
      "SuperPDF processes all documents entirely within your web browser. Files are read locally from your device, manipulated by client-side engines, and the resulting output is downloaded back to your device.",
      "We do not upload, store, transmit, or analyze your documents, file names, or file contents. Because no server receives your files, we cannot access them — and neither can any third party.",
    ],
  },
  {
    heading: "2. Information we collect",
    body: [
      "We collect minimal, anonymous usage analytics (for example, which tool pages are visited and aggregate counts of tool usage) to understand which features are useful and to keep the site running reliably.",
      "We do not use this analytics to build profiles of individual users, and we do not link it to any personal identifier.",
    ],
  },
  {
    heading: "3. Cookies and local storage",
    body: [
      "We use a small number of functional and analytics cookies. Details are described in the Cookie Policy.",
      "Engines and language models downloaded by tools (such as the OCR model) are cached by your browser for performance; they remain on your device and are not sent to us.",
    ],
  },
  {
    heading: "4. How long data is retained",
    body: [
      "We do not retain any of your documents. Browser caches created during a session are cleared when you close the page or tab.",
    ],
  },
  {
    heading: "5. Third-party services",
    body: [
      "SuperPDF does not use third-party document processing services. Code and models (e.g., pdf.js, tesseract, qpdf) are delivered from our own hosting; some may be fetched from a content delivery network at runtime.",
    ],
  },
  {
    heading: "6. Children's privacy",
    body: [
      "We do not knowingly collect personal information from children. Since no account or personal data is required to use the tools, there is no personal data to collect from any user, regardless of age.",
    ],
  },
  {
    heading: "7. Your choices",
    body: [
      "You can disable cookies in your browser at any time. Because document processing is local, disabling cookies does not stop the core PDF tools from working.",
    ],
  },
  {
    heading: "8. Changes to this policy",
    body: [
      "We may update this policy from time to time. Material changes will be reflected by the 'last updated' date at the top of this page.",
    ],
  },
];

export const termsSections = [
  {
    heading: "1. Agreement",
    body: [
      "By accessing or using SuperPDF, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the service.",
    ],
  },
  {
    heading: "2. The service",
    body: [
      "SuperPDF provides browser-based PDF tools that process documents locally on your device. We make no guarantee that every tool is available, error-free, or suitable for a particular purpose.",
    ],
  },
  {
    heading: "3. Acceptable use",
    body: [
      "You agree not to use SuperPDF to process unlawful content, to infringe the rights of others, to distribute malware, or to otherwise misuse the service. You are responsible for the documents you process and the lawful use of the output.",
    ],
  },
  {
    heading: "4. Intellectual property",
    body: [
      "SuperPDF, its name, logo, and the software comprising the service are the property of their respective owners. You retain all rights to the documents you process and to the output files you create.",
    ],
  },
  {
    heading: "5. Disclaimer of warranties",
    body: [
      "The service is provided 'as is' and 'as available' without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose. We do not warrant that the service will be uninterrupted or error-free.",
    ],
  },
  {
    heading: "6. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, in no event shall SuperPDF or its providers be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data or profits, arising out of or related to your use of the service.",
    ],
  },
  {
    heading: "7. Third-party libraries",
    body: [
      "The service relies on open-source libraries (pdf-lib, pdf.js, qpdf, tesseract.js, and others) distributed under their own licenses. Their inclusion does not imply endorsement or liability.",
    ],
  },
  {
    heading: "8. Changes to these terms",
    body: [
      "We may revise these terms at any time. Continued use of the service after changes take effect constitutes acceptance of the revised terms.",
    ],
  },
  {
    heading: "9. Governing law",
    body: [
      "These terms are governed by the laws of the jurisdiction in which the service operator is established, without regard to conflict-of-law principles.",
    ],
  },
  {
    heading: "10. Contact",
    body: [
      "Questions about these terms can be directed to support@superpdf.com.",
    ],
  },
];

export const cookieSections = [
  {
    heading: "1. What are cookies?",
    body: [
      "Cookies are small text files stored on your device by your browser. They are widely used to make websites work, or work more efficiently.",
    ],
  },
  {
    heading: "2. Cookies we use",
    body: [
      "Functional cookies: required to keep the tools working smoothly (for example, remembering your preference settings during a session).",
      "Analytics cookies: used to count tool usage anonymously so we can improve the site. These contain no document data.",
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
      "You can block or delete cookies through your browser settings. Since the PDF tools process documents locally, blocking cookies does not stop them from working.",
    ],
  },
];

export const aboutMilestones = [
  {
    title: "The problem",
    description:
      "Popular PDF tools require uploading documents to a server — a privacy risk for individuals and businesses handling sensitive files.",
  },
  {
    title: "The approach",
    description:
      "We believed browsers were powerful enough to do the work locally. We built SuperPDF on client-side engines: pdf-lib, pdf.js, qpdf (WASM), and more.",
  },
  {
    title: "The result",
    description:
      "A free, private PDF toolkit with 44 tools that process everything in your browser — no accounts, no uploads, no data collection.",
  },
];

export const blogPosts = [
  {
    slug: "privacy-first-pdf-tools",
    title: "Why privacy-first PDF tools matter",
    excerpt:
      "Most online PDF tools upload your documents to a server. Here's why that's a risk — and how browser-native processing changes the game.",
    date: "2026-01-15",
    readTime: "5 min",
    tags: ["Privacy", "Security"],
    body: [
      "When you upload a document to an online tool, you are trusting that provider to protect it. That trust is often misplaced: files may be stored, analyzed, or even sold, and a data breach exposes content you never intended to share.",
      "Browser-native tools eliminate this entire class of risk. Because processing happens locally — in the Service Worker and WebAssembly engines — the document never leaves your device. There is no server to breach, no log to leak, and no third party that can access your content.",
      "SuperPDF is built on this principle. Every tool runs client-side: pdf-lib manipulates documents, pdf.js renders pages, qpdf (compiled to WebAssembly) handles encryption, and tesseract.js performs OCR. The result is a full PDF suite with the privacy guarantees of a local application.",
      "The trade-offs are real too: complex tasks like exact Office-to-PDF conversion require engines that don't exist in-browser, and large files consume device memory. But for the vast majority of PDF tasks, the browser is more than capable — and privacy stays intact.",
    ],
  },
  {
    slug: "pdf-encryption-in-the-browser",
    title: "How PDF encryption works in your browser",
    excerpt:
      "Password-protecting a PDF usually means uploading it. We compiled qpdf to WebAssembly so AES-256 encryption runs locally. Here's how.",
    date: "2026-02-03",
    readTime: "6 min",
    tags: ["Security", "Encryption"],
    body: [
      "PDF encryption is well standardized: the document is encrypted with AES-128 or AES-256 using keys derived from the user and owner passwords. Libraries like qpdf implement this correctly, but they are written in C++ and need to run somewhere.",
      "Our solution compiles qpdf to WebAssembly. The engine loads in your browser, reads your file directly, and produces an encrypted copy — all without a network request.",
      "One technical wrinkle: WebAssembly builds that use SharedArrayBuffer require the page to be cross-origin isolated. We serve the relevant pages with COOP/COEP headers, which the browser then enforces.",
      "The practical result: you can add or remove password protection on a PDF and the file never leaves your device. The same applies to the other client-side engines that power the rest of SuperPDF.",
    ],
  },
  {
    slug: "ocr-without-the-cloud",
    title: "OCR without the cloud: recognizing text locally",
    excerpt:
      "Scanned documents usually need cloud OCR to become searchable. tesseract.js brings OCR into the browser — here's the trade-off.",
    date: "2026-03-10",
    readTime: "5 min",
    tags: ["OCR", "Privacy"],
    body: [
      "Optical character recognition turns scanned pages into searchable text. Traditional OCR services upload your scans to the cloud, which is often unacceptable for contracts, medical records, or research.",
      "tesseract.js compiles the Tesseract OCR engine to WebAssembly. It runs the recognition pipeline in your browser, and the language model is downloaded once and cached locally.",
      "The accuracy is comparable to many cloud services for clean, printed English text. Handwriting and low-quality scans remain challenging for any engine.",
      "In SuperPDF, the PDF OCR tool renders each page, runs tesseract.js, and returns the recognized text as a downloadable file. Your scans never leave the device.",
    ],
  },
  {
    slug: "building-a-client-side-pdf-suite",
    title: "What it takes to build a client-side PDF suite",
    excerpt:
      "Behind the scenes of SuperPDF: the engines, the Service Worker, and the hard limits of running everything in the browser.",
    date: "2026-04-22",
    readTime: "7 min",
    tags: ["Engineering", "Architecture"],
    body: [
      "Building a full PDF toolkit in the browser is an exercise in working within constraints. There is no single library that does everything, so SuperPDF composes several: pdf-lib for manipulation, pdf.js for rendering and text extraction, qpdf (WASM) for encryption, html2pdf.js for HTML conversion, and tesseract.js for OCR.",
      "A Service Worker routes document-processing tasks and keeps large operations off the main thread where possible. This is the same pattern used by our shared tool UI kit, which gives every tool a consistent layout, drop zone, and success banner.",
      "The hard limits are instructive. There is no reliable client-side renderer for PowerPoint files, which is why pptx-to-PDF is not offered. And webpage-to-PDF can only fetch pages that allow cross-origin reads.",
      "Despite those limits, 44 tools run entirely client-side — proof that privacy-first PDF processing is not just possible, but practical.",
    ],
  },
];

export const pressFacts = [
  ["Name", "SuperPDF"],
  ["Founded", "2026"],
  ["Founder", "Milind Sonawane"],
  ["Category", "Browser-based PDF tools"],
  ["Business model", "Free, no accounts"],
  ["Platform", "Web (Next.js, WASM)"],
  ["Tools", "44 and growing"],
  ["Data handling", "100% client-side, zero uploads"],
];

export const pressBoilerplate =
  "SuperPDF is a free, privacy-first PDF toolkit that runs entirely in the browser. Using client-side engines including pdf-lib, pdf.js, qpdf (WebAssembly), and tesseract.js, it offers 44 tools — merge, split, compress, convert, sign, protect, and more — with one guarantee: your files never leave your device. No accounts, no uploads, no data collection.";