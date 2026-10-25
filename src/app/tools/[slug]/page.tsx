import { notFound } from "next/navigation";
import { toolsRegistry } from "@/registry/tools";

type ToolPageModule = { default: React.ComponentType<{ toolId: string }> };

/**
 * Maps a tool slug to its client ToolPage. Tools implement their page in
 * `src/tools/{tool-id}/ToolPage.tsx` (client component). Each tool also
 * exports its `slug` so the resolver can route `[slug]` → `{tool-id}`.
 */
const toolLoaders: Record<string, () => Promise<ToolPageModule>> = {
  "merge-pdf": () => import("@/tools/merge-pdf/ToolPage"),
  "split-pdf": () => import("@/tools/split-pdf/ToolPage"),
  "rotate-pdf": () => import("@/tools/rotate-pdf/ToolPage"),
  "delete-pages": () => import("@/tools/delete-pages/ToolPage"),
  "reorder-pages": () => import("@/tools/reorder-pages/ToolPage"),
  "extract-pages": () => import("@/tools/extract-pages/ToolPage"),
  "organize-pages": () => import("@/tools/organize-pages/ToolPage"),
  "add-page-numbers": () => import("@/tools/add-page-numbers/ToolPage"),
  "flatten-pdf": () => import("@/tools/flatten-pdf/ToolPage"),
  "sign-pdf": () => import("@/tools/sign-pdf/ToolPage"),
  "crop-pdf": () => import("@/tools/crop-pdf/ToolPage"),
  "redact-pdf": () => import("@/tools/redact-pdf/ToolPage"),
  "watermark-pdf": () => import("@/tools/watermark-pdf/ToolPage"),
  "page-size": () => import("@/tools/page-size/ToolPage"),
  "protect-pdf": () => import("@/tools/protect-pdf/ToolPage"),
  "unlock-pdf": () => import("@/tools/unlock-pdf/ToolPage"),
  "remove-metadata": () => import("@/tools/remove-metadata/ToolPage"),
  "edit-metadata": () => import("@/tools/edit-metadata/ToolPage"),
  "text-to-pdf": () => import("@/tools/text-to-pdf/ToolPage"),
  "csv-to-pdf": () => import("@/tools/csv-to-pdf/ToolPage"),
  "repair-pdf": () => import("@/tools/repair-pdf/ToolPage"),
  "fill-forms": () => import("@/tools/fill-forms/ToolPage"),
  "pdf-to-text": () => import("@/tools/pdf-to-text/ToolPage"),
  "pdf-to-markdown": () => import("@/tools/pdf-to-markdown/ToolPage"),
  "pdf-to-jpg": () => import("@/tools/pdf-to-jpg/ToolPage"),
  "pdf-to-png": () => import("@/tools/pdf-to-png/ToolPage"),
  "extract-images": () => import("@/tools/extract-images/ToolPage"),
  "pdf-to-word": () => import("@/tools/pdf-to-word/ToolPage"),
  "pdf-to-powerpoint": () => import("@/tools/pdf-to-powerpoint/ToolPage"),
  "pdf-to-excel": () => import("@/tools/pdf-to-excel/ToolPage"),
  "pdf-to-svg": () => import("@/tools/pdf-to-svg/ToolPage"),
  "pdf-to-html": () => import("@/tools/pdf-to-html/ToolPage"),
  "jpg-to-pdf": () => import("@/tools/jpg-to-pdf/ToolPage"),
  "png-to-pdf": () => import("@/tools/png-to-pdf/ToolPage"),
  "webp-to-pdf": () => import("@/tools/webp-to-pdf/ToolPage"),
  "svg-to-pdf": () => import("@/tools/svg-to-pdf/ToolPage"),
  "heic-to-pdf": () => import("@/tools/heic-to-pdf/ToolPage"),
  "tiff-to-pdf": () => import("@/tools/tiff-to-pdf/ToolPage"),
  "excel-to-pdf": () => import("@/tools/excel-to-pdf/ToolPage"),
  "word-to-pdf": () => import("@/tools/word-to-pdf/ToolPage"),
  "webpage-to-pdf": () => import("@/tools/webpage-to-pdf/ToolPage"),
  "compress-pdf": () => import("@/tools/compress-pdf/ToolPage"),
  "ocr-pdf": () => import("@/tools/ocr-pdf/ToolPage"),
  "pdf-to-pdfa": () => import("@/tools/pdf-to-pdfa/ToolPage"),
  "scan-to-pdf": () => import("@/tools/scan-to-pdf/ToolPage"),
  "bmp-to-pdf": () => import("@/tools/bmp-to-pdf/ToolPage"),
  "html-to-pdf": () => import("@/tools/html-to-pdf/ToolPage"),
  "inspect-metadata": () => import("@/tools/inspect-metadata/ToolPage"),
  "export-thumbnails": () => import("@/tools/export-thumbnails/ToolPage"),
  "remove-restrictions": () => import("@/tools/remove-restrictions/ToolPage"),
  "create-pdf": () => import("@/tools/create-pdf/ToolPage"),
};

export function generateStaticParams() {
  return toolsRegistry.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = toolsRegistry.find((t) => t.slug === slug);
  if (!tool) notFound();

  const loader = toolLoaders[tool.id];
  if (!loader) {
    return (
      <div>
        <h1>{tool.name}</h1>
        <p>This tool is not implemented yet (status: {tool.status}).</p>
      </div>
    );
  }

  const ToolPage = (await loader()).default;
  return <ToolPage toolId={tool.id} />;
}
