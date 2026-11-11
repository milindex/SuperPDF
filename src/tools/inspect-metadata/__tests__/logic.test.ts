import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { inspectPdfMetadata } from "../logic";

async function makePdf() {
  const pdf = await PDFDocument.create();
  pdf.addPage([200, 300]);
  pdf.addPage([400.4, 500.6]);
  pdf.setTitle("Quarterly report");
  pdf.setAuthor("Ada Lovelace");
  pdf.setSubject("Accounts");
  pdf.setKeywords(["finance", "q3"]);
  pdf.setCreator("SuperPDF");
  pdf.setProducer("pdf-lib");
  pdf.setCreationDate(new Date("2020-06-15T12:00:00Z"));
  pdf.setModificationDate(new Date("2020-07-16T12:00:00Z"));
  return toArrayBuffer(await pdf.save());
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

describe("inspectPdfMetadata", () => {
  it("reads document properties and rounded page sizes", async () => {
    const meta = await inspectPdfMetadata(await makePdf());

    expect(meta.title).toBe("Quarterly report");
    expect(meta.author).toBe("Ada Lovelace");
    expect(meta.subject).toBe("Accounts");
    expect(meta.keywords).toBe("finance q3");
    expect(meta.creator).toBe("SuperPDF");
    expect(meta.producer).toMatch(/pdf-lib/);
    expect(meta.pageCount).toBe(2);
    expect(meta.isEncrypted).toBe(false);
    expect(meta.pageSizes).toEqual([
      { index: 1, width: 200, height: 300 },
      { index: 2, width: 400, height: 501 },
    ]);
    expect(meta.creationDate).not.toBeNull();
    expect(Number.isNaN(Date.parse(meta.creationDate ?? ""))).toBe(false);
    expect(meta.modificationDate).not.toBeNull();
  });

  it("labels unset fields as not set", async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    const meta = await inspectPdfMetadata(toArrayBuffer(await pdf.save()));

    expect(meta.title).toBe("Not set");
    expect(meta.author).toBe("Not set");
    expect(meta.subject).toBe("Not set");
    expect(meta.keywords).toBe("Not set");
    expect(
      meta.creationDate === null || typeof meta.creationDate === "string",
    ).toBe(true);
  });

  it("rejects a buffer that is not a PDF", async () => {
    await expect(
      inspectPdfMetadata(toArrayBuffer(new TextEncoder().encode("nope"))),
    ).rejects.toThrow();
  });
});
