import { existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

export interface GCResult {
  scanned: number;
  removed: number;
  freed_bytes: number;
  errors: string[];
}

export interface GCOptions {
  dryRun?: boolean;
  maxAge?: number;
  keepPinned?: boolean;
}

export function findUnreferencedObjects(storePath: string, referencedHashes: Set<string>): string[] {
  const objectsDir = join(storePath, "objects");
  if (!existsSync(objectsDir)) return [];

  const unreferenced: string[] = [];
  const prefixes = readdirSync(objectsDir);

  for (const prefix of prefixes) {
    const prefixDir = join(objectsDir, prefix);
    if (!statSync(prefixDir).isDirectory()) continue;

    const files = readdirSync(prefixDir);
    for (const file of files) {
      if (!referencedHashes.has(file)) {
        unreferenced.push(file);
      }
    }
  }

  return unreferenced;
}

export function garbageCollect(storePath: string, referencedHashes: Set<string>, options?: GCOptions): GCResult {
  const dryRun = options?.dryRun ?? false;
  const maxAge = options?.maxAge;
  const objectsDir = join(storePath, "objects");

  const result: GCResult = {
    scanned: 0,
    removed: 0,
    freed_bytes: 0,
    errors: [],
  };

  if (!existsSync(objectsDir)) return result;

  const prefixes = readdirSync(objectsDir);
  const now = Date.now();

  for (const prefix of prefixes) {
    const prefixDir = join(objectsDir, prefix);
    if (!statSync(prefixDir).isDirectory()) continue;

    const files = readdirSync(prefixDir);
    for (const file of files) {
      result.scanned++;
      const filePath = join(prefixDir, file);

      if (referencedHashes.has(file)) continue;

      try {
        const st = statSync(filePath);

        if (maxAge !== undefined) {
          const ageMs = now - st.mtimeMs;
          if (ageMs < maxAge) continue;
        }

        if (!dryRun) {
          unlinkSync(filePath);
        }

        result.removed++;
        result.freed_bytes += st.size;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Failed to remove ${file}: ${msg}`);
      }
    }
  }

  return result;
}
