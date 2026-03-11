import { loadRelationshipIndex } from "./registry.js";
import type { RelationshipEntry } from "./types.js";

export function loadRelationships(kid: string): RelationshipEntry | null {
  const relIndex = loadRelationshipIndex();
  return relIndex[kid] ?? null;
}
