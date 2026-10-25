"use client";

import { runQpdf } from "@/lib/qpdf";

/**
 * Remove owner restrictions from a PDF. If the file needs a password to open,
 * use Unlock PDF instead.
 */
export async function removeRestrictions(
  buffer: ArrayBuffer,
): Promise<Uint8Array> {
  return runQpdf(["--decrypt"], new Uint8Array(buffer));
}
