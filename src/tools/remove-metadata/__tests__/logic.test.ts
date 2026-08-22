import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { removeMetadata } from "../logic";

async function makePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.addPage([200, 300]);
  doc.setTitle("Title");
  doc.setAuthor("Author");
  doc.setSubject("Subject");
  doc.setKeywords(["kw"]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("removeMetadata", () => {
  it("clears all metadata fields", async () => {
    const buf = await makePdf();
    const out = await removeMetadata(buf);
    const doc = await PDFDocument.load(out);
    expect(doc.getTitle()).toBe("");
    expect(doc.getAuthor()).toBe("");
    expect(doc.getSubject()).toBe("");
    expect(doc.getKeywords()).toBe("");
  });
});