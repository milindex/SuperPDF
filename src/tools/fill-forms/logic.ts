import { PDFDocument } from "pdf-lib";
import {
  PDFCheckBox,
  PDFDropdown,
  PDFForm,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
} from "pdf-lib";
import type { FillFormsField, FillFormsPayload } from "@/lib/sw-contract";

/**
 * Fill a PDF's form fields. For each entry, the field is resolved by type
 * (text, checkbox, radio, dropdown, option list) and the value applied.
 * `flatten` burns values in so the fields can no longer be edited.
 */
export async function fillForms(
  buffer: ArrayBuffer,
  fields: FillFormsField[],
  flatten = false,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const form = pdf.getForm();

  for (const field of fields) {
    const name = field.name.trim();
    if (!name) continue;
    applyFieldValue(form, name, field.value);
  }

  if (flatten) form.flatten();

  return pdf.save({ updateFieldAppearances: true });
}

function applyFieldValue(form: PDFForm, name: string, value: string): void {
  const field = form.getFieldMaybe(name);
  if (!field) throw new Error(`Unknown form field: ${name}`);

  if (field instanceof PDFTextField) {
    field.setText(value);
    return;
  }
  if (field instanceof PDFCheckBox) {
    const truthy = ["on", "true", "yes", "1", "x"].includes(value.toLowerCase());
    if (truthy) field.check();
    else field.uncheck();
    return;
  }
  if (field instanceof PDFRadioGroup) {
    field.select(value);
    return;
  }
  if (field instanceof PDFDropdown) {
    field.select(value);
    return;
  }
  if (field instanceof PDFOptionList) {
    field.select(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return;
  }
  throw new Error(`Unsupported form field: ${name}`);
}

export type { FillFormsPayload };