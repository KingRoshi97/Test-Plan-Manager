import { NotImplementedError } from "../../utils/errors.js";

export interface PinEntry {
  pin_id: string;
  artifact_id: string;
  artifact_path: string;
  pinned_at: string;
  pinned_by: string;
  reason?: string;
  hash: string;
}

export function pinArtifact(_runId: string, _artifactPath: string, _pinnedBy: string): PinEntry {
  throw new NotImplementedError("pinArtifact");
}

export function unpinArtifact(_runId: string, _pinId: string): void {
  throw new NotImplementedError("unpinArtifact");
}

export function listPins(_runId: string): PinEntry[] {
  throw new NotImplementedError("listPins");
}
