import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isoNow } from "../../utils/time.js";
import type { ScanPack, ScanPattern } from "./packs.js";

export interface ScanFinding {
  finding_id: string;
  pattern_id: string;
  pack_id: string;
  file_path: string;
  line?: number;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  snippet?: string;
}

export interface ScanResult {
  scanned_at: string;
  files_scanned: number;
  findings: ScanFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  passed: boolean;
}

let findingCounter = 0;

function nextFindingId(): string {
  findingCounter++;
  return `FIND-${String(findingCounter).padStart(4, "0")}`;
}

const DOC_EXTENSIONS = new Set(["md", "txt", "html", "xml"]);
const DOC_ONLY_PATTERNS = new Set(["SEC-005", "SEC-006", "SEC-007"]);

function isDocFile(filePath: string): boolean {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  return DOC_EXTENSIONS.has(ext);
}

function matchPattern(pattern: ScanPattern, content: string, filePath: string, packId: string): ScanFinding[] {
  if (DOC_ONLY_PATTERNS.has(pattern.pattern_id) && isDocFile(filePath)) {
    return [];
  }
  const findings: ScanFinding[] = [];
  if (pattern.type === "regex" || pattern.type === "keyword") {
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      try {
        const re = pattern.type === "keyword"
          ? new RegExp(pattern.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
          : new RegExp(pattern.value, "gi");
        const matches = line.match(re);
        if (matches) {
          for (const _m of matches) {
            const snippet = line.length > 120 ? line.slice(0, 120) + "..." : line;
            findings.push({
              finding_id: nextFindingId(),
              pattern_id: pattern.pattern_id,
              pack_id: packId,
              file_path: filePath,
              line: i + 1,
              severity: pattern.severity,
              description: pattern.description,
              snippet: snippet.trim(),
            });
          }
        }
      } catch {
        continue;
      }
    }
  }
  return findings;
}

export function scanArtifact(filePath: string, packs: ScanPack[]): ScanFinding[] {
  if (!existsSync(filePath)) return [];

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return [];
  }

  const findings: ScanFinding[] = [];
  for (const pack of packs) {
    for (const pattern of pack.patterns) {
      findings.push(...matchPattern(pattern, content, filePath, pack.pack_id));
    }
  }
  return findings;
}

function collectFiles(dirPath: string, baseDir: string): string[] {
  const files: string[] = [];
  if (!existsSync(dirPath)) return files;

  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...collectFiles(fullPath, baseDir));
      } else if (stat.isFile()) {
        const ext = entry.split(".").pop()?.toLowerCase() ?? "";
        const scannable = ["json", "jsonl", "md", "txt", "yaml", "yml", "ts", "js", "html", "css", "xml", "csv", "env", "cfg", "ini", "toml"];
        if (scannable.includes(ext) || entry.startsWith(".env")) {
          files.push(fullPath);
        }
      }
    } catch {
      continue;
    }
  }
  return files;
}

export function scanDirectory(dirPath: string, packs: ScanPack[]): ScanResult {
  findingCounter = 0;
  const files = collectFiles(dirPath, dirPath);
  const allFindings: ScanFinding[] = [];

  for (const file of files) {
    const relPath = relative(dirPath, file);
    const findings = scanArtifact(file, packs);
    for (const f of findings) {
      f.file_path = relPath;
      allFindings.push(f);
    }
  }

  const summary = {
    critical: allFindings.filter((f) => f.severity === "critical").length,
    high: allFindings.filter((f) => f.severity === "high").length,
    medium: allFindings.filter((f) => f.severity === "medium").length,
    low: allFindings.filter((f) => f.severity === "low").length,
    total: allFindings.length,
  };

  const hasCriticalOrHigh = summary.critical > 0 || summary.high > 0;

  return {
    scanned_at: isoNow(),
    files_scanned: files.length,
    findings: allFindings,
    summary,
    passed: !hasCriticalOrHigh,
  };
}
