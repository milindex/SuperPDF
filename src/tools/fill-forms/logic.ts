import { PDFDocument } from "pdf-lib";
import {
  PDFButton,
  PDFCheckBox,
  PDFDropdown,
  PDFForm,
  PDFOptionList,
  PDFRadioGroup,
  PDFSignature,
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

export type FormFieldType =
  | "text"
  | "checkbox"
  | "radio"
  | "dropdown"
  | "option-list"
  | "signature"
  | "button"
  | "unknown";

export interface FormFieldInfo {
  name: string;
  type: FormFieldType;
  value: string;
  options?: string[];
  required: boolean;
  editable: boolean;
}

/** Read the AcroForm fields in a PDF before filling them. */
export async function inspectFormFields(
  buffer: ArrayBuffer,
): Promise<FormFieldInfo[]> {
  const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = pdf.getForm();
  return form.getFields().map((field) => {
    const base = {
      name: field.getName(),
      required: field.isRequired(),
      editable: true,
      value: "",
    };

    if (field instanceof PDFTextField) {
      return { ...base, type: "text" as const, value: field.getText() ?? "" };
    }
    if (field instanceof PDFCheckBox) {
      return {
        ...base,
        type: "checkbox" as const,
        value: field.isChecked() ? "on" : "off",
      };
    }
    if (field instanceof PDFRadioGroup) {
      return {
        ...base,
        type: "radio" as const,
        value: field.getSelected() ?? "",
        options: field.getOptions(),
      };
    }
    if (field instanceof PDFDropdown) {
      return {
        ...base,
        type: "dropdown" as const,
        value: field.getSelected()[0] ?? "",
        options: field.getOptions(),
      };
    }
    if (field instanceof PDFOptionList) {
      return {
        ...base,
        type: "option-list" as const,
        value: field.getSelected().join(", "),
        options: field.getOptions(),
      };
    }
    if (field instanceof PDFSignature) {
      return { ...base, type: "signature" as const, editable: false };
    }
    if (field instanceof PDFButton) {
      return { ...base, type: "button" as const, editable: false };
    }
    return { ...base, type: "unknown" as const, editable: false };
  });
}

export type { FillFormsPayload };