import { NotImplementedError } from "../../utils/errors.js";

export interface CacheKey {
  namespace: string;
  input_hash: string;
  version: string;
  key: string;
}

export function computeKey(_namespace: string, _inputs: unknown, _version: string): CacheKey {
  throw new NotImplementedError("computeKey");
}

export function formatCacheKey(_key: CacheKey): string {
  throw new NotImplementedError("formatCacheKey");
}

export function parseCacheKey(_formatted: string): CacheKey {
  throw new NotImplementedError("parseCacheKey");
}
