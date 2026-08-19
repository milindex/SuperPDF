export interface HomepageTool {
  name: string;
  description: string;
  href: string;
  icon: string;
  category: string;
  subcategory?: string;
}

export const tools: HomepageTool[] = [
  // === Organize ===
  { name: "Merge PDF", description: "Combine multiple PDF files into one document.", href: "/tools/merge-pdf", icon: "merge", category: "organize" },
  { name: "Split PDF", description: "Extract pages or ranges into separate files.", href: "/tools/split-pdf", icon: "split", category: "organize" },
  { name: "Remove Pages", description: "Delete unwanted pages from your PDF documents.", href: "/tools/delete-pdf-pages", icon: "organize", category: "organize" },
  { name: "Extract Pages", description: "Extract specific pages from a PDF as a new file.", href: "/tools/extract-pdf-pages", icon: "organize", category: "organize" },
  { name: "Rearrange Pages", description: "Reorder pages in your PDF document.", href: "/tools/reorder-pages", icon: "organize", category: "organize" },
  { name: "Rotate PDF", description: "Rotate pages in your PDF file.", href: "/tools/rotate-pdf", icon: "rotate", category: "organize" },
  { name: "Organize Pages", description: "Reorder, add, or remove pages in your PDF.", href: "/tools/organize", icon: "organize", category: "organize" },
  { name: "Add Page Numbers", description: "Insert page numbers at custom positions and styles.", href: "/tools/page-numbers", icon: "page-numbers", category: "organize" },
  { name: "Flatten PDF", description: "Flatten layers and annotations into a single static PDF.", href: "/tools/flatten-pdf", icon: "organize", category: "organize" },

  // === Optimize ===
  { name: "Compress PDF", description: "Reduce PDF size by recompressing images.", href: "/tools/compress", icon: "compress", category: "optimize" },
  { name: "Repair PDF", description: "Repair corrupted or damaged PDF files.", href: "/tools/repair-pdf", icon: "repair", category: "optimize" },
  { name: "PDF OCR", description: "Extract text from scanned PDFs using OCR.", href: "/tools/ocr-pdf", icon: "scan", category: "optimize" },
  { name: "PDF to PDF/A", description: "Convert PDFs to PDF/A format for archiving.", href: "/tools/pdf-to-pdfa", icon: "repair", category: "optimize" },

  // === Convert To PDF ===
  { name: "Word to PDF", description: "Convert Word documents to PDF files.", href: "/tools/word-to-pdf", icon: "word-to-pdf", category: "convert", subcategory: "to-pdf" },
  { name: "PowerPoint to PDF", description: "Convert PowerPoint presentations to PDF.", href: "/tools/powerpoint-to-pdf", icon: "powerpoint-to-pdf", category: "convert", subcategory: "to-pdf" },
  { name: "Excel to PDF", description: "Convert Excel spreadsheets to PDF.", href: "/tools/excel-to-pdf", icon: "excel-to-pdf", category: "convert", subcategory: "to-pdf" },
  { name: "JPG to PDF", description: "Convert JPG images to PDF files.", href: "/tools/jpg-to-pdf", icon: "jpg", category: "convert", subcategory: "to-pdf" },
  { name: "PNG to PDF", description: "Convert PNG images to PDF files.", href: "/tools/png-to-pdf", icon: "jpg", category: "convert", subcategory: "to-pdf" },
  { name: "WEBP to PDF", description: "Convert WEBP images to PDF documents.", href: "/tools/webp-to-pdf", icon: "convert", category: "convert", subcategory: "to-pdf" },
  { name: "HEIC to PDF", description: "Convert HEIC images to PDF documents.", href: "/tools/heic-to-pdf", icon: "convert", category: "convert", subcategory: "to-pdf" },
  { name: "SVG to PDF", description: "Convert SVG vector graphics to PDF.", href: "/tools/svg-to-pdf", icon: "vector", category: "convert", subcategory: "to-pdf" },
  { name: "TIFF to PDF", description: "Convert TIFF images to PDF documents.", href: "/tools/tiff-to-pdf", icon: "convert", category: "convert", subcategory: "to-pdf" },
  { name: "Text to PDF", description: "Convert plain text files to PDF.", href: "/tools/text-to-pdf", icon: "typography", category: "convert", subcategory: "to-pdf" },
  { name: "Webpage to PDF", description: "Convert any webpage URL to a PDF.", href: "/tools/webpage-to-pdf", icon: "world-www", category: "convert", subcategory: "to-pdf" },

  // === Convert From PDF ===
  { name: "PDF to Word", description: "Convert PDF files to editable Word documents.", href: "/tools/pdf-to-word", icon: "pdf-to-word", category: "convert", subcategory: "from-pdf" },
  { name: "PDF to PowerPoint", description: "Convert PDF to PowerPoint presentations.", href: "/tools/pdf-to-powerpoint", icon: "pdf-to-powerpoint", category: "convert", subcategory: "from-pdf" },
  { name: "PDF to Excel", description: "Convert PDF files to Excel spreadsheets.", href: "/tools/pdf-to-excel", icon: "pdf-to-excel", category: "convert", subcategory: "from-pdf" },
  { name: "PDF to JPG", description: "Convert your PDF files to JPG images.", href: "/tools/pdf-to-jpg", icon: "pdf-to-jpg", category: "convert", subcategory: "from-pdf" },
  { name: "PDF to PNG", description: "Convert PDF pages to PNG images.", href: "/tools/pdf-to-png", icon: "convert", category: "convert", subcategory: "from-pdf" },
  { name: "Extract Images", description: "Extract and download images embedded in a PDF.", href: "/tools/extract-pdf-images", icon: "photo-scan", category: "convert", subcategory: "from-pdf" },
  { name: "PDF to SVG", description: "Convert PDF pages to SVG vector graphics.", href: "/tools/pdf-to-svg", icon: "vector", category: "convert", subcategory: "from-pdf" },
  { name: "PDF to HTML", description: "Convert PDF to HTML web pages.", href: "/tools/pdf-to-html", icon: "html-to-pdf", category: "convert", subcategory: "from-pdf" },
  { name: "PDF to Text", description: "Extract text content from PDF documents.", href: "/tools/pdf-to-text", icon: "typography", category: "convert", subcategory: "from-pdf" },

  // === Edit & Review ===
  { name: "Sign PDF", description: "Add your signature to a document.", href: "/tools/sign-pdf", icon: "sign", category: "edit-review" },
  { name: "Crop PDF", description: "Remove margins and unwanted areas from your PDFs.", href: "/tools/crop", icon: "crop", category: "edit-review" },
  { name: "Redact PDF", description: "Hide sensitive information in your PDF.", href: "/tools/redact", icon: "redact", category: "edit-review" },
  { name: "Watermark PDF", description: "Apply text or image watermarks.", href: "/tools/watermark", icon: "watermark", category: "edit-review" },
  { name: "Change Page Size", description: "Resize PDF pages to standard or custom dimensions.", href: "/tools/page-size", icon: "edit", category: "edit-review" },

  // === Security ===
  { name: "Protect PDF", description: "Add password protection to your PDF files.", href: "/tools/protect", icon: "protect", category: "security" },
  { name: "Unlock PDF", description: "Remove password protection from your PDF files.", href: "/tools/unlock", icon: "unlock", category: "security" },
  { name: "Remove Metadata", description: "Remove hidden metadata from PDFs.", href: "/tools/remove-metadata", icon: "edit", category: "security" },
  { name: "Change PDF Info", description: "Edit PDF document properties.", href: "/tools/edit-metadata", icon: "edit", category: "security" },

  // === Create & Forms ===
  { name: "Scan to PDF", description: "Scan documents with your camera and save as PDF.", href: "/tools/scan-to-pdf", icon: "scan", category: "create-forms" },
  { name: "Fill Out PDF", description: "Fill out PDF forms and save them digitally.", href: "/tools/fill-forms", icon: "edit", category: "create-forms" },

  // === AI ===
  { name: "Translate PDF", description: "Translate PDF documents into multiple languages using AI.", href: "/tools/translate-pdf", icon: "language", category: "ai" },
  { name: "Summarize PDF", description: "Generate concise AI-powered summaries of any PDF document.", href: "/tools/summarize-pdf", icon: "sparkles", category: "ai" },
  { name: "Chat with PDF", description: "Ask questions and get answers from your PDF documents using AI.", href: "/tools/chat-pdf", icon: "chat", category: "ai" },
  { name: "Extract Insights", description: "Automatically extract key insights and data from your PDF documents.", href: "/tools/extract-insights", icon: "insights", category: "ai" },
];
