import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
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

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg",
  ".woff", ".woff2", ".ttf", ".eot",
  ".zip", ".tar", ".gz", ".bz2", ".7z",
  ".exe", ".dll", ".so", ".dylib",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SNIPPET_CONTEXT = 40;

function generateFindingId(filePath: string, patternId: string, line: number): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${filePath}:${patternId}:${line}`)
    .digest("hex")
    .slice(0, 12);
  return `FIND-${hash}`;
}

function maskSnippet(match: string): string {
  if (match.length <= 8) return "***";
  return match.slice(0, 4) + "***" + match.slice(-4);
}

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

function scanLine(
  line: string,
  lineNumber: number,
  filePath: string,
  pattern: ScanPattern,
  packId: string,
): ScanFinding | null {
  if (pattern.type !== "regex" && pattern.type !== "keyword") {
    return null;
  }

  let matched = false;
  if (pattern.type === "regex") {
    try {
      const re = new RegExp(pattern.value, "i");
      matched = re.test(line);
    } catch {
      return null;
    }
  } else if (pattern.type === "keyword") {
    matched = line.toLowerCase().includes(pattern.value.toLowerCase());
  }

  if (!matched) return null;

  const re = new RegExp(pattern.value, "i");
  const m = re.exec(line);
  let snippet: string | undefined;
  if (m) {
    const start = Math.max(0, m.index - SNIPPET_CONTEXT);
    const end = Math.min(line.length, m.index + m[0].length + SNIPPET_CONTEXT);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < line.length ? "..." : "";
    const masked = maskSnippet(m[0]);
    const before = line.slice(start, m.index);
    const after = line.slice(m.index + m[0].length, end);
    snippet = `${prefix}${before}${masked}${after}${suffix}`;
  }

  return {
    finding_id: generateFindingId(filePath, pattern.pattern_id, lineNumber),
    pattern_id: pattern.pattern_id,
    pack_id: packId,
    file_path: filePath,
    line: lineNumber,
    severity: pattern.severity,
    description: pattern.description,
    snippet,
  };
}

export function scanArtifact(filePath: string, packs: ScanPack[]): ScanFinding[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`ERR-SCAN-003: File not found: ${filePath}`);
  }

  if (isBinaryFile(filePath)) {
    return [];
  }

  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_SIZE) {
    return [];
  }

  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `ERR-SCAN-003: Failed to read file for scanning: ${(err as Error).message}`,
    );
  }

  const lines = content.split("\n");
  const findings: ScanFinding[] = [];

  for (const pack of packs) {
    for (const pattern of pack.patterns) {
      for (let i = 0; i < lines.length; i++) {
        const finding = scanLine(lines[i], i + 1, filePath, pattern, pack.pack_id);
        if (finding) {
          findings.push(finding);
        }
      }
    }
  }

  return findings;
}

function collectFiles(dirPath: string): string[] {
  const results: string[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".quarantine") {
        continue;
      }
      results.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

export function scanDirectory(dirPath: string, packs: ScanPack[]): ScanResult {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`ERR-SCAN-003: Directory not found: ${dirPath}`);
  }

  const files = collectFiles(dirPath);
  const allFindings: ScanFinding[] = [];

  for (const file of files) {
    const findings = scanArtifact(file, packs);
    allFindings.push(...findings);
  }

  const summary = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: allFindings.length,
  };

  for (const finding of allFindings) {
    summary[finding.severity]++;
  }

  return {
    scanned_at: new Date().toISOString(),
    files_scanned: files.length,
    findings: allFindings,
    summary,
    passed: summary.critical === 0 && summary.high === 0,
  };
}
