import { detectPdf } from "@/lib/pdf-detect";
import { runQpdf } from "@/lib/qpdf";

export type ProtectFeasibility =
  | { status: "protectable"; pageCount: number }
  | { status: "already-encrypted"; pageCount: number }
  | { status: "invalid"; error: string };

/** Determine whether the PDF can be protected client-side (qpdf engine). */
export async function detectProtectFeasibility(
  buffer: ArrayBuffer,
): Promise<ProtectFeasibility> {
  const d = await detectPdf(buffer);
  if (d.status === "invalid") return { status: "invalid", error: d.error };
  if (d.encrypted) {
    return { status: "already-encrypted", pageCount: d.pageCount || 0 };
  }
  return { status: "protectable", pageCount: d.pageCount };
}

/**
 * Encrypt a PDF with a user password using the in-browser qpdf engine
 * (256-bit AES). Throws a human-readable error on failure.
 */
export async function protectPdf(
  buffer: ArrayBuffer,
  password: string,
): Promise<Uint8Array> {
  if (!password) throw new Error("A password is required.");
  const input = new Uint8Array(buffer);
  return runQpdf(["--encrypt", password, password, "256"], input);
}