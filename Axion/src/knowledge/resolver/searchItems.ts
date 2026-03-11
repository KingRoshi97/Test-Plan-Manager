import { loadAliasIndex, loadKnowledgeIndex } from "./registry.js";
import type { KnowledgeIndexEntry, SearchFilters, SearchResult } from "./types.js";

function includesAll(haystack: string[] | undefined, needles: string[] | undefined): boolean {
  if (!needles || needles.length === 0) return true;
  if (!haystack) return false;
  return needles.every((needle) => haystack.includes(needle));
}

function scoreTextMatch(
  entry: KnowledgeIndexEntry,
  aliases: string[],
  text: string
): { score: number; fields: string[] } {
  const q = text.toLowerCase();
  let score = 0;
  const fields: string[] = [];

  if (entry.kid.toLowerCase().includes(q)) {
    score += 10;
    fields.push("kid");
  }
  if (entry.title.toLowerCase().includes(q)) {
    score += 8;
    fields.push("title");
  }
  if (entry.primary_domain.toLowerCase().includes(q)) {
    score += 6;
    fields.push("primary_domain");
  }
  if (entry.tags?.some((tag) => tag.toLowerCase().includes(q))) {
    score += 5;
    fields.push("tags");
  }
  if (entry.stack_family_refs.some((v) => v.toLowerCase().includes(q))) {
    score += 5;
    fields.push("stack_family_refs");
  }
  if (entry.industry_refs.some((v) => v.toLowerCase().includes(q))) {
    score += 5;
    fields.push("industry_refs");
  }
  if (entry.pillar_refs.some((v) => v.toLowerCase().includes(q))) {
    score += 4;
    fields.push("pillar_refs");
  }
  if (aliases.some((v) => v.toLowerCase().includes(q))) {
    score += 7;
    fields.push("aliases");
  }

  return { score, fields };
}

export function searchItems(filters: SearchFilters): SearchResult[] {
  const knowledgeIndex = loadKnowledgeIndex();
  const aliasIndex = loadAliasIndex();

  const results: SearchResult[] = [];

  for (const entry of knowledgeIndex) {
    if (filters.content_type && entry.content_type !== filters.content_type) continue;
    if (filters.primary_domain && entry.primary_domain !== filters.primary_domain) continue;
    if (filters.status && entry.status !== filters.status) continue;
    if (filters.authority_tier && entry.authority_tier !== filters.authority_tier) continue;
    if (!includesAll(entry.industry_refs, filters.industry_refs)) continue;
    if (!includesAll(entry.stack_family_refs, filters.stack_family_refs)) continue;
    if (!includesAll(entry.pillar_refs, filters.pillar_refs)) continue;
    if (!includesAll(entry.bundle_refs, filters.bundle_refs)) continue;
    if (!includesAll(entry.tags, filters.tags)) continue;

    const aliasesForKid = Object.entries(aliasIndex)
      .filter(([, kid]) => kid === entry.kid)
      .map(([alias]) => alias);

    let score = 1;
    let matched_fields: string[] = [];

    if (filters.text) {
      const scored = scoreTextMatch(entry, aliasesForKid, filters.text);
      if (scored.score === 0) continue;
      score += scored.score;
      matched_fields = scored.fields;
    }

    results.push({ item: entry, score, matched_fields });
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, filters.limit ?? 25);
}
