import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { editMetadata } from "../logic";

async function makePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.addPage([200, 300]);
  doc.setTitle("Original");
  doc.setAuthor("Author");
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("editMetadata", () => {
  it("updates the provided fields", async () => {
    const buf = await makePdf();
    const out = await editMetadata(buf, {
      title: "New Title",
      author: "New Author",
      subject: "Subject",
      keywords: "a, b, c",
    });
    const doc = await PDFDocument.load(out);
    expect(doc.getTitle()).toBe("New Title");
    expect(doc.getAuthor()).toBe("New Author");
    expect(doc.getSubject()).toBe("Subject");
    expect(doc.getKeywords()).toBe("a b c");
  });

  it("leaves unspecified fields untouched", async () => {
    const buf = await makePdf();
    const out = await editMetadata(buf, { title: "Only Title" });
    const doc = await PDFDocument.load(out);
    expect(doc.getTitle()).toBe("Only Title");
    expect(doc.getAuthor()).toBe("Author");
  });
});