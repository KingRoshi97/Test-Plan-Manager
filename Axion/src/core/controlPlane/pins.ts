import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Pinset, PinsetEntry } from "../../types/controlPlane.js";

export interface PinEntry {
  pin_id: string;
  artifact_id: string;
  artifact_path: string;
  pinned_at: string;
  pinned_by: string;
  reason?: string;
  hash: string;
}

interface PinStore {
  pins: PinEntry[];
}

function generatePinId(): string {
  return `PIN-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

let _storePath = ".axion/pins.json";

export function setPinStorePath(path: string): void {
  _storePath = path;
}

function loadStore(): PinStore {
  if (existsSync(_storePath)) {
    return readJson<PinStore>(_storePath);
  }
  return { pins: [] };
}

function saveStore(store: PinStore): void {
  ensureDir(dirname(_storePath));
  writeJson(_storePath, store);
}

export function pinArtifact(runId: string, artifactPath: string, pinnedBy: string, reason?: string): PinEntry {
  const store = loadStore();

  let contentHash: string;
  if (existsSync(artifactPath)) {
    const content = readFileSync(artifactPath, "utf-8");
    contentHash = sha256(content);
  } else {
    contentHash = sha256(artifactPath + runId);
  }

  const pin: PinEntry = {
    pin_id: generatePinId(),
    artifact_id: `${runId}:${artifactPath}`,
    artifact_path: artifactPath,
    pinned_at: isoNow(),
    pinned_by: pinnedBy,
    reason,
    hash: contentHash,
  };

  store.pins.push(pin);
  saveStore(store);
  return pin;
}

export function unpinArtifact(runId: string, pinId: string): void {
  const store = loadStore();
  const idx = store.pins.findIndex((p) => p.pin_id === pinId);
  if (idx === -1) {
    throw new Error(`Pin not found: ${pinId}`);
  }
  store.pins.splice(idx, 1);
  saveStore(store);
}

export function listPins(runId: string): PinEntry[] {
  const store = loadStore();
  return store.pins.filter((p) => p.artifact_id.startsWith(`${runId}:`));
}

export interface PinPolicy {
  strategy: "latest" | "locked" | "semver_minor";
  registries: Array<{
    registry_id: string;
    registry_type: PinsetEntry["registry_type"];
    path: string;
  }>;
}

export function resolvePinset(pinPolicy: PinPolicy, runId: string): Pinset {
  const entries: PinsetEntry[] = pinPolicy.registries.map((reg) => {
    let version = "1.0.0";
    let hash = sha256(reg.registry_id);

    if (existsSync(reg.path)) {
      try {
        const content = readFileSync(reg.path, "utf-8");
        const parsed = JSON.parse(content) as Record<string, unknown>;
        version = (parsed["version"] as string) ?? "1.0.0";
        hash = sha256(content);
      } catch {
        // use defaults
      }
    }

    return {
      registry_id: reg.registry_id,
      registry_type: reg.registry_type,
      resolved_version: version,
      hash,
    };
  });

  const pinsetContent = JSON.stringify(entries.sort((a, b) => a.registry_id.localeCompare(b.registry_id)));
  const pinsetHash = sha256(pinsetContent);

  return {
    pinset_id: `PSET-${runId}`,
    run_id: runId,
    created_at: isoNow(),
    resolution_policy: pinPolicy.strategy,
    entries,
    pinset_hash: pinsetHash,
  };
}
