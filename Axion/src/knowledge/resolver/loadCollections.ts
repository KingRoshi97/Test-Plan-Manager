import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { COLLECTIONS_DIR } from "./paths.js";
import type { CollectionDescriptor, KnowledgeItem } from "./types.js";

function loadAllCollections(): CollectionDescriptor[] {
  if (!fs.existsSync(COLLECTIONS_DIR)) return [];

  return fs
    .readdirSync(COLLECTIONS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(COLLECTIONS_DIR, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const parsed = matter(raw);
      return {
        ...(parsed.data as Omit<CollectionDescriptor, "body">),
        body: parsed.content,
      };
    });
}

export function loadCollectionsForItem(item: KnowledgeItem): CollectionDescriptor[] {
  const collections = loadAllCollections();
  const fm = item.frontmatter;

  return collections.filter((collection) => {
    const scope = collection.scope ?? {};

    const industryMatch =
      (scope.industry_refs ?? []).some((v) => fm.industry_refs.includes(v));

    const stackMatch =
      (scope.stack_family_refs ?? []).some((v) => fm.stack_family_refs.includes(v));

    const pillarMatch =
      (scope.pillar_refs ?? []).some((v) => fm.pillar_refs.includes(v));

    const domainMatch =
      scope.primary_domain != null && scope.primary_domain === fm.primary_domain;

    return industryMatch || stackMatch || pillarMatch || domainMatch;
  });
}
