import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { pdfToPdfA } from "../logic";

async function makePdf({
  pages = 2,
  title,
  author,
  subject,
}: {
  pages?: number;
  title?: string;
  author?: string;
  subject?: string;
} = {}) {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i += 1) pdf.addPage([300, 400]);
  if (title) pdf.setTitle(title);
  if (author) pdf.setAuthor(author);
  if (subject) pdf.setSubject(subject);
  pdf.setProducer("Original producer");
  return toArrayBuffer(await pdf.save());
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

describe("pdfToPdfA", () => {
  it("copies every page and carries metadata into a fresh document", async () => {
    const out = await pdfToPdfA(
      await makePdf({
        pages: 3,
        title: "Contract",
        author: "Ada",
        subject: "Signed copy",
      }),
    );
    const pdf = await PDFDocument.load(out);

    expect(pdf.getPageCount()).toBe(3);
    expect(pdf.getTitle()).toBe("Contract");
    expect(pdf.getAuthor()).toBe("Ada");
    expect(pdf.getSubject()).toBe("Signed copy");
    expect(pdf.getProducer()).toMatch(/pdf-lib/);
  });

  it("uses default metadata when the source has none", async () => {
    const out = await pdfToPdfA(await makePdf({ pages: 1 }));
    const pdf = await PDFDocument.load(out);

    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getTitle()).toBe("PDF/A document");
    expect(pdf.getAuthor()).toBe("");
    expect(pdf.getSubject()).toBe("");
  });

  it("rejects a buffer that is not a PDF", async () => {
    await expect(
      pdfToPdfA(toArrayBuffer(new TextEncoder().encode("not a pdf"))),
    ).rejects.toThrow();
  });
});
