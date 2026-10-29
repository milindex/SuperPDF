import type { Metadata } from "next";
import WorkflowBuilder from "./WorkflowBuilder";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PDF workflow builder",
  description:
    "Chain PDF tools into one repeatable run: compress, number pages, protect, without uploading the file.",
  path: "/workflow",
});

export default function WorkflowPage() {
  return <WorkflowBuilder />;
}
