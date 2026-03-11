import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { writeJson, readJson } from "../../utils/fs.js";
import type { PinScope, PinClass } from "./model.js";

export interface PinEntry {
  pin_id: string;
  artifact_id: string;
  artifact_path: string;
  pinned_at: string;
  pinned_by: string;
  reason?: string;
  hash: string;
  scope: PinScope;
  pin_class: PinClass;
}

export interface Pinset {
  run_id: string;
  pins: PinEntry[];
  updated_at: string;
}

function pinsetPath(runId: string): string {
  return join(".axion", "runs", runId, "pinset.json");
}

function loadPinset(runId: string): Pinset {
  const p = pinsetPath(runId);
  if (!existsSync(p)) {
    return { run_id: runId, pins: [], updated_at: isoNow() };
  }
  return readJson<Pinset>(p);
}

function savePinset(pinset: Pinset): void {
  pinset.updated_at = isoNow();
  writeJson(pinsetPath(pinset.run_id), pinset);
}

function generatePinId(artifactPath: string): string {
  return `pin_${sha256(artifactPath + isoNow()).slice(0, 12)}`;
}

export function pinArtifact(
  runId: string,
  artifactPath: string,
  pinnedBy: string,
  reason?: string,
  scope: PinScope = "run",
  pinClass: PinClass = "standard",
): PinEntry {
  if (!existsSync(artifactPath)) {
    throw new Error(`Cannot pin artifact: file not found at ${artifactPath}`);
  }

  const content = readFileSync(artifactPath, "utf-8");
  const hash = sha256(content);

  const pinset = loadPinset(runId);

  const existing = pinset.pins.find((p) => p.artifact_path === artifactPath);
  if (existing) {
    throw new Error(
      `Artifact already pinned: ${artifactPath} (pin_id: ${existing.pin_id})`,
    );
  }

  const entry: PinEntry = {
    pin_id: generatePinId(artifactPath),
    artifact_id: `artifact_${sha256(artifactPath).slice(0, 8)}`,
    artifact_path: artifactPath,
    pinned_at: isoNow(),
    pinned_by: pinnedBy,
    hash,
    scope,
    pin_class: pinClass,
  };

  if (reason) {
    entry.reason = reason;
  }

  pinset.pins.push(entry);
  savePinset(pinset);

  return entry;
}

export function unpinArtifact(runId: string, pinId: string, actor?: string): void {
  const pinset = loadPinset(runId);

  const idx = pinset.pins.findIndex((p) => p.pin_id === pinId);
  if (idx === -1) {
    throw new Error(`Pin not found: ${pinId} in run ${runId}`);
  }

  const pin = pinset.pins[idx];

  if (pin.pin_class === "immutable") {
    throw new Error(
      `Cannot unpin immutable pin ${pinId}: immutable pins require approval-gated removal. Actor: ${actor ?? "unknown"}`,
    );
  }

  pinset.pins.splice(idx, 1);
  savePinset(pinset);
}

export function forceUnpinImmutable(runId: string, pinId: string, actor: string, approvalRef: string): void {
  const pinset = loadPinset(runId);

  const idx = pinset.pins.findIndex((p) => p.pin_id === pinId);
  if (idx === -1) {
    throw new Error(`Pin not found: ${pinId} in run ${runId}`);
  }

  if (!approvalRef) {
    throw new Error("Approval reference required to force-unpin immutable pin");
  }

  pinset.pins.splice(idx, 1);
  savePinset(pinset);
}

export function listPins(runId: string, scopeFilter?: PinScope): PinEntry[] {
  const pinset = loadPinset(runId);
  if (scopeFilter) {
    return pinset.pins.filter((p) => p.scope === scopeFilter);
  }
  return pinset.pins;
}

export function verifyPin(runId: string, pinId: string): boolean {
  const pinset = loadPinset(runId);
  const pin = pinset.pins.find((p) => p.pin_id === pinId);

  if (!pin) {
    throw new Error(`Pin not found: ${pinId} in run ${runId}`);
  }

  if (!existsSync(pin.artifact_path)) {
    return false;
  }

  const content = readFileSync(pin.artifact_path, "utf-8");
  const currentHash = sha256(content);
  return currentHash === pin.hash;
}

export function verifyAllPins(
  runId: string,
): { valid: boolean; results: Array<{ pin_id: string; valid: boolean }> } {
  const pins = listPins(runId);
  const results = pins.map((pin) => ({
    pin_id: pin.pin_id,
    valid: verifyPin(runId, pin.pin_id),
  }));
  return {
    valid: results.every((r) => r.valid),
    results,
  };
}
