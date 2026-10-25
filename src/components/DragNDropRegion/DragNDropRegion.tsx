"use client";

import React from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import styles from "./DragNDropRegion.module.scss";

export interface DragNDropRegionProps extends DropzoneOptions {
  text?: string;
  subText?: string;
  buttonText?: string;
  hint?: string;
  icon?: React.ReactNode;
}

/**
 * Drag-and-drop file input region used by tool pages. Wraps `react-dropzone`.
 * Defaults to a single PDF; tools override via `DropzoneOptions` props.
 */
export function DragNDropRegion({
  text = "Drag & drop a PDF file here",
  subText = "or choose a file from your device",
  buttonText = "Choose PDF file",
  hint = "The file is read in this tab and never uploaded.",
  icon,
  ...dropzoneProps
}: DragNDropRegionProps) {
  const finalOptions: DropzoneOptions = {
    accept: { "application/pdf": [] },
    multiple: false,
    noClick: true,
    ...dropzoneProps,
  };

  const { getRootProps, getInputProps, isDragActive, open } =
    useDropzone(finalOptions);

  const defaultIcon = (
    <svg
      viewBox="0 0 24 24"
      width={26}
      height={26}
      className={styles.defaultIcon}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M12 17v-5" />
      <path d="m9.5 14 2.5-2.5L14.5 14" />
    </svg>
  );

  return (
    <section
      {...getRootProps()}
      className={`${styles.region} ${
        isDragActive ? styles.regionActive : ""
      }`}
      aria-label="File drop area"
    >
      <input {...getInputProps()} />
      <div className={styles.content}>
        <span className={styles.iconWrap}>{icon || defaultIcon}</span>
        <div className={styles.textWrap}>
          <p className={styles.text}>
            {isDragActive ? "Drop the file to add it" : text}
          </p>
          <p className={styles.subText}>{subText}</p>
        </div>
        <button type="button" onClick={open} className={styles.button}>
          {buttonText}
        </button>
        <p className={styles.hint}>{hint}</p>
      </div>
    </section>
  );
}
