import type { Metadata } from "next";
import WorkflowBuilder from "./WorkflowBuilder";

export const metadata: Metadata = {
  title: "Workflow",
  description:
    "Chain PDF tools into one workflow and run every step on a single file, in your browser.",
};

export default function WorkflowPage() {
  return <WorkflowBuilder />;
}
