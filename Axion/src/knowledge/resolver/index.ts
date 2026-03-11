import { loadCollectionsForItem } from "./loadCollections.js";
import { loadItem } from "./loadItem.js";
import { loadRelationships } from "./loadRelationships.js";
import { resolveKid } from "./resolveKid.js";
import { searchItems } from "./searchItems.js";

export function resolveKnowledge(input: string) {
  const resolved = resolveKid(input);
  if (!resolved) return null;
  const item = loadItem(resolved.kid);
  if (!item) return null;

  const relationships = loadRelationships(resolved.kid);
  const collections = loadCollectionsForItem(item);

  return {
    resolved,
    item,
    relationships,
    collections,
  };
}

export {
  resolveKid,
  loadItem,
  loadRelationships,
  loadCollectionsForItem,
  searchItems,
};

export { clearResolverCaches } from "./registry.js";
export { inferFiltersFromLegacyPath } from "./legacyFallback.js";
export { loadItemByKid } from "./loadItem.js";

export type {
  KnowledgeFrontmatter,
  KnowledgeItem,
  AliasIndex,
  RelationshipEntry,
  RelationshipIndex,
  KnowledgeIndexEntry,
  KnowledgeIndex,
  CollectionDescriptor,
  ResolveSource,
  ResolveResult,
  SearchFilters,
  SearchResult,
} from "./types.js";
