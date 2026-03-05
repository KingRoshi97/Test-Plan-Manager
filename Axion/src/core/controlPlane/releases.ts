import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, writeJson, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";

export type ReleaseStatus = "draft" | "staged" | "published" | "revoked";

export interface Release {
  release_id: string;
  run_id: string;
  version: string;
  created_at: string;
  updated_at: string;
  status: ReleaseStatus;
  artifacts: Array<{ artifact_id: string; path: string; hash: string }>;
  signatures: Array<{ signer: string; signature: string; signed_at: string }>;
  notes?: string;
  revocation_reason?: string;
}

const VALID_TRANSITIONS: Record<ReleaseStatus, ReleaseStatus[]> = {
  draft: ["staged", "revoked"],
  staged: ["published", "revoked"],
  published: ["revoked"],
  revoked: [],
};

let releaseCounter = 0;

function generateReleaseId(): string {
  releaseCounter++;
  const ts = Date.now().toString(36);
  const seq = releaseCounter.toString().padStart(4, "0");
  return `REL-${ts}-${seq}`;
}

function releasesDir(basePath: string): string {
  return join(basePath, "releases");
}

function releasePath(basePath: string, releaseId: string): string {
  return join(releasesDir(basePath), `${releaseId}.json`);
}

function loadRelease(basePath: string, releaseId: string): Release | null {
  const path = releasePath(basePath, releaseId);
  if (!existsSync(path)) {
    return null;
  }
  return readJson<Release>(path);
}

function saveRelease(basePath: string, release: Release): void {
  const dir = releasesDir(basePath);
  ensureDir(dir);
  writeJson(releasePath(basePath, release.release_id), release);
}

function assertTransition(current: ReleaseStatus, target: ReleaseStatus): void {
  if (!VALID_TRANSITIONS[current].includes(target)) {
    throw new Error(
      `Invalid release transition: ${current} → ${target}. Allowed: ${VALID_TRANSITIONS[current].join(", ") || "none"}`,
    );
  }
}

export function createRelease(
  runId: string,
  version: string,
  basePath: string = ".axion",
  artifacts: Array<{ artifact_id: string; path: string; hash: string }> = [],
  notes?: string,
): Release {
  const now = isoNow();
  const release: Release = {
    release_id: generateReleaseId(),
    run_id: runId,
    version,
    created_at: now,
    updated_at: now,
    status: "draft",
    artifacts,
    signatures: [],
    notes,
  };
  saveRelease(basePath, release);
  return release;
}

export function signRelease(
  releaseId: string,
  signer: string,
  basePath: string = ".axion",
): Release {
  const release = loadRelease(basePath, releaseId);
  if (!release) {
    throw new Error(`Release ${releaseId} not found`);
  }
  assertTransition(release.status, "staged");

  const signedAt = isoNow();
  const payload = JSON.stringify({
    release_id: releaseId,
    signer,
    signed_at: signedAt,
    artifacts: release.artifacts,
  });
  const signature = sha256(payload);

  release.signatures.push({ signer, signature, signed_at: signedAt });
  release.status = "staged";
  release.updated_at = signedAt;

  saveRelease(basePath, release);
  return release;
}

export function publishRelease(
  releaseId: string,
  basePath: string = ".axion",
): Release {
  const release = loadRelease(basePath, releaseId);
  if (!release) {
    throw new Error(`Release ${releaseId} not found`);
  }
  assertTransition(release.status, "published");

  if (release.signatures.length === 0) {
    throw new Error(`Release ${releaseId} must be signed before publishing`);
  }

  release.status = "published";
  release.updated_at = isoNow();

  saveRelease(basePath, release);
  return release;
}

export function revokeRelease(
  releaseId: string,
  reason: string,
  basePath: string = ".axion",
): Release {
  const release = loadRelease(basePath, releaseId);
  if (!release) {
    throw new Error(`Release ${releaseId} not found`);
  }
  assertTransition(release.status, "revoked");

  release.status = "revoked";
  release.revocation_reason = reason;
  release.updated_at = isoNow();

  saveRelease(basePath, release);
  return release;
}

export function getRelease(
  releaseId: string,
  basePath: string = ".axion",
): Release | null {
  return loadRelease(basePath, releaseId);
}

export function listReleases(basePath: string = ".axion"): Release[] {
  const dir = releasesDir(basePath);
  if (!existsSync(dir)) {
    return [];
  }
  const entries = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const releases: Release[] = [];
  for (const entry of entries) {
    const releaseId = entry.replace(".json", "");
    const release = loadRelease(basePath, releaseId);
    if (release) {
      releases.push(release);
    }
  }
  return releases;
}
