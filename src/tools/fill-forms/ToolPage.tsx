"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { useToolMode } from "@/components/ToolModeScope/ToolModeScope";
import { sendToSw } from "@/lib/sw-client";
import { FILL_FORMS_TYPE, type FillFormsField } from "@/lib/sw-contract";
import { inspectFormFields, type FormFieldInfo } from "./logic";
import styles from "./ToolPage.module.scss";

interface ManualRow {
  key: string;
  name: string;
  value: string;
}

const TYPE_LABELS: Record<FormFieldInfo["type"], string> = {
  text: "Text",
  checkbox: "Checkbox",
  radio: "Radio",
  dropdown: "Dropdown",
  "option-list": "Option list",
  signature: "Signature",
  button: "Button",
  unknown: "Field",
};

export default function FillFormsTool() {
  const mode = useToolMode();
  const easy = mode?.mode !== "advanced";
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormFieldInfo[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [manualRows, setManualRows] = useState<ManualRow[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [flatten, setFlatten] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("filled.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    const next = accepted[0];
    setFile(next);
    setFields([]);
    setValues({});
    setManualRows([]);
    setResultUrl(null);
    setError(null);
    setLoadingFields(true);
    try {
      const detected = await inspectFormFields(await next.arrayBuffer());
      setFields(detected);
      setValues(
        Object.fromEntries(detected.map((field) => [field.name, field.value])),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The form fields in this PDF could not be read.",
      );
    } finally {
      setLoadingFields(false);
    }
  }, []);

  const setValue = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const addManualRow = () =>
    setManualRows((current) => [
      ...current,
      {
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: "",
        value: "",
      },
    ]);

  const updateManualRow = (
    key: string,
    patch: Partial<Pick<ManualRow, "name" | "value">>,
  ) =>
    setManualRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const removeManualRow = (key: string) =>
    setManualRows((current) => current.filter((row) => row.key !== key));

  const detectedFields = fields.filter((field) => field.editable);
  const canFill =
    file !== null &&
    !processing &&
    (detectedFields.length > 0 ||
      manualRows.some((row) => row.name.trim()));

  const fill = async () => {
    if (!canFill || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const payloadFields: FillFormsField[] = [];
      for (const field of detectedFields) {
        const value = values[field.name] ?? "";
        if (
          (field.type === "radio" ||
            field.type === "dropdown" ||
            field.type === "option-list") &&
          !value
        ) {
          continue;
        }
        payloadFields.push({ name: field.name, value });
      }
      for (const row of manualRows) {
        if (row.name.trim()) {
          payloadFields.push({ name: row.name.trim(), value: row.value });
        }
      }
      if (payloadFields.length === 0) {
        throw new Error("Fill in at least one field before downloading.");
      }

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(FILL_FORMS_TYPE, {
        buffer,
        fields: payloadFields,
        flatten: easy ? false : flatten,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_filled.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fill the form.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Fill Out PDF"
        description="Fill the form fields already in the PDF and download a copy."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        file={file}
        accept={{ "application/pdf": [] }}
        multiple={false}
        text="Drag & drop a PDF form here"
        buttonText="Choose PDF file"
      />

      {file && (
        <div className={styles.panel}>
          <span className={styles.fileName}>{file.name}</span>

          {loadingFields && (
            <p className={styles.status}>Reading the form fields…</p>
          )}

          {!loadingFields && detectedFields.length > 0 && (
            <>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldTitle}>
                  {detectedFields.length} form field
                  {detectedFields.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className={styles.detected}>
                {detectedFields.map((field) => (
                  <div key={field.name} className={styles.fieldInfo}>
                    <div className={styles.fieldMeta}>
                      <label className={styles.fieldLabel} htmlFor={field.name}>
                        {field.name}
                        {field.required && (
                          <span className={styles.required}>Required</span>
                        )}
                      </label>
                      <span className={styles.fieldType}>
                        {TYPE_LABELS[field.type]}
                      </span>
                    </div>

                    {field.type === "text" && (
                      <input
                        id={field.name}
                        type="text"
                        value={values[field.name] ?? ""}
                        onChange={(event) =>
                          setValue(field.name, event.target.value)
                        }
                        className={styles.input}
                      />
                    )}

                    {field.type === "checkbox" && (
                      <label className={styles.checkboxRow}>
                        <input
                          id={field.name}
                          type="checkbox"
                          checked={values[field.name] === "on"}
                          onChange={(event) =>
                            setValue(field.name, event.target.checked ? "on" : "off")
                          }
                          className={styles.checkbox}
                        />
                        Check this box
                      </label>
                    )}

                    {field.type === "radio" && (
                      <select
                        id={field.name}
                        value={values[field.name] ?? ""}
                        onChange={(event) =>
                          setValue(field.name, event.target.value)
                        }
                        className={styles.input}
                      >
                        <option value="">Choose an option</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "dropdown" && (
                      <select
                        id={field.name}
                        value={values[field.name] ?? ""}
                        onChange={(event) =>
                          setValue(field.name, event.target.value)
                        }
                        className={styles.input}
                      >
                        <option value="">Choose an option</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "option-list" && (
                      <select
                        id={field.name}
                        multiple
                        size={Math.min(4, Math.max(2, field.options?.length ?? 2))}
                        value={(values[field.name] ?? "")
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)}
                        onChange={(event) =>
                          setValue(
                            field.name,
                            Array.from(event.target.selectedOptions)
                              .map((option) => option.value)
                              .join(", "),
                          )
                        }
                        className={styles.input}
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {(field.type === "signature" ||
                      field.type === "button" ||
                      field.type === "unknown") && (
                      <p className={styles.notEditable}>
                        This field cannot be edited here.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {!loadingFields && detectedFields.length === 0 && (
            <p className={styles.status}>
              No fillable fields were found in this PDF.
              {easy
                ? " Switch to Advanced to type a field name by hand."
                : " Add a field below if the PDF uses an unusual field name."}
            </p>
          )}

          {!easy && (
            <div className={styles.manual}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldTitle}>Add a field by name</span>
                <button
                  type="button"
                  onClick={addManualRow}
                  className={styles.addBtn}
                >
                  Add field
                </button>
              </div>
              {manualRows.length > 0 && (
                <div className={styles.rows}>
                  {manualRows.map((row) => (
                    <div key={row.key} className={styles.row}>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(event) =>
                          updateManualRow(row.key, { name: event.target.value })
                        }
                        placeholder="Field name"
                        className={`${styles.input} ${styles.nameInput}`}
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(event) =>
                          updateManualRow(row.key, { value: event.target.value })
                        }
                        placeholder="Value"
                        className={`${styles.input} ${styles.valueInput}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeManualRow(row.key)}
                        className={styles.removeBtn}
                        aria-label="Remove field"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          aria-hidden="true"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        >
                          <path d="m6 6 12 12M18 6 6 18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <label className={styles.checkboxLabel} data-advanced="true">
            <input
              type="checkbox"
              checked={flatten}
              onChange={(event) => setFlatten(event.target.checked)}
              className={styles.checkbox}
            />
            Flatten fields (make them uneditable)
          </label>

          <button
            type="button"
            onClick={fill}
            disabled={!canFill}
            className={styles.fillBtn}
          >
            {processing ? "Filling…" : "Fill & Download"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {resultUrl && (
        <SuccessBanner url={resultUrl} fileName={resultName} />
      )}
    </ToolLayout>
  );
}
