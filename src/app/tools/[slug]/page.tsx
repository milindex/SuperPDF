import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { toolsRegistry } from "@/registry/tools";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import {
  breadcrumbJsonLd,
  pageMetadata,
  softwareApplicationJsonLd,
} from "@/lib/seo";
import { ToolRuntime } from "./ToolRuntime";

export function generateStaticParams() {
  return toolsRegistry.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolsRegistry.find((t) => t.slug === slug);
  if (!tool) return {};

  return pageMetadata({
    title: `${tool.name} without uploading`,
    description: `${tool.description} No upload, no account — it runs on your device.`,
    path: `/tools/${tool.slug}`,
  });
}

export default async function ToolRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = toolsRegistry.find((t) => t.slug === slug);
  if (!tool) notFound();

  const path: `/${string}` = `/tools/${tool.slug}`;

  return (
    <>
      <JsonLd
        data={softwareApplicationJsonLd({
          name: tool.name,
          description: tool.description,
          path,
          featureList: [
            tool.name,
            "No upload",
            "No account",
            "Runs on your device",
          ],
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "All tools", path: "/tools" },
          { name: tool.name, path },
        ])}
      />
      <ToolRuntime
        toolId={tool.id}
        toolName={tool.name}
        status={tool.status}
      />
    </>
  );
}
