import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

export interface IntegrityCheckResult {
  valid: boolean;
  checked: number;
  corrupted: Array<{ path: string; expected_hash: string; actual_hash: string }>;
  missing: string[];
}

export function checkIntegrity(cachePath: string): IntegrityCheckResult {
  const result: IntegrityCheckResult = {
    valid: true,
    checked: 0,
    corrupted: [],
    missing: [],
  };

  if (!cachePath || typeof cachePath !== "string") {
    throw new Error("ERR-CACHE-001: cachePath must be a non-empty string");
  }

  if (!existsSync(cachePath)) {
    throw new Error(`ERR-CACHE-003: cache directory does not exist: ${cachePath}`);
  }

  const manifestPath = join(cachePath, "integrity.json");
  if (!existsSync(manifestPath)) {
    return result;
  }

  let manifest: Record<string, string>;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  } catch {
    throw new Error("ERR-CACHE-003: integrity manifest is corrupted");
  }

  const entries = Object.entries(manifest);
  result.checked = entries.length;

  for (const [relativePath, expectedHash] of entries) {
    const fullPath = join(cachePath, relativePath);
    if (!existsSync(fullPath)) {
      result.missing.push(relativePath);
      result.valid = false;
      continue;
    }
    const content = readFileSync(fullPath);
    const actualHash = createHash("sha256").update(content).digest("hex");
    if (actualHash !== expectedHash) {
      result.corrupted.push({ path: relativePath, expected_hash: expectedHash, actual_hash: actualHash });
      result.valid = false;
    }
  }

  return result;
}

export function repairCache(cachePath: string, result: IntegrityCheckResult): void {
  if (!cachePath || typeof cachePath !== "string") {
    throw new Error("ERR-CACHE-001: cachePath must be a non-empty string");
  }

  if (!existsSync(cachePath)) {
    throw new Error(`ERR-CACHE-003: cache directory does not exist: ${cachePath}`);
  }

  for (const entry of result.corrupted) {
    const fullPath = join(cachePath, entry.path);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  if (result.missing.length > 0 || result.corrupted.length > 0) {
    const manifestPath = join(cachePath, "integrity.json");
    if (existsSync(manifestPath)) {
      const manifest: Record<string, string> = JSON.parse(readFileSync(manifestPath, "utf-8"));
      for (const missing of result.missing) {
        delete manifest[missing];
      }
      for (const corrupted of result.corrupted) {
        delete manifest[corrupted.path];
      }
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
    }
  }
}

export function buildIntegrityManifest(cachePath: string): Record<string, string> {
  if (!existsSync(cachePath)) {
    throw new Error(`ERR-CACHE-003: cache directory does not exist: ${cachePath}`);
  }

  const manifest: Record<string, string> = {};

  function walkDir(dir: string, prefix: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const fullPath = join(dir, entry.name);
      if (entry.name === "integrity.json") continue;
      if (entry.isFile()) {
        const content = readFileSync(fullPath);
        manifest[relativePath] = createHash("sha256").update(content).digest("hex");
      } else if (entry.isDirectory()) {
        walkDir(fullPath, relativePath);
      }
    }
  }

  walkDir(cachePath, "");

  const manifestPath = join(cachePath, "integrity.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

  return manifest;
}
