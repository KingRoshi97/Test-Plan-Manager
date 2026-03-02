import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export interface TreeEntry {
  path: string;
  type: "file" | "directory";
  size?: number;
}

export function buildTree(dir: string, base?: string): TreeEntry[] {
  const root = base ?? dir;
  const entries: TreeEntry[] = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    const rel = relative(root, full);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      entries.push({ path: rel, type: "directory" });
      entries.push(...buildTree(full, root));
    } else {
      entries.push({ path: rel, type: "file", size: stat.size });
    }
  }
  return entries;
}

export function diffTrees(expected: TreeEntry[], actual: TreeEntry[]): {
  missing: string[];
  extra: string[];
} {
  const expectedPaths = new Set(expected.map(e => e.path));
  const actualPaths = new Set(actual.map(e => e.path));
  return {
    missing: [...expectedPaths].filter(p => !actualPaths.has(p)),
    extra: [...actualPaths].filter(p => !expectedPaths.has(p)),
  };
}
