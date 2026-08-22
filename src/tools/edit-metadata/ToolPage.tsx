"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { EDIT_METADATA_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function EditMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("updated.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canEdit = file !== null && !processing;

  const edit = async () => {
    if (!canEdit || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(EDIT_METADATA_TYPE, {
        buffer,
        title,
        author,
        subject,
        keywords,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_updated.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update metadata.");
    } finally {
      setProcessing(false);
    }
  };

  const fields: { key: string; label: string; value: string; setter: (v: string) => void }[] = [
    { key: "title", label: "Title", value: title, setter: setTitle },
    { key: "author", label: "Author", value: author, setter: setAuthor },
    { key: "subject", label: "Subject", value: subject, setter: setSubject },
    { key: "keywords", label: "Keywords (comma-separated)", value: keywords, setter: setKeywords },
  ];

  return (
    <ToolLayout>
      <ToolHeader
        title="Change PDF Info"
        description="Edit document properties such as title, author, and keywords — entirely in your browser."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "application/pdf": [] }}
        multiple={false}
        text="Drag & drop a PDF file here"
        buttonText="Choose PDF file"
      />

      {file && (
        <div className={styles.panel}>
          <span className={styles.fileName}>{file.name}</span>
          {fields.map((f) => (
            <div key={f.key} className={styles.field}>
              <label className={styles.label} htmlFor={f.key}>
                {f.label}
              </label>
              <input
                id={f.key}
                type="text"
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                className={styles.input}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={edit}
            disabled={!canEdit}
            className={styles.editBtn}
          >
            {processing ? "Updating…" : "Save Metadata"}
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