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
 * Sends a typed message to the Service Worker router and resolves the
 * matching response over a MessageChannel. Posting to `reg.active` directly
 * works on first load (no controlled-page requirement).
 *
 * The caller must guarantee `type` is handled in sw-source/index.ts (see
 * Agent.md §0.2). A lint/CI check cross-references every `sendToSw()` call
 * against router-handled types.
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
      if (error) reject(new Error(error));
      else resolve(result as R);
    };
    active.postMessage({ type, id, payload }, [channel.port2]);
  });
}