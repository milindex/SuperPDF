"use client";

let swRegistration: ServiceWorkerRegistration | null = null;
let messageId = 0;

export function setSwRegistration(reg: ServiceWorkerRegistration | null) {
  swRegistration = reg;
}

export function getSwRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

/**
 * Recursively collects every transferable ArrayBuffer in a value so the
 * Service Worker can receive file bytes without a structured-clone copy.
 *
 * - `ArrayBuffer` values are collected directly.
 * - Typed arrays and DataViews contribute their underlying `buffer`.
 * - Plain objects and arrays are walked recursively.
 * - Duplicate buffers are reported once (Set-backed), and non-binary values
 *   are ignored.
 */
export function collectTransferables(value: unknown): ArrayBuffer[] {
  const buffers = new Set<ArrayBuffer>();

  const visit = (node: unknown): void => {
    if (node == null) return;
    if (node instanceof ArrayBuffer) {
      buffers.add(node);
      return;
    }
    if (ArrayBuffer.isView(node)) {
      if (node.buffer instanceof ArrayBuffer) buffers.add(node.buffer);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (typeof node === "object") {
      for (const field of Object.values(node as Record<string, unknown>)) {
        visit(field);
      }
    }
  };

  visit(value);
  return [...buffers];
}

/**
 * Sends a typed message to the Service Worker router and resolves the
 * matching response over a MessageChannel. Posting to `reg.active` directly
 * works on first load (no controlled-page requirement).
 *
 * The caller must guarantee `type` is handled in sw-source/index.ts (see
 * Agent.md §0.2). A lint/CI check cross-references every `sendToSw()` call
 * against router-handled types.
 *
 * Any ArrayBuffer in `payload` is transferred (detached on the caller's side)
 * rather than copied, so callers must not reuse those buffers afterwards.
 */
export function sendToSw<P = unknown, R = unknown>(
  type: string,
  payload: P,
): Promise<R> {
  const active = swRegistration?.active;
  if (!active) {
    return Promise.reject(new Error("Service Worker not ready"));
  }

  const id = ++messageId;

  return new Promise<R>((resolve, reject) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent) => {
      const { error, result } = event.data as { error?: string; result?: R };
      channel.port1.close();
      if (error) reject(new Error(error));
      else resolve(result as R);
    };

    const transfer = collectTransferables(payload);
    try {
      active.postMessage({ type, id, payload }, [...transfer, channel.port2]);
    } catch (error) {
      channel.port1.close();
      channel.port2.close();
      reject(error);
    }
  });
}
