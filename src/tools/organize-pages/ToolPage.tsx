"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { ORGANIZE_PAGES_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

interface SourceFile {
  id: string;
  file: File;
  pageCount: number;
}

interface PageItem {
  uid: string;
  fileId: string;
  pageIdx: number;
}

function SortablePage({
  item,
  label,
  onRemove,
}: {
  item: PageItem;
  label: string;
  onRemove: (uid: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.uid });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.pageRow}
    >
      <span className={styles.dragHandle} aria-hidden="true">
        ⋮⋮
      </span>
      <span className={styles.pageLabel}>{label}</span>
      <button
        type="button"
        onClick={() => onRemove(item.uid)}
        className={styles.removeBtn}
        aria-label={`Remove ${label}`}
      >
        ✕
      </button>
    </li>
  );
}

export default function OrganizePagesTool() {
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("organized.pdf");
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleFiles = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    setResultUrl(null);
    setError(null);

    const nextFiles: SourceFile[] = [];
    for (const file of accepted) {
      try {
        const buf = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        nextFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          pageCount: pdf.getPageCount(),
        });
      } catch {
        setError(`"${file.name}" is not a valid PDF.`);
      }
    }
    if (!nextFiles.length) return;

    const additions: PageItem[] = [];
    for (const f of nextFiles) {
      for (let i = 0; i < f.pageCount; i++) {
        additions.push({ uid: `${f.id}-p${i}`, fileId: f.id, pageIdx: i });
      }
    }
    setPages((prev) => [...prev, ...additions]);
    setFiles((prev) => [...prev, ...nextFiles]);
  }, []);

  const onSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPages((items) => {
      const oldIndex = items.findIndex((i) => i.uid === active.id);
      const newIndex = items.findIndex((i) => i.uid === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const removePage = (uid: string) =>
    setPages((prev) => prev.filter((p) => p.uid !== uid));

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setPages((prev) => prev.filter((p) => p.fileId !== fileId));
    setResultUrl(null);
  };

  const pageLabels = useMemo(() => {
    const fileLookup = new Map(files.map((f) => [f.id, f]));
    const pageOfFile = new Map<string, number>();
    return new Map(
      pages.map((p) => {
        const idx = pageOfFile.get(p.fileId) ?? 0;
        pageOfFile.set(p.fileId, idx + 1);
        const f = fileLookup.get(p.fileId);
        const name = f ? f.file.name.replace(/\.pdf$/i, "") : "PDF";
        return [p.uid, `Page ${idx + 1} — ${name}`];
      }),
    );
  }, [pages, files]);

  const canOrganize = pages.length >= 1 && !processing;

  const organize = async () => {
    if (!canOrganize) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const fileOrder = files;
      const offsets = new Map<string, number>();
      let cursor = 0;
      for (const f of fileOrder) {
        offsets.set(f.id, cursor);
        cursor += f.pageCount;
      }

      const buffers = await Promise.all(fileOrder.map((f) => f.file.arrayBuffer()));
      const newOrder = pages.map((p) => (offsets.get(p.fileId) ?? 0) + p.pageIdx);

      const result = (await sendToSw(ORGANIZE_PAGES_TYPE, {
        buffers,
        newOrder,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      const base = fileOrder[0].file.name.replace(/\.pdf$/i, "");
      setResultName(base + "_organized.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to organize pages.");
    } finally {
      setProcessing(false);
    }
  };

  const clear = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setPages([]);
    setResultUrl(null);
  };

  const pageUids = useMemo(() => pages.map((p) => p.uid), [pages]);

  return (
    <ToolLayout>
      <ToolHeader
        title="Organize Pages"
        description="Reorder, remove, or combine pages across one or more PDFs — entirely in your browser."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "application/pdf": [] }}
        multiple={true}
        text="Drag & drop one or more PDF files here"
        buttonText="Choose PDF files"
      />

      {files.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              Pages ({pages.length})
            </h2>
            <button type="button" onClick={clear} className={styles.clearBtn}>
              Clear all
            </button>
          </div>

          {files.length > 1 && (
            <ul className={styles.fileList}>
              {files.map((f) => (
                <li key={f.id} className={styles.fileRow}>
                  <span className={styles.fileName}>{f.file.name}</span>
                  <span className={styles.fileMeta}>
                    {f.pageCount} page{f.pageCount === 1 ? "" : "s"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className={styles.removeBtn}
                    aria-label={`Remove ${f.file.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onSortEnd}
          >
            <SortableContext items={pageUids} strategy={verticalListSortingStrategy}>
              <ul className={styles.pageList}>
                {pages.map((item) => (
                  <SortablePage
                    key={item.uid}
                    item={item}
                    label={pageLabels.get(item.uid) ?? "Page"}
                    onRemove={removePage}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={organize}
            disabled={!canOrganize}
            className={styles.organizeBtn}
          >
            {processing ? "Organizing…" : "Organize Pages"}
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