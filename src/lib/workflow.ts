"use client";

import { sendToSw } from "@/lib/sw-client";
import { getSettings } from "@/lib/settings";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage-keys";
import {
  ADD_PAGE_NUMBERS_TYPE,
  CROP_PDF_TYPE,
  FLATTEN_PDF_TYPE,
  PAGE_SIZE_TYPE,
  REMOVE_METADATA_TYPE,
  REPAIR_PDF_TYPE,
  ROTATE_PDF_TYPE,
  WATERMARK_PDF_TYPE,
  type PageNumberFormat,
  type PageNumberPosition,
  type PageSizePreset,
} from "@/lib/sw-contract";

export type WorkflowOptionValue = string | number;
export type WorkflowOptions = Record<string, WorkflowOptionValue>;

export interface WorkflowOption {
  key: string;
  label: string;
  type: "text" | "password" | "number" | "range" | "select";
  hint?: string;
  defaultValue: WorkflowOptionValue;
  min?: number;
  max?: number;
  step?: number;
  choices?: { value: string; label: string }[];
}

export interface WorkflowStep {
  id: string;
  toolId: string;
  options: WorkflowOptions;
}

export interface WorkflowTool {
  id: string;
  name: string;
  description: string;
  options: WorkflowOption[];
  apply: (buffer: ArrayBuffer, options: WorkflowOptions) => Promise<Uint8Array>;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  steps: { toolId: string; options: WorkflowOptions }[];
  updatedAt: number;
}

const WORKFLOWS_KEY = STORAGE_KEYS.workflows;
const DRAFT_KEY = STORAGE_KEYS.workflowDraft;
const WORKFLOWS_EVENT = STORAGE_EVENTS.workflows;

const numberFrom = (value: WorkflowOptionValue, fallback: number): number => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const textFrom = (value: WorkflowOptionValue, fallback = ""): string =>
  typeof value === "string" ? value : String(value ?? fallback);

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

const callSw = async (
  type: string,
  payload: Record<string, unknown>,
): Promise<Uint8Array> => (await sendToSw(type, payload)) as Uint8Array;

const ROTATION_CHOICES = [
  { value: "90", label: "90° clockwise" },
  { value: "180", label: "180°" },
  { value: "270", label: "270° clockwise" },
];

const PAGE_NUMBER_POSITIONS: {
  value: PageNumberPosition;
  label: string;
}[] = [
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom centre" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top centre" },
  { value: "top-right", label: "Top right" },
];

const PAGE_SIZES: { value: PageSizePreset; label: string }[] = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "Letter" },
  { value: "a5", label: "A5" },
  { value: "legal", label: "Legal" },
];

export const WORKFLOW_TOOLS: WorkflowTool[] = [
  {
    id: "compress",
    name: "Compress",
    description: "Reduce the file size. Pages become images, so text stops being selectable.",
    options: [
      {
        key: "quality",
        label: "Image quality",
        type: "range",
        defaultValue: 0.7,
        min: 0.2,
        max: 1,
        step: 0.05,
        hint: "Lower values shrink the file more but soften images.",
      },
    ],
    apply: async (buffer, options) => {
      const { compressPdf } = await import("@/tools/compress-pdf/logic");
      return compressPdf(buffer, numberFrom(options.quality, 0.7), 1);
    },
  },
  {
    id: "rotate",
    name: "Rotate",
    description: "Turn every page by a fixed angle.",
    options: [
      {
        key: "angle",
        label: "Angle",
        type: "select",
        defaultValue: "90",
        choices: ROTATION_CHOICES,
      },
    ],
    apply: (buffer, options) =>
      callSw(ROTATE_PDF_TYPE, {
        buffer: buffer.slice(0),
        angle: numberFrom(options.angle, 90),
      }),
  },
  {
    id: "page-numbers",
    name: "Add page numbers",
    description: "Print a number in a corner or at the centre of every page.",
    options: [
      {
        key: "format",
        label: "Format",
        type: "select",
        defaultValue: "page-x-of-y",
        choices: [
          { value: "page-x-of-y", label: "Page X of Y" },
          { value: "number-only", label: "Number only" },
        ],
        hint: "“Page X of Y” also shows how many pages the document has.",
      },
      {
        key: "position",
        label: "Position",
        type: "select",
        defaultValue: "bottom-center",
        choices: PAGE_NUMBER_POSITIONS,
      },
      {
        key: "startNumber",
        label: "First number",
        type: "number",
        defaultValue: 1,
        min: 1,
        hint: "The number printed on page 1. Use 1 to start at the beginning.",
      },
    ],
    apply: (buffer, options) =>
      callSw(ADD_PAGE_NUMBERS_TYPE, {
        buffer: buffer.slice(0),
        format: textFrom(options.format, "page-x-of-y") as PageNumberFormat,
        position: textFrom(
          options.position,
          "bottom-center",
        ) as PageNumberPosition,
        startNumber: numberFrom(options.startNumber, 1),
      }),
  },
  {
    id: "watermark",
    name: "Watermark",
    description: "Stamp a word or notice diagonally across every page.",
    options: [
      {
        key: "text",
        label: "Text",
        type: "text",
        defaultValue: "CONFIDENTIAL",
        hint: "Keep it short so it stays legible at the page centre.",
      },
      {
        key: "opacity",
        label: "Opacity",
        type: "range",
        defaultValue: 0.2,
        min: 0.05,
        max: 1,
        step: 0.05,
        hint: "0.2 reads as a light stamp; 1 is solid.",
      },
    ],
    apply: (buffer, options) =>
      callSw(WATERMARK_PDF_TYPE, {
        buffer: buffer.slice(0),
        text: textFrom(options.text, "CONFIDENTIAL").trim() || "CONFIDENTIAL",
        opacity: numberFrom(options.opacity, 0.2),
      }),
  },
  {
    id: "page-size",
    name: "Change page size",
    description: "Scale every page to a standard paper size.",
    options: [
      {
        key: "preset",
        label: "Page size",
        type: "select",
        defaultValue: "a4",
        choices: PAGE_SIZES,
      },
    ],
    apply: (buffer, options) =>
      callSw(PAGE_SIZE_TYPE, {
        buffer: buffer.slice(0),
        preset: textFrom(options.preset, "a4") as PageSizePreset,
      }),
  },
  {
    id: "crop",
    name: "Crop margins",
    description: "Trim the same margin from every side of every page.",
    options: [
      {
        key: "margin",
        label: "Margin to remove (%)",
        type: "number",
        defaultValue: 5,
        min: 0,
        max: 45,
        hint: "A percentage of each page. 0% leaves the page unchanged.",
      },
    ],
    apply: (buffer, options) => {
      const margin = Math.min(45, Math.max(0, numberFrom(options.margin, 5)));
      return callSw(CROP_PDF_TYPE, {
        buffer: buffer.slice(0),
        topPct: margin,
        rightPct: margin,
        bottomPct: margin,
        leftPct: margin,
      });
    },
  },
  {
    id: "flatten",
    name: "Flatten",
    description: "Burn layers and annotations into one static page.",
    options: [],
    apply: (buffer) =>
      callSw(FLATTEN_PDF_TYPE, { buffer: buffer.slice(0) }),
  },
  {
    id: "remove-metadata",
    name: "Remove metadata",
    description: "Strip the title, author, and other hidden document properties.",
    options: [],
    apply: (buffer) =>
      callSw(REMOVE_METADATA_TYPE, { buffer: buffer.slice(0) }),
  },
  {
    id: "remove-restrictions",
    name: "Remove restrictions",
    description: "Remove owner limits such as printing or copying before the next step.",
    options: [],
    apply: async (buffer) => {
      const { removeRestrictions } = await import("@/tools/remove-restrictions/logic");
      return removeRestrictions(buffer);
    },
  },
  {
    id: "repair",
    name: "Repair",
    description: "Rebuild a damaged PDF before the next step reads it.",
    options: [],
    apply: (buffer) =>
      callSw(REPAIR_PDF_TYPE, { buffer: buffer.slice(0) }),
  },
  {
    id: "pdfa",
    name: "Archive (PDF/A)",
    description: "Rebuild the document for long-term storage.",
    options: [],
    apply: async (buffer) => {
      const { pdfToPdfA } = await import("@/tools/pdf-to-pdfa/logic");
      return pdfToPdfA(buffer);
    },
  },
  {
    id: "protect",
    name: "Protect",
    description: "Require a password to open the finished PDF.",
    options: [
      {
        key: "password",
        label: "Password",
        type: "password",
        defaultValue: "",
        hint: "Applied in this tab and not stored. Keep a copy; it cannot be recovered.",
      },
    ],
    apply: async (buffer, options) => {
      const password = textFrom(options.password);
      if (!password) {
        throw new Error("Add a password to the Protect step.");
      }
      const { protectPdf } = await import("@/tools/protect-pdf/logic");
      return protectPdf(buffer, password);
    },
  },
];

export const WORKFLOW_TOOL_MAP = new Map(
  WORKFLOW_TOOLS.map((tool) => [tool.id, tool]),
);

export function createWorkflowStep(toolId: string): WorkflowStep | null {
  const tool = WORKFLOW_TOOL_MAP.get(toolId);
  if (!tool) return null;
  return {
    id: `step-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    toolId,
    options: Object.fromEntries(
      tool.options.map((option) => [option.key, option.defaultValue]),
    ),
  };
}

export function workflowName(steps: WorkflowStep[]): string {
  const names = steps
    .map((step) => WORKFLOW_TOOL_MAP.get(step.toolId)?.name)
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) return "Untitled workflow";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} + ${names.length - 3} more`;
}

export async function runWorkflow(
  buffer: ArrayBuffer,
  steps: WorkflowStep[],
  onStep?: (index: number, total: number, name: string) => void,
): Promise<Uint8Array> {
  if (steps.length === 0) {
    throw new Error("Add at least one step before running the workflow.");
  }

  let current = buffer;
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    const tool = WORKFLOW_TOOL_MAP.get(step.toolId);
    if (!tool) throw new Error(`Unknown workflow step: ${step.toolId}`);
    onStep?.(index, steps.length, tool.name);
    const result = await tool.apply(current, step.options);
    current = toArrayBuffer(result);
  }

  return new Uint8Array(current);
}

/* ------------------------- Saved workflows ------------------------- */

export function getSavedWorkflows(): SavedWorkflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WORKFLOWS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedWorkflow[]) : [];
  } catch {
    return [];
  }
}

export function saveWorkflow(workflow: SavedWorkflow): void {
  if (typeof window === "undefined" || !getSettings().persist) return;
  try {
    const next = [
      workflow,
      ...getSavedWorkflows().filter((item) => item.id !== workflow.id),
    ].slice(0, 12);
    window.localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(WORKFLOWS_EVENT));
  } catch {
    // Saving is optional; the workflow still runs.
  }
}

export function getWorkflow(id: string): SavedWorkflow | null {
  return getSavedWorkflows().find((workflow) => workflow.id === id) ?? null;
}

export function newWorkflowId(): string {
  return `wf-${Date.now().toString(36)}`;
}


/* ------------------------- Draft and reset ------------------------- */

export interface WorkflowDraft {
  workflowId: string | null;
  steps: WorkflowStep[];
  updatedAt: number;
}

export function getWorkflowDraft(): WorkflowDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkflowDraft;
    return parsed && Array.isArray(parsed.steps) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveWorkflowDraft(draft: WorkflowDraft): void {
  if (typeof window === "undefined" || !getSettings().persist) return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Drafts are optional.
  }
}

export function clearWorkflowDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function clearSavedWorkflows(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(WORKFLOWS_KEY);
    window.dispatchEvent(new Event(WORKFLOWS_EVENT));
  } catch {
    // Ignore storage failures.
  }
}
