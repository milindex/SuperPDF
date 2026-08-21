export type ToolCategory =
  | "Organize"
  | "Convert To PDF"
  | "Convert From PDF"
  | "Edit"
  | "Security"
  | "Optimization"
  | "Extraction";

export type ToolStatus = "planned" | "in-progress" | "implemented";

export type ToolExecutionMode = "sw-routed" | "client-direct";

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  /** Icon component name from @heroicons (or a local marker) */
  icon: string;
  /** Processing execution mode, assigned once at spec time. */
  mode: ToolExecutionMode;
  status: ToolStatus;
  /** message `type` used in sendToSw(); required iff mode === "sw-routed" */
  swType?: string;
}

export const toolsRegistry: ToolDefinition[] = [
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    category: "Organize",
    icon: "merge",
    mode: "sw-routed",
    status: "implemented",
    swType: "merge-pdf",
  },
];
