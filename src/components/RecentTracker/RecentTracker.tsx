"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toolsRegistry } from "@/registry/tools";
import { recordRecent } from "@/lib/recent";

/**
 * Records a tool visit so it can appear in the "Recently used" banner.
 * Rendered once in the root layout; it renders nothing.
 */
export default function RecentTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const match = /^\/tools\/([^/]+)\/?$/.exec(pathname);
    if (!match) return;
    const tool = toolsRegistry.find((item) => item.slug === match[1]);
    if (!tool) return;
    recordRecent({
      kind: "tool",
      id: tool.id,
      name: tool.name,
      href: `/tools/${tool.slug}`,
      meta: tool.description,
    });
  }, [pathname]);

  return null;
}
