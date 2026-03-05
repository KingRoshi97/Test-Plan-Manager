import type { DiffEntry } from "./runDiff.js";

export type ChangeClassification =
  | "structural"
  | "content"
  | "metadata"
  | "formatting"
  | "unknown";

const STRUCTURAL_PATTERNS = [
  /^manifest\.json$/,
  /^index\.json$/,
  /^entrypoint\.json$/,
  /^kit\.json$/,
  /^versions\.json$/,
  /\.schema\.json$/,
];

const METADATA_PATTERNS = [
  /^\.axion\//,
  /^_meta/,
  /\.lock$/,
  /^state\//,
  /^gate_reports\//,
  /^proof_log/,
  /^run_state\.json$/,
];

const FORMATTING_EXTENSIONS = new Set([
  ".css",
  ".scss",
  ".less",
  ".prettierrc",
  ".editorconfig",
]);

export function classifySingleChange(entry: DiffEntry): ChangeClassification {
  if (entry.change_type === "unchanged") {
    return "unknown";
  }

  const path = entry.path;

  for (const pattern of STRUCTURAL_PATTERNS) {
    if (pattern.test(path)) {
      return "structural";
    }
  }

  if (entry.change_type === "added" || entry.change_type === "removed") {
    return "structural";
  }

  for (const pattern of METADATA_PATTERNS) {
    if (pattern.test(path)) {
      return "metadata";
    }
  }

  const ext = path.slice(path.lastIndexOf("."));
  if (FORMATTING_EXTENSIONS.has(ext)) {
    return "formatting";
  }

  return "content";
}

export function classifyChanges(entries: DiffEntry[]): DiffEntry[] {
  return entries.map(entry => ({
    ...entry,
    classification: classifySingleChange(entry),
  }));
}
