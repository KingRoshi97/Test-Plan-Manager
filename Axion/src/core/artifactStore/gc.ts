import { NotImplementedError } from "../../utils/errors.js";

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

export function garbageCollect(_storePath: string, _referencedHashes: Set<string>, _options?: GCOptions): GCResult {
  throw new NotImplementedError("garbageCollect");
}

export function findUnreferencedObjects(_storePath: string, _referencedHashes: Set<string>): string[] {
  throw new NotImplementedError("findUnreferencedObjects");
}
