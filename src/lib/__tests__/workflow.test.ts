import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage-keys";

const mocks = vi.hoisted(() => ({ sendToSw: vi.fn() }));

vi.mock("@/lib/sw-client", () => ({ sendToSw: mocks.sendToSw }));

import {
  WORKFLOW_TOOLS,
  WORKFLOW_TOOL_MAP,
  clearSavedWorkflows,
  clearWorkflowDraft,
  createWorkflowStep,
  getSavedWorkflows,
  getWorkflow,
  getWorkflowDraft,
  newWorkflowId,
  runWorkflow,
  saveWorkflow,
  saveWorkflowDraft,
  workflowName,
  type SavedWorkflow,
  type WorkflowStep,
} from "../workflow";

const step = (toolId: string, options: Record<string, string | number> = {}) =>
  ({ id: `step-${toolId}`, toolId, options }) satisfies WorkflowStep;

beforeEach(() => {
  window.localStorage.clear();
  mocks.sendToSw.mockReset();
  mocks.sendToSw.mockImplementation(
    async (type: string, payload: { buffer: ArrayBuffer }) => {
      const input = new Uint8Array(payload.buffer);
      return new Uint8Array([...input, type.length]);
    },
  );
});

describe("workflow catalogue", () => {
  it("has unique tool ids and matching map entries", () => {
    const ids = WORKFLOW_TOOLS.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(WORKFLOW_TOOL_MAP.get(id)).toBe(
        WORKFLOW_TOOLS.find((tool) => tool.id === id),
      );
    }
  });

  it("gives every option a default value", () => {
    for (const tool of WORKFLOW_TOOLS) {
      for (const option of tool.options) {
        expect(option.defaultValue).toBeDefined();
      }
    }
  });

  it("creates a step with defaults and a unique id", () => {
    const a = createWorkflowStep("rotate");
    const b = createWorkflowStep("rotate");

    expect(a).not.toBeNull();
    expect(a?.id).toMatch(/^step-/);
    expect(a?.id).not.toBe(b?.id);
    expect(a?.options).toEqual({ angle: "90" });
  });

  it("returns null for an unknown tool", () => {
    expect(createWorkflowStep("nope")).toBeNull();
  });
});

describe("workflowName", () => {
  it("falls back when there are no known steps", () => {
    expect(workflowName([])).toBe("Untitled workflow");
    expect(workflowName([step("nope")])).toBe("Untitled workflow");
  });

  it("joins up to three names", () => {
    expect(workflowName([step("rotate")])).toBe("Rotate");
    expect(workflowName([step("rotate"), step("watermark")])).toBe(
      "Rotate, Watermark",
    );
  });

  it("summarises longer workflows", () => {
    const name = workflowName([
      step("rotate"),
      step("watermark"),
      step("page-numbers"),
      step("flatten"),
    ]);
    expect(name).toBe("Rotate, Watermark, Add page numbers + 1 more");
  });
});

describe("runWorkflow", () => {
  it("rejects an empty workflow", async () => {
    await expect(runWorkflow(new ArrayBuffer(1), [])).rejects.toThrow(
      "Add at least one step",
    );
  });

  it("rejects an unknown step without calling the worker", async () => {
    await expect(
      runWorkflow(new ArrayBuffer(1), [step("nope")]),
    ).rejects.toThrow("Unknown workflow step: nope");
    expect(mocks.sendToSw).not.toHaveBeenCalled();
  });

  it("chains step output into the next step and reports progress", async () => {
    const onStep = vi.fn();
    const steps = [step("rotate"), step("flatten")];
    const out = await runWorkflow(new Uint8Array([1, 2]).buffer, steps, onStep);

    expect(Array.from(out)).toEqual([1, 2, "rotate-pdf".length, "flatten-pdf".length]);
    expect(onStep.mock.calls).toEqual([
      [0, 2, "Rotate"],
      [1, 2, "Flatten"],
    ]);

    const secondPayload = mocks.sendToSw.mock.calls[1][1] as {
      buffer: ArrayBuffer;
    };
    expect(Array.from(new Uint8Array(secondPayload.buffer))).toEqual([
      1,
      2,
      "rotate-pdf".length,
    ]);
    expect(mocks.sendToSw.mock.calls[0][0]).toBe("rotate-pdf");
    expect(mocks.sendToSw.mock.calls[1][0]).toBe("flatten-pdf");
  });

  it("clamps the crop margin to 0–45 percent", async () => {
    const crop = WORKFLOW_TOOL_MAP.get("crop");
    await crop!.apply(new ArrayBuffer(1), { margin: 999 });
    await crop!.apply(new ArrayBuffer(1), { margin: -10 });

    const first = mocks.sendToSw.mock.calls[0][1] as Record<string, number>;
    const second = mocks.sendToSw.mock.calls[1][1] as Record<string, number>;
    expect(first).toMatchObject({
      topPct: 45,
      rightPct: 45,
      bottomPct: 45,
      leftPct: 45,
    });
    expect(second.topPct).toBe(0);
  });

  it("falls back for empty watermark text and missing numbers", async () => {
    const watermark = WORKFLOW_TOOL_MAP.get("watermark");
    await watermark!.apply(new ArrayBuffer(1), { text: "   ", opacity: "bad" });

    expect(mocks.sendToSw).toHaveBeenCalledWith(
      "watermark-pdf",
      expect.objectContaining({ text: "CONFIDENTIAL", opacity: 0.2 }),
    );
  });

  it("requires a password for the protect step", async () => {
    const protect = WORKFLOW_TOOL_MAP.get("protect");
    await expect(
      protect!.apply(new ArrayBuffer(1), { password: "" }),
    ).rejects.toThrow("Add a password");
  });
});

describe("saved workflows", () => {
  const workflow = (id: string): SavedWorkflow => ({
    id,
    name: `Workflow ${id}`,
    steps: [{ toolId: "rotate", options: { angle: "90" } }],
    updatedAt: Date.now(),
  });

  it("saves, reads, and replaces by id", () => {
    saveWorkflow(workflow("one"));
    saveWorkflow(workflow("two"));
    saveWorkflow({ ...workflow("one"), name: "Updated" });

    const saved = getSavedWorkflows();
    expect(saved).toHaveLength(2);
    expect(saved[0].name).toBe("Updated");
    expect(getWorkflow("two")?.name).toBe("Workflow two");
    expect(getWorkflow("missing")).toBeNull();
  });

  it("keeps at most twelve workflows", () => {
    for (let i = 0; i < 14; i += 1) saveWorkflow(workflow(`w${i}`));
    expect(getSavedWorkflows()).toHaveLength(12);
  });

  it("returns an empty list for corrupt storage", () => {
    window.localStorage.setItem(STORAGE_KEYS.workflows, "{not json");
    expect(getSavedWorkflows()).toEqual([]);

    window.localStorage.setItem(STORAGE_KEYS.workflows, "{}");
    expect(getSavedWorkflows()).toEqual([]);
  });

  it("does not save when persistence is off", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ persist: false }),
    );
    saveWorkflow(workflow("one"));
    saveWorkflowDraft({ workflowId: null, steps: [], updatedAt: 1 });

    expect(window.localStorage.getItem(STORAGE_KEYS.workflows)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.workflowDraft)).toBeNull();
  });

  it("dispatches an event when the list is cleared", () => {
    saveWorkflow(workflow("one"));
    const listener = vi.fn();
    window.addEventListener(STORAGE_EVENTS.workflows, listener);

    clearSavedWorkflows();

    expect(getSavedWorkflows()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(STORAGE_EVENTS.workflows, listener);
  });

  it("creates a readable workflow id", () => {
    expect(newWorkflowId()).toMatch(/^wf-[a-z0-9]+$/);
  });
});

describe("workflow drafts", () => {
  it("round-trips a draft and clears it", () => {
    saveWorkflowDraft({ workflowId: "wf-1", steps: [], updatedAt: 5 });
    expect(getWorkflowDraft()).toEqual({
      workflowId: "wf-1",
      steps: [],
      updatedAt: 5,
    });

    clearWorkflowDraft();
    expect(getWorkflowDraft()).toBeNull();
  });

  it("ignores malformed drafts", () => {
    window.localStorage.setItem(STORAGE_KEYS.workflowDraft, "{broken");
    expect(getWorkflowDraft()).toBeNull();

    window.localStorage.setItem(
      STORAGE_KEYS.workflowDraft,
      JSON.stringify({ workflowId: null }),
    );
    expect(getWorkflowDraft()).toBeNull();
  });
});
