import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";

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

interface ReleaseStore {
  releases: Release[];
}

function generateReleaseId(): string {
  return `REL-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadStore(storePath: string): ReleaseStore {
  if (existsSync(storePath)) {
    return readJson<ReleaseStore>(storePath);
  }
  return { releases: [] };
}

function saveStore(storePath: string, store: ReleaseStore): void {
  ensureDir(dirname(storePath));
  writeJson(storePath, store);
}

let _storePath = ".axion/releases.json";

export function setReleaseStorePath(path: string): void {
  _storePath = path;
}

export function createRelease(runId: string, version: string, artifacts?: Array<{ artifact_id: string; path: string; hash: string }>): Release {
  const store = loadStore(_storePath);

  const release: Release = {
    release_id: generateReleaseId(),
    run_id: runId,
    version,
    created_at: isoNow(),
    status: "draft",
    artifacts: artifacts ?? [],
    signatures: [],
  };

  store.releases.push(release);
  saveStore(_storePath, store);
  return release;
}

export function signRelease(releaseId: string, signer: string): void {
  const store = loadStore(_storePath);
  const release = store.releases.find((r) => r.release_id === releaseId);
  if (!release) {
    throw new Error(`Release not found: ${releaseId}`);
  }

  if (release.status === "revoked") {
    throw new Error(`Cannot sign revoked release: ${releaseId}`);
  }

  const signaturePayload = JSON.stringify({
    release_id: releaseId,
    signer,
    artifacts: release.artifacts,
    version: release.version,
  });
  const signature = sha256(signaturePayload);

  release.signatures.push({
    signer,
    signature,
    signed_at: isoNow(),
  });

  release.status = "staged";
  saveStore(_storePath, store);
}

export function publishRelease(releaseId: string): void {
  const store = loadStore(_storePath);
  const release = store.releases.find((r) => r.release_id === releaseId);
  if (!release) {
    throw new Error(`Release not found: ${releaseId}`);
  }

  if (release.status === "revoked") {
    throw new Error(`Cannot publish revoked release: ${releaseId}`);
  }

  if (release.signatures.length === 0) {
    throw new Error(`Release must be signed before publishing: ${releaseId}`);
  }

  release.status = "published";
  saveStore(_storePath, store);
}

export function revokeRelease(releaseId: string, reason: string): void {
  const store = loadStore(_storePath);
  const release = store.releases.find((r) => r.release_id === releaseId);
  if (!release) {
    throw new Error(`Release not found: ${releaseId}`);
  }

  release.status = "revoked";
  release.notes = reason;
  saveStore(_storePath, store);
}

export function getRelease(releaseId: string): Release | null {
  const store = loadStore(_storePath);
  return store.releases.find((r) => r.release_id === releaseId) ?? null;
}

export function listReleases(runId?: string): Release[] {
  const store = loadStore(_storePath);
  if (runId) {
    return store.releases.filter((r) => r.run_id === runId);
  }
  return store.releases;
}
