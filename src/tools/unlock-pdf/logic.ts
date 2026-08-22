import { detectPdf } from "@/lib/pdf-detect";
import { runQpdf } from "@/lib/qpdf";

export type UnlockFeasibility =
  | { status: "not-encrypted"; pageCount: number }
  | { status: "encrypted"; pageCount: number }
  | { status: "invalid"; error: string };

/** Determine whether the PDF is encrypted and can be unlocked client-side. */
export async function detectUnlockFeasibility(
  buffer: ArrayBuffer,
): Promise<UnlockFeasibility> {
  const d = await detectPdf(buffer);
  if (d.status === "invalid") return { status: "invalid", error: d.error };
  if (d.encrypted) {
    return { status: "encrypted", pageCount: d.pageCount || 0 };
  }
  return { status: "not-encrypted", pageCount: d.pageCount };
}

/**
 * Decrypt a password-protected PDF using the in-browser qpdf engine.
 * Throws a human-readable error on failure (e.g. wrong password).
 */
export async function unlockPdf(
  buffer: ArrayBuffer,
  password?: string,
): Promise<Uint8Array> {
  const input = new Uint8Array(buffer);
  const args = password ? ["--decrypt", `--password=${password}`] : ["--decrypt"];
  try {
    return await runQpdf(args, input);
  } catch {
    throw new Error("Unable to unlock. The password is incorrect or missing.");
  }
}