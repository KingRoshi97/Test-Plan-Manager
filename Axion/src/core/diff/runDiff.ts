import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";

export interface DiffEntry {
  path: string;
  change_type: "added" | "removed" | "modified" | "unchanged";
  previous_hash?: string;
  current_hash?: string;
  classification?: string;
}

export interface DiffReport {
  previous_run_id: string;
  current_run_id: string;
  diffed_at: string;
  entries: DiffEntry[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

function hashFile(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

function collectFiles(dir: string, base?: string): Map<string, string> {
  const root = base ?? dir;
  const result = new Map<string, string>();

  if (!existsSync(dir)) {
    return result;
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = collectFiles(fullPath, root);
      for (const [k, v] of sub) {
        result.set(k, v);
      }
    } else if (entry.isFile()) {
      const relPath = relative(root, fullPath);
      result.set(relPath, hashFile(fullPath));
    }
  }

  return result;
}

function extractRunId(runDir: string): string {
  const manifestPath = join(runDir, "manifest.json");
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      if (manifest.run_id) return manifest.run_id;
    } catch {
    }
  }
  const parts = runDir.replace(/[/\\]+$/, "").split(/[/\\]/);
  return parts[parts.length - 1] || "unknown";
}

export function diffRuns(previousRunDir: string, currentRunDir: string): DiffReport {
  if (!existsSync(previousRunDir)) {
    throw new Error(`ERR-DIFF-001: Previous run directory does not exist: ${previousRunDir}`);
  }
  if (!existsSync(currentRunDir)) {
    throw new Error(`ERR-DIFF-001: Current run directory does not exist: ${currentRunDir}`);
  }

  const prevStat = statSync(previousRunDir);
  const currStat = statSync(currentRunDir);
  if (!prevStat.isDirectory()) {
    throw new Error(`ERR-DIFF-002: Previous run path is not a directory: ${previousRunDir}`);
  }
  if (!currStat.isDirectory()) {
    throw new Error(`ERR-DIFF-002: Current run path is not a directory: ${currentRunDir}`);
  }

  const previousFiles = collectFiles(previousRunDir);
  const currentFiles = collectFiles(currentRunDir);

  const allPaths = new Set([...previousFiles.keys(), ...currentFiles.keys()]);
  const entries: DiffEntry[] = [];

  for (const path of [...allPaths].sort()) {
    const prevHash = previousFiles.get(path);
    const currHash = currentFiles.get(path);

    if (prevHash && !currHash) {
      entries.push({
        path,
        change_type: "removed",
        previous_hash: prevHash,
      });
    } else if (!prevHash && currHash) {
      entries.push({
        path,
        change_type: "added",
        current_hash: currHash,
      });
    } else if (prevHash && currHash && prevHash !== currHash) {
      entries.push({
        path,
        change_type: "modified",
        previous_hash: prevHash,
        current_hash: currHash,
      });
    } else {
      entries.push({
        path,
        change_type: "unchanged",
        previous_hash: prevHash,
        current_hash: currHash,
      });
    }
  }

  const summary = {
    added: entries.filter(e => e.change_type === "added").length,
    removed: entries.filter(e => e.change_type === "removed").length,
    modified: entries.filter(e => e.change_type === "modified").length,
    unchanged: entries.filter(e => e.change_type === "unchanged").length,
  };

  return {
    previous_run_id: extractRunId(previousRunDir),
    current_run_id: extractRunId(currentRunDir),
    diffed_at: new Date().toISOString(),
    entries,
    summary,
  };
}
