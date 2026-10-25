/**
 * Legal copy for the privacy, terms, cookie, and security pages.
 *
 * Keep this in step with how the app actually behaves: processing happens in
 * the browser, no accounts, no analytics or advertising scripts, and only
 * functional data in localStorage plus a service-worker cache.
 */

export const privacySections = [
  {
    heading: "1. Who we are",
    body: [
      "SuperPDF is a browser-based PDF toolkit published at superpdf.com and operated by Milind Sonawane. In this policy, “we” and “us” mean that operator, and “you” means the person using the site.",
      "For any privacy question, write to support@superpdf.com.",
    ],
  },
  {
    heading: "2. Your documents",
    body: [
      "Documents are opened, read, and changed inside your browser. The file is taken from your device, processed by engines running in the tab, and the result is offered back to you as a download.",
      "We do not upload, store, transmit, or examine your documents, their file names, or their contents. No SuperPDF server receives the file, so we cannot access it, and there is no server copy to breach or hand over.",
      "Some tools keep the finished result in the tab's memory until you download it or close the page. That copy never leaves your device.",
    ],
  },
  {
    heading: "3. Information we collect",
    body: [
      "The tools need no account, no email address, and no payment details. We do not run analytics, advertising, or session-replay scripts, and we do not set tracking cookies.",
      "Our hosting provider processes ordinary request data — such as IP address, user agent, requested URL, and timestamp — to deliver the site and protect it from abuse. That data is not linked to your documents and is not used by us to build a profile of you.",
      "If you email us, we receive your address and whatever you choose to include in the message. We use it only to answer you.",
    ],
  },
  {
    heading: "4. Cookies",
    body: [
      "SuperPDF does not set cookies for analytics, advertising, or tracking. Functional preferences are stored in your browser's local storage instead, and never sent to us. The Cookie Policy explains what is stored and how to clear it.",
    ],
  },
  {
    heading: "5. Storage on your device",
    body: [
      "To make the site convenient, the app can save a small amount of functional data in your browser: your settings, the list of recently used tools and workflows, saved workflow definitions, an in-progress workflow draft, and per-tool preferences and control levels.",
      "This data stays on your device. It never contains document contents. You can remove all of it from the settings dialog (Clear local data) or through your browser's site-data controls.",
      "The offline feature uses the browser's cache storage to keep a copy of the app shell and tool code you have visited, so pages can open without a network connection.",
    ],
  },
  {
    heading: "6. Downloaded engines",
    body: [
      "Some tools load larger engines on first use, such as the OCR language model or the qpdf WebAssembly build. These files are code and model data, not your documents.",
      "They are cached by your browser so later uses are faster. Depending on the engine, the download may come from our host or from a public content delivery network, which will see the request but not the file you are working on.",
    ],
  },
  {
    heading: "7. How long data is kept",
    body: [
      "We do not retain your documents at all. Working copies live in the tab and are released when you close it or clear the tool.",
      "Functional data in local storage remains until you clear it. Hosting logs are kept by our hosting provider for a limited period under its own retention policy.",
    ],
  },
  {
    heading: "8. Sharing",
    body: [
      "We do not sell personal information, and we do not share document data with anyone, because we never receive it.",
      "We may disclose account or contact information if the law requires it, or if it is necessary to protect the site and its users. Since the tools require no account, there is usually nothing to disclose beyond correspondence you have sent us.",
    ],
  },
  {
    heading: "9. Children's privacy",
    body: [
      "SuperPDF is not directed at children under 13, and we do not knowingly collect personal information from them. The tools need no account and no personal details.",
    ],
  },
  {
    heading: "10. Your choices and rights",
    body: [
      "Depending on where you live, you may have rights to access, correct, or delete personal information we hold about you. In practice that information is limited to any email you have sent us.",
      "You can clear all locally stored data at any time from the settings dialog or your browser settings. Blocking local storage does not stop the PDF tools from working; it only means preferences are not remembered.",
      "To make a request, email support@superpdf.com.",
    ],
  },
  {
    heading: "11. Changes to this policy",
    body: [
      "We may update this policy as the product changes. The date at the top of this page shows when it last changed, and a material change will be reflected there.",
    ],
  },
];

export const termsSections = [
  {
    heading: "1. Agreement",
    body: [
      "These Terms and Conditions govern your use of SuperPDF at superpdf.com. By using the site, you agree to them. If you do not agree, please stop using the service.",
    ],
  },
  {
    heading: "2. The service",
    body: [
      "SuperPDF provides PDF tools that run in your web browser. Processing happens on your device; we do not operate a document-processing server and do not store your files.",
      "The service is free to use and needs no account. We may add, change, suspend, or remove tools at any time.",
    ],
  },
  {
    heading: "3. Acceptable use",
    body: [
      "You may use SuperPDF only for lawful purposes and only with documents you have the right to use. Do not use the service to process unlawful content, infringe anyone's rights, distribute malware, probe or disrupt the site, or attempt to bypass its technical protections.",
      "You are responsible for the documents you process, for the settings you choose, and for how you use the output.",
    ],
  },
  {
    heading: "4. Your files and results",
    body: [
      "You keep all rights to your documents and to the files you create with the tools. We claim no licence over them, because we never receive them.",
      "Keep your own copies. Some operations, such as compression or conversion, change the document and can lose detail, formatting, or selectable text. Password protection cannot be recovered if you lose the password.",
    ],
  },
  {
    heading: "5. Intellectual property",
    body: [
      "The SuperPDF name, logo, interface, and site code belong to their respective owners and are protected by applicable law. You may not copy or redistribute them except as allowed by law.",
      "The service relies on open-source software, including pdf-lib, pdf.js, qpdf, and tesseract.js, each under its own licence. Those licences continue to apply to the relevant components.",
    ],
  },
  {
    heading: "6. Availability",
    body: [
      "We aim to keep the site available, but we do not promise uninterrupted access. Maintenance, hosting problems, or browser changes may interrupt it. The offline feature may keep previously visited pages working, but it is not a guarantee.",
    ],
  },
  {
    heading: "7. Disclaimer of warranties",
    body: [
      "The service is provided “as is” and “as available”, without warranties of any kind, express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "We do not warrant that a tool will meet your requirements, that output will be error-free, or that a converted or repaired file will be identical to the original.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, SuperPDF and its operator are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost data, lost profits, or business interruption arising from your use of, or inability to use, the service.",
      "Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    heading: "9. Indemnity",
    body: [
      "You agree to indemnify the operator against claims and costs arising from your misuse of the service or your breach of these terms, including claims relating to documents you did not have the right to process.",
    ],
  },
  {
    heading: "10. Governing law",
    body: [
      "These terms are governed by the laws applicable at the operator's principal place of business, without regard to conflict-of-law rules. Courts there have exclusive jurisdiction over disputes, except where consumer law gives you the right to sue in your own country.",
    ],
  },
  {
    heading: "11. Changes to these terms",
    body: [
      "We may revise these terms. The date at the top of this page shows the current version, and continued use after a change means you accept the revised terms.",
    ],
  },
  {
    heading: "12. Contact",
    body: [
      "Questions about these terms can go to support@superpdf.com.",
    ],
  },
];

export const cookieSections = [
  {
    heading: "1. The short version",
    body: [
      "SuperPDF does not set analytics, advertising, or tracking cookies. There is no consent banner because there is nothing to consent to.",
      "Preferences are kept in your browser's local storage, which stays on your device and is never sent to us.",
    ],
  },
  {
    heading: "2. What is stored on your device",
    body: [
      "Settings, including control levels and tool preferences, so a tool opens the way you left it.",
      "Recently used tools and workflows, so you can return to them quickly.",
      "Saved workflow definitions and an in-progress workflow draft.",
      "A service-worker cache of the app shell and tool code you have visited, which powers the offline mode.",
    ],
  },
  {
    heading: "3. What is never stored",
    body: [
      "Document contents, file names, passwords entered to protect or unlock a PDF, and anything derived from your files. All of that stays in the tab and is released when you close it.",
    ],
  },
  {
    heading: "4. Third-party requests",
    body: [
      "Tool engine files, such as the OCR language model, may be downloaded from a public content delivery network and cached by your browser. That provider sees the request, as any web server would, but not the document you are processing.",
      "We do not embed third-party advertising, analytics, or social tracking scripts.",
    ],
  },
  {
    heading: "5. Managing and clearing data",
    body: [
      "Use Clear local data in the settings dialog to remove saved preferences, recent items, and workflows from this browser.",
      "Your browser's site-data settings can also clear local storage and cached files for superpdf.com. Clearing them does not stop the PDF tools from working.",
    ],
  },
  {
    heading: "6. Changes to this policy",
    body: [
      "If the storage we use changes, this page and its date will be updated to match.",
    ],
  },
];

export const securitySections = [
  {
    heading: "1. The short version",
    body: [
      "Documents are read and changed in your browser. There is no document-processing server, so there is no network copy to intercept, store, or leak.",
    ],
  },
  {
    heading: "2. How processing stays local",
    bullets: [
      "Files are opened directly from your device and results are downloaded back to it.",
      "pdf-lib edits documents and pdf.js renders pages and extracts text, both in the tab.",
      "Password protection and unlocking use qpdf compiled to WebAssembly, with AES-256 computed on your device.",
      "OCR uses tesseract.js and a language model cached by your browser; recognition runs locally.",
      "We never see, store, or transmit your document contents.",
    ],
  },
  {
    heading: "3. Cross-origin isolation",
    body: [
      "The encryption engine needs SharedArrayBuffer, which browsers expose only to cross-origin isolated pages. Those pages are served with COOP and COEP headers so the browser enforces that isolated context.",
    ],
  },
  {
    heading: "4. Transport and hosting",
    body: [
      "The site is served over HTTPS. Hosting and delivery are handled by a third-party platform that terminates TLS and keeps standard request logs; it does not receive document data from the tools.",
    ],
  },
  {
    heading: "5. What is stored in the browser",
    body: [
      "Functional preferences, recent items, and saved workflows are kept in local storage. The offline mode caches the app shell and tool code in the browser's cache storage.",
      "No document contents or passwords are stored. Clearing site data removes all of it.",
    ],
  },
  {
    heading: "6. Reporting a vulnerability",
    body: [
      "If you believe you have found a security issue, email security@superpdf.com with the details and steps to reproduce it. Please do not test against other people's files or run disruptive attacks.",
      "We will acknowledge a report as soon as we can and keep you informed while it is investigated.",
    ],
  },
  {
    heading: "7. Limits",
    body: [
      "Local processing protects the file in transit, but it cannot protect a device that is already compromised. Keep your browser and operating system up to date, and use a trusted device for sensitive documents.",
    ],
  },
];
