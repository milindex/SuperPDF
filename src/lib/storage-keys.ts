export const STORAGE_KEYS = {
  settings: "superpdf:settings",
  recent: "superpdf:recent",
  workflows: "superpdf:workflows",
  workflowDraft: "superpdf:workflow-draft",
  toolSettings: "superpdf:tool-settings",
  toolModes: "superpdf:tool-modes",
} as const;

export const STORAGE_EVENTS = {
  settings: "superpdf:settings-changed",
  recent: "superpdf:recent-changed",
  workflows: "superpdf:workflows-changed",
  toolSettings: "superpdf:tool-settings-changed",
  toolModes: "superpdf:tool-modes-changed",
} as const;
