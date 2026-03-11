import path from "node:path";
import { loadAliasIndex, loadKnowledgeIndex, loadRelationshipIndex } from "./registry.js";
import type { ResolveResult } from "./types.js";

function isKid(value: string): boolean {
  return /^KID-[A-Z0-9-_]+$/i.test(value.trim());
}

function normalizeInput(value: string): string {
  return value.trim();
}

export function resolveKid(input: string): ResolveResult | null {
  const normalized = normalizeInput(input);
  const knowledgeIndex = loadKnowledgeIndex();
  const aliasIndex = loadAliasIndex();
  const relationshipIndex = loadRelationshipIndex();

  if (isKid(normalized)) {
    const match = knowledgeIndex.find((entry) => entry.kid === normalized);
    if (match) {
      const rel = relationshipIndex[match.kid];
      return {
        kid: match.kid,
        resolved_from: "kid",
        matched_input: input,
        current_path: match.path,
        legacy_path: rel?.legacy_path,
      };
    }
  }

  const aliasedKid = aliasIndex[normalized];
  if (aliasedKid) {
    const match = knowledgeIndex.find((entry) => entry.kid === aliasedKid);
    if (!match) return null;
    const rel = relationshipIndex[aliasedKid];
    return {
      kid: aliasedKid,
      resolved_from: "alias",
      matched_input: input,
      current_path: match.path,
      legacy_path: rel?.legacy_path,
    };
  }

  for (const [kid, rel] of Object.entries(relationshipIndex)) {
    if (rel.legacy_path === normalized) {
      return {
        kid,
        resolved_from: "legacy_path",
        matched_input: input,
        current_path: rel.current_path,
        legacy_path: rel.legacy_path,
      };
    }
  }

  const inputBasename = path.basename(normalized, path.extname(normalized));
  for (const [kid, rel] of Object.entries(relationshipIndex)) {
    const legacyBase = rel.legacy_path
      ? path.basename(rel.legacy_path, path.extname(rel.legacy_path))
      : null;
    if (legacyBase && legacyBase === inputBasename) {
      return {
        kid,
        resolved_from: "legacy_filename",
        matched_input: input,
        current_path: rel.current_path,
        legacy_path: rel.legacy_path,
      };
    }
  }

  return null;
}
