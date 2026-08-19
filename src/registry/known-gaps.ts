/**
 * Known gaps that are NOT represented by a registry entry with
 * status !== "implemented". Manually flagged items live here so the
 * generated "Current gaps" section in ARCHITECTURE.md can include them.
 */
export interface KnownGap {
  id: string;
  description: string;
}

export const knownGaps: KnownGap[] = [];
