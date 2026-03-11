import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTENT_ITEMS_DIR } from "./paths.js";
import { resolveKid } from "./resolveKid.js";
import type { KnowledgeFrontmatter, KnowledgeItem } from "./types.js";

export function loadItem(input: string): KnowledgeItem | null {
  const resolved = resolveKid(input);
  if (!resolved) return null;

  const fullPath = path.isAbsolute(resolved.current_path)
    ? resolved.current_path
    : path.resolve(resolved.current_path);

  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);

  return {
    kid: resolved.kid,
    path: fullPath,
    body: parsed.content,
    frontmatter: parsed.data as KnowledgeFrontmatter,
  };
}

export function loadItemByKid(kid: string): KnowledgeItem | null {
  const filePath = path.join(CONTENT_ITEMS_DIR, `${kid}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  return {
    kid,
    path: filePath,
    body: parsed.content,
    frontmatter: parsed.data as KnowledgeFrontmatter,
  };
}
