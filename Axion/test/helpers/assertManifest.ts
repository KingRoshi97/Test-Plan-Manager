import type { RunManifest } from "../../src/types/run.js";

export function assertManifest(_manifest: unknown): asserts _manifest is RunManifest {
  if (typeof _manifest !== "object" || _manifest === null) {
    throw new Error("Manifest must be a non-null object");
  }
  const m = _manifest as Record<string, unknown>;
  if (typeof m.run_id !== "string") throw new Error("run_id must be a string");
  if (typeof m.status !== "string") throw new Error("status must be a string");
  if (typeof m.created_at !== "string") throw new Error("created_at must be a string");
}

export function assertManifestComplete(_manifest: RunManifest): void {
  if (!_manifest.stages || _manifest.stages.length === 0) {
    throw new Error("Manifest has no stages");
  }
}
