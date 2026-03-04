import { NotImplementedError } from "../../utils/errors.js";

export interface Release {
  release_id: string;
  run_id: string;
  version: string;
  created_at: string;
  status: "draft" | "staged" | "published" | "revoked";
  artifacts: Array<{ artifact_id: string; path: string; hash: string }>;
  signatures: Array<{ signer: string; signature: string; signed_at: string }>;
  notes?: string;
}

export function createRelease(_runId: string, _version: string): Release {
  throw new NotImplementedError("createRelease");
}

export function signRelease(_releaseId: string, _signer: string): void {
  throw new NotImplementedError("signRelease");
}

export function publishRelease(_releaseId: string): void {
  throw new NotImplementedError("publishRelease");
}

export function revokeRelease(_releaseId: string, _reason: string): void {
  throw new NotImplementedError("revokeRelease");
}
