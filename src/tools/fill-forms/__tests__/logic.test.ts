import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { fillForms, inspectFormFields } from "../logic";

async function makeFormPdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 600]);
  const form = doc.getForm();
  const field = form.createTextField("name");
  field.addToPage(page, { x: 50, y: 500, width: 150, height: 30 });
  const box = form.createCheckBox("agree");
  box.addToPage(page, { x: 50, y: 450, width: 20, height: 20 });
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("fillForms", () => {
  it("fills a text field and a checkbox", async () => {
    const buf = await makeFormPdf();
    const out = await fillForms(
      buf,
      [
        { name: "name", value: "Alice" },
        { name: "agree", value: "on" },
      ],
      false,
    );
    const doc = await PDFDocument.load(out);
    const form = doc.getForm();
    expect(form.getTextField("name").getText()).toBe("Alice");
    expect(form.getCheckBox("agree").isChecked()).toBe(true);
  });

  it("throws for an unknown field name", async () => {
    const buf = await makeFormPdf();
    await expect(
      fillForms(buf, [{ name: "missing", value: "x" }], false),
    ).rejects.toThrow("Unknown form field");
  });
});
describe("inspectFormFields", () => {
  it("lists field names, types, and current values", async () => {
    const fields = await inspectFormFields(await makeFormPdf());
    expect(fields.map((field) => field.name)).toEqual(["name", "agree"]);
    expect(fields[0]).toMatchObject({ type: "text", value: "", editable: true });
    expect(fields[1]).toMatchObject({ type: "checkbox", value: "off", editable: true });
  });
});
