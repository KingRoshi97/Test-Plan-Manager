import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ensureDir } from "./fs.js";
import { sha256 } from "./hash.js";

export function deepSortKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(deepSortKeys);
  }
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    sorted[key] = deepSortKeys((value as Record<string, unknown>)[key]);
  }
  return sorted;
}

export function canonicalJsonString(data: unknown): string {
  return JSON.stringify(deepSortKeys(data), null, 2) + "\n";
}

export function writeCanonicalJson(filePath: string, data: unknown): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, canonicalJsonString(data), "utf-8");
}

export function canonicalHash(data: unknown): string {
  return sha256(canonicalJsonString(data));
}
