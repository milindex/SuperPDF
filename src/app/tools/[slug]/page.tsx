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
};

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
      <main>
        <h1>{tool.name}</h1>
        <p>This tool is not implemented yet (status: {tool.status}).</p>
      </main>
    );
  }

  const ToolPage = (await loader()).default;
  return <ToolPage toolId={tool.id} />;
}
