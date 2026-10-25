import type { Metadata } from "next";
import WorkflowBuilder from "./WorkflowBuilder";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Workflow",
  description:
    "Chain PDF tools into one workflow and run every step on a single file, in your browser.",
  path: "/workflow",
});

export default function WorkflowPage() {
  return <WorkflowBuilder />;
}
