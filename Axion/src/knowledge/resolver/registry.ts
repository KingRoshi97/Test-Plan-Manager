import fs from "node:fs";
import {
  ALIASES_INDEX_PATH,
  KNOWLEDGE_INDEX_PATH,
  RELATIONSHIPS_INDEX_PATH,
} from "./paths.js";
import type {
  AliasIndex,
  KnowledgeIndex,
  RelationshipIndex,
} from "./types.js";

function readJsonFile<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

let knowledgeIndexCache: KnowledgeIndex | null = null;
let aliasIndexCache: AliasIndex | null = null;
let relationshipIndexCache: RelationshipIndex | null = null;

export function loadKnowledgeIndex(): KnowledgeIndex {
  if (!knowledgeIndexCache) {
    knowledgeIndexCache = readJsonFile<KnowledgeIndex>(KNOWLEDGE_INDEX_PATH, []);
  }
  return knowledgeIndexCache;
}

export function loadAliasIndex(): AliasIndex {
  if (!aliasIndexCache) {
    aliasIndexCache = readJsonFile<AliasIndex>(ALIASES_INDEX_PATH, {});
  }
  return aliasIndexCache;
}

export function loadRelationshipIndex(): RelationshipIndex {
  if (!relationshipIndexCache) {
    relationshipIndexCache = readJsonFile<RelationshipIndex>(RELATIONSHIPS_INDEX_PATH, {});
  }
  return relationshipIndexCache;
}

export function clearResolverCaches(): void {
  knowledgeIndexCache = null;
  aliasIndexCache = null;
  relationshipIndexCache = null;
}
