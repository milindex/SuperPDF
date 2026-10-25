"use client";

import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { MERGE_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

interface FileItem {
  id: string;
  file: File;
}

function bytesToString(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function SortableItem({
  item,
  onRemove,
}: {
  item: FileItem;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className={styles.fileRow}>
      <button
        type="button"
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${item.file.name}. Use the arrow keys to move it.`}
      >
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          aria-hidden="true"
          fill="currentColor"
        >
          <circle cx="5" cy="3" r="1.4" />
          <circle cx="11" cy="3" r="1.4" />
          <circle cx="5" cy="8" r="1.4" />
          <circle cx="11" cy="8" r="1.4" />
          <circle cx="5" cy="13" r="1.4" />
          <circle cx="11" cy="13" r="1.4" />
        </svg>
      </button>
      <div className={styles.fileInfo}>
        <span className={styles.fileName}>{item.file.name}</span>
        <span className={styles.fileMeta}>
          {bytesToString(item.file.size)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className={styles.removeBtn}
        aria-label={`Remove ${item.file.name}`}
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
    </li>
  );
}

export default function MergePdfTool() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedName, setMergedName] = useState("merged.pdf");
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setMergedUrl(null);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.file.name));
      const next = [...prev];
      for (const file of accepted) {
        if (!seen.has(file.name)) {
          next.push({ id: `${file.name}-${next.length}`, file });
          seen.add(file.name);
        }
      }
      return next;
    });
  }, []);

  const onSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFiles((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const canMerge = files.length >= 2 && !processing;

  const merge = async () => {
    if (!canMerge) return;
    setProcessing(true);
    setMergedUrl(null);
    setError(null);
    try {
      const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
      const result = (await sendToSw(MERGE_PDF_TYPE, { buffers })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
      setMergedName(
        files.map((f) => f.file.name.replace(/\.pdf$/i, "")).join("+") + ".pdf",
      );
    } catch (err) {
      console.error("Merge failed:", err);
      setError("Failed to merge the PDFs. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const clear = () => {
    if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    setFiles([]);
    setMergedUrl(null);
  };

  const ids = useMemo(() => files.map((f) => f.id), [files]);

  return (
    <ToolLayout>
      <ToolHeader
        title="Merge PDFs"
        description="Combine several PDFs into one document, in the order you choose."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "application/pdf": [] }}
        multiple={true}
        text="Drag & drop PDF files here"
        buttonText="Choose PDF files"
      />

      {files.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              Files ({files.length})
            </h2>
            <button type="button" onClick={clear} className={styles.clearBtn}>
              Clear all
            </button>
          </div>
          <p className={styles.panelHelp}>
            Files merge in the order shown. Drag a handle to reorder, or use the
            arrow keys while it is focused.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onSortEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <ul className={styles.fileList}>
                {files.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    onRemove={(id) =>
                      setFiles((prev) => prev.filter((f) => f.id !== id))
                    }
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={merge}
            disabled={!canMerge}
            className={styles.mergeBtn}
          >
            {processing ? "Merging…" : "Merge PDFs"}
          </button>
          {files.length === 1 && (
            <p className={styles.hint}>Add at least one more PDF to merge.</p>
          )}
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {mergedUrl && (
        <SuccessBanner
          url={mergedUrl}
          fileName={mergedName}
          downloadText="Download merged PDF"
        />
      )}
    </ToolLayout>
  );
}
