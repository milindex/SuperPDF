"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { recordRecent } from "@/lib/recent";
import { getSettings } from "@/lib/settings";
import {
  WORKFLOW_TOOLS,
  WORKFLOW_TOOL_MAP,
  createWorkflowStep,
  getWorkflow,
  getWorkflowDraft,
  newWorkflowId,
  runWorkflow,
  saveWorkflow,
  saveWorkflowDraft,
  workflowName,
  type WorkflowOptions,
  type WorkflowOptionValue,
  type WorkflowStep,
} from "@/lib/workflow";
import styles from "./workflow.module.scss";

const EXAMPLE_STEPS = ["compress", "page-numbers", "watermark"];

export default function WorkflowBuilder() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [addTool, setAddTool] = useState(WORKFLOW_TOOLS[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    index: number;
    total: number;
    name: string;
  } | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("workflow.pdf");
  const [error, setError] = useState<string | null>(null);

  const name = useMemo(() => workflowName(steps), [steps]);

  const hydrate = (savedSteps: { toolId: string; options: WorkflowOptions }[]) =>
    savedSteps
      .map((savedStep) => {
        const step = createWorkflowStep(savedStep.toolId);
        if (!step) return null;
        return { ...step, options: { ...step.options, ...savedStep.options } };
      })
      .filter((step): step is WorkflowStep => Boolean(step));

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("load");
    if (id) {
      const saved = getWorkflow(id);
      if (!saved) return;
      setWorkflowId(saved.id);
      setSteps(hydrate(saved.steps));
      return;
    }
    if (!getSettings().persist) return;
    const draft = getWorkflowDraft();
    if (!draft) return;
    setWorkflowId(draft.workflowId);
    setSteps(hydrate(draft.steps));
    // Drafts are restored once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!getSettings().persist || steps.length === 0) return;
    const timer = setTimeout(() => {
      saveWorkflowDraft({
        workflowId,
        steps,
        updatedAt: Date.now(),
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [steps, workflowId]);

  const resetResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError(null);
  };

  const addStep = (toolId: string) => {
    const step = createWorkflowStep(toolId);
    if (!step) return;
    resetResult();
    setSteps((current) => [...current, step]);
  };

  const addExample = () => {
    const example = EXAMPLE_STEPS.map((toolId) => createWorkflowStep(toolId))
      .filter((step): step is WorkflowStep => Boolean(step));
    resetResult();
    setSteps(example);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    resetResult();
    setSteps((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeStep = (id: string) => {
    resetResult();
    setSteps((current) => current.filter((step) => step.id !== id));
  };

  const updateOption = (
    stepId: string,
    key: string,
    value: WorkflowOptionValue,
  ) => {
    resetResult();
    setSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? { ...step, options: { ...step.options, [key]: value } }
          : step,
      ),
    );
  };

  const handleFile = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const run = async () => {
    if (!file || steps.length === 0 || processing) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    setProgress(null);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = await runWorkflow(buffer, steps, (index, total, stepName) =>
        setProgress({ index, total, name: stepName }),
      );
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      const id = workflowId ?? newWorkflowId();
      const savedName = workflowName(steps);
      saveWorkflow({
        id,
        name: savedName,
        steps: steps.map((step) => ({
          toolId: step.toolId,
          options: step.options,
        })),
        updatedAt: Date.now(),
      });
      recordRecent({
        kind: "workflow",
        id,
        name: savedName,
        href: `/workflow?load=${id}`,
        meta: `${steps.length} ${steps.length === 1 ? "step" : "steps"}`,
      });
      setWorkflowId(id);
      setResultUrl(URL.createObjectURL(blob));
      setResultName(`${file.name.replace(/\.pdf$/i, "")}_workflow.pdf`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The workflow could not finish.",
      );
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Workflow</span>
        </nav>

        <header className={styles.head}>
          <h1 className={styles.title}>Workflow</h1>
          <p className={styles.intro}>
            Put the steps you always do into one chain, then run it on a PDF.
            Each step feeds the next, and the file never leaves this tab.
          </p>
        </header>

        <div className={styles.workspace}>
          <section className={styles.pipeline} aria-labelledby="steps-heading">
            <div className={styles.pipelineHead}>
              <h2 id="steps-heading" className={styles.pipelineTitle}>
                Steps
              </h2>
              <p className={styles.pipelineMeta}>
                {steps.length === 0
                  ? "Nothing queued yet"
                  : `${steps.length} ${steps.length === 1 ? "step" : "steps"}, top to bottom`}
              </p>
            </div>

            {steps.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>Chain the jobs you do together.</p>
                <p className={styles.emptyBody}>
                  Add a step below, or start with a common chain: compress the
                  file, number the pages, then stamp it.
                </p>
                <button
                  type="button"
                  className={styles.exampleBtn}
                  onClick={addExample}
                >
                  Use the example chain
                </button>
              </div>
            ) : (
              <ol className={styles.steps}>
                {steps.map((step, index) => {
                  const tool = WORKFLOW_TOOL_MAP.get(step.toolId);
                  if (!tool) return null;
                  return (
                    <li key={step.id} className={styles.step}>
                      <div className={styles.rail} aria-hidden="true">
                        <span className={styles.port} />
                        {index < steps.length - 1 && (
                          <span className={styles.line} />
                        )}
                      </div>
                      <div className={styles.node}>
                        <div className={styles.nodeHead}>
                          <span className={styles.nodeIndex}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className={styles.nodeTitleWrap}>
                            <h3 className={styles.nodeTitle}>{tool.name}</h3>
                            <p className={styles.nodeDesc}>
                              {tool.description}
                            </p>
                          </div>
                          <div className={styles.nodeActions}>
                            <button
                              type="button"
                              className={styles.nodeAction}
                              onClick={() => moveStep(index, -1)}
                              disabled={index === 0}
                              aria-label={`Move ${tool.name} up`}
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              className={styles.nodeAction}
                              onClick={() => moveStep(index, 1)}
                              disabled={index === steps.length - 1}
                              aria-label={`Move ${tool.name} down`}
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              className={`${styles.nodeAction} ${styles.remove}`}
                              onClick={() => removeStep(step.id)}
                              aria-label={`Remove ${tool.name}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {tool.options.length > 0 && (
                          <div className={styles.options}>
                            {tool.options.map((option) => {
                              const inputId = `${step.id}-${option.key}`;
                              const value = step.options[option.key];
                              return (
                                <div key={option.key} className={styles.option}>
                                  <div className={styles.optionHead}>
                                    <label
                                      className={styles.optionLabel}
                                      htmlFor={inputId}
                                    >
                                      {option.label}
                                    </label>
                                    {option.type === "range" && (
                                      <span className={styles.optionValue}>
                                        {Math.round(Number(value) * 100)}%
                                      </span>
                                    )}
                                  </div>

                                  {option.type === "select" ? (
                                    <select
                                      id={inputId}
                                      className={styles.input}
                                      value={String(value)}
                                      onChange={(event) =>
                                        updateOption(
                                          step.id,
                                          option.key,
                                          event.target.value,
                                        )
                                      }
                                    >
                                      {option.choices?.map((choice) => (
                                        <option
                                          key={choice.value}
                                          value={choice.value}
                                        >
                                          {choice.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      id={inputId}
                                      className={styles.input}
                                      type={
                                        option.type === "range"
                                          ? "range"
                                          : option.type
                                      }
                                      min={option.min}
                                      max={option.max}
                                      step={option.step}
                                      value={String(value)}
                                      onChange={(event) =>
                                        updateOption(
                                          step.id,
                                          option.key,
                                          option.type === "range" ||
                                            option.type === "number"
                                            ? Number(event.target.value)
                                            : event.target.value,
                                        )
                                      }
                                    />
                                  )}

                                  {option.hint && (
                                    <p className={styles.optionHint}>
                                      {option.hint}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className={styles.addRow}>
              <label className={styles.addLabel} htmlFor="add-step">
                Add a step
              </label>
              <div className={styles.addControls}>
                <select
                  id="add-step"
                  className={styles.input}
                  value={addTool}
                  onChange={(event) => setAddTool(event.target.value)}
                >
                  {WORKFLOW_TOOLS.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => addStep(addTool)}
                >
                  Add to workflow
                </button>
              </div>
              <p className={styles.addHint}>
                Only tools that take a PDF and return a PDF can be chained.
              </p>
            </div>
          </section>

          <aside className={styles.runPanel} aria-labelledby="run-heading">
            <h2 id="run-heading" className={styles.runTitle}>
              Run
            </h2>
            <p className={styles.runHint}>
              {steps.length === 0
                ? "Add at least one step, then choose a PDF."
                : `${name} will run on one PDF, in this tab.`}
            </p>
            <p className={styles.storageNote}>
              Steps are saved on this device when Remember settings is on. The
              PDF is never stored.
            </p>

            {file ? (
              <div className={styles.fileBar}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileMeta}>
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  className={styles.changeFile}
                  onClick={() => {
                    setFile(null);
                    setResultUrl(null);
                  }}
                >
                  Choose another file
                </button>
              </div>
            ) : (
              <DragNDropRegion
                onDrop={handleFile}
                accept={{ "application/pdf": [] }}
                multiple={false}
                text="Drop your PDF here"
                subText="The same file passes through every step"
                buttonText="Choose PDF"
                hint="Read on this device and never uploaded."
              />
            )}

            <button
              type="button"
              className={styles.runBtn}
              onClick={run}
              disabled={!file || steps.length === 0 || processing}
            >
              {processing
                ? "Running…"
                : steps.length === 0
                  ? "Add a step to run"
                  : `Run ${steps.length} ${steps.length === 1 ? "step" : "steps"}`}
            </button>

            {progress && (
              <p className={styles.progress} role="status">
                Step {progress.index + 1} of {progress.total}: {progress.name}
              </p>
            )}
            {error && <p className={styles.error}>{error}</p>}

            {resultUrl && (
              <SuccessBanner
                url={resultUrl}
                fileName={resultName}
                successText="Every step finished. The result is ready to download."
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
