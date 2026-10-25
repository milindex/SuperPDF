"use client";

import { PDFDocument } from "pdf-lib";

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  pageCount: number;
  creationDate: string | null;
  modificationDate: string | null;
  isEncrypted: boolean;
  pageSizes: { index: number; width: number; height: number }[];
}

export async function inspectPdfMetadata(
  buffer: ArrayBuffer,
): Promise<PdfMetadata> {
  let pdf;
  try {
    pdf = await PDFDocument.load(buffer);
  } catch {
    pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  }

  const pages = pdf.getPages();
  const read = (getter: () => string | undefined): string => {
    try {
      return getter() || "Not set";
    } catch {
      return "Not available";
    }
  };

  return {
    title: read(() => pdf.getTitle()),
    author: read(() => pdf.getAuthor()),
    subject: read(() => pdf.getSubject()),
    keywords: read(() => pdf.getKeywords()),
    creator: read(() => pdf.getCreator()),
    producer: read(() => pdf.getProducer()),
    pageCount: pdf.getPageCount(),
    creationDate: pdf.getCreationDate()?.toISOString() ?? null,
    modificationDate: pdf.getModificationDate()?.toISOString() ?? null,
    isEncrypted: pdf.isEncrypted,
    pageSizes: pages.map((page, index) => ({
      index: index + 1,
      width: Math.round(page.getWidth()),
      height: Math.round(page.getHeight()),
    })),
  };
}
