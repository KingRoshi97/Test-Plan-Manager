import { createHash } from "node:crypto";

export interface CacheKey {
  namespace: string;
  input_hash: string;
  version: string;
  key: string;
}

export function computeKey(namespace: string, inputs: unknown, version: string): CacheKey {
  if (!namespace || typeof namespace !== "string") {
    throw new Error("ERR-CACHE-001: namespace must be a non-empty string");
  }
  if (!version || typeof version !== "string") {
    throw new Error("ERR-CACHE-001: version must be a non-empty string");
  }
  const canonical = JSON.stringify(inputs, Object.keys(typeof inputs === "object" && inputs !== null ? inputs as Record<string, unknown> : {}).sort());
  const input_hash = createHash("sha256").update(canonical, "utf-8").digest("hex");
  const key = `${namespace}:${version}:${input_hash}`;
  return { namespace, input_hash, version, key };
}

export function formatCacheKey(cacheKey: CacheKey): string {
  if (!cacheKey || !cacheKey.namespace || !cacheKey.version || !cacheKey.input_hash) {
    throw new Error("ERR-CACHE-002: invalid CacheKey — missing required fields");
  }
  return `${cacheKey.namespace}:${cacheKey.version}:${cacheKey.input_hash}`;
}

export function parseCacheKey(formatted: string): CacheKey {
  if (!formatted || typeof formatted !== "string") {
    throw new Error("ERR-CACHE-002: formatted cache key must be a non-empty string");
  }
  const parts = formatted.split(":");
  if (parts.length !== 3) {
    throw new Error("ERR-CACHE-002: invalid cache key format — expected namespace:version:hash");
  }
  const [namespace, version, input_hash] = parts;
  return { namespace, input_hash, version, key: formatted };
}
