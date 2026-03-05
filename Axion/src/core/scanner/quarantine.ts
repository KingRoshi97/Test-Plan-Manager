import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import type { ScanFinding } from "./scan.js";

export interface QuarantineEntry {
  quarantine_id: string;
  finding_id: string;
  original_path: string;
  quarantine_path: string;
  quarantined_at: string;
  reason: string;
  severity: string;
}

export interface QuarantineResult {
  quarantined: QuarantineEntry[];
  blocked_from_kit: string[];
}

const QUARANTINE_DIR = ".quarantine";
const QUARANTINE_LEDGER = "quarantine_ledger.json";

function generateQuarantineId(findingId: string, filePath: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${findingId}:${filePath}:${Date.now()}`)
    .digest("hex")
    .slice(0, 12);
  return `QRN-${hash}`;
}

function ensureQuarantineDir(runDir: string): string {
  const qDir = path.join(runDir, QUARANTINE_DIR);
  if (!fs.existsSync(qDir)) {
    fs.mkdirSync(qDir, { recursive: true });
  }
  return qDir;
}

function loadLedger(runDir: string): QuarantineEntry[] {
  const ledgerPath = path.join(runDir, QUARANTINE_DIR, QUARANTINE_LEDGER);
  if (!fs.existsSync(ledgerPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(ledgerPath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLedger(runDir: string, entries: QuarantineEntry[]): void {
  const qDir = ensureQuarantineDir(runDir);
  const ledgerPath = path.join(qDir, QUARANTINE_LEDGER);
  fs.writeFileSync(ledgerPath, JSON.stringify(entries, null, 2), "utf-8");
}

export function quarantine(findings: ScanFinding[], runDir: string): QuarantineResult {
  if (!fs.existsSync(runDir)) {
    throw new Error(`ERR-SCAN-004: Run directory not found: ${runDir}`);
  }

  const quarantineableFindings = findings.filter(
    (f) => f.severity === "critical" || f.severity === "high",
  );

  if (quarantineableFindings.length === 0) {
    return { quarantined: [], blocked_from_kit: [] };
  }

  const qDir = ensureQuarantineDir(runDir);
  const existingLedger = loadLedger(runDir);
  const newEntries: QuarantineEntry[] = [];
  const blockedFiles = new Set<string>();
  const alreadyQuarantined = new Set(existingLedger.map((e) => e.finding_id));

  for (const finding of quarantineableFindings) {
    if (alreadyQuarantined.has(finding.finding_id)) {
      blockedFiles.add(finding.file_path);
      continue;
    }

    const qId = generateQuarantineId(finding.finding_id, finding.file_path);
    const ext = path.extname(finding.file_path);
    const quarantinePath = path.join(qDir, `${qId}${ext}`);

    if (fs.existsSync(finding.file_path)) {
      try {
        fs.copyFileSync(finding.file_path, quarantinePath);
      } catch {
        // skip
      }
    }

    const entry: QuarantineEntry = {
      quarantine_id: qId,
      finding_id: finding.finding_id,
      original_path: finding.file_path,
      quarantine_path: quarantinePath,
      quarantined_at: new Date().toISOString(),
      reason: `${finding.description} (${finding.pattern_id})`,
      severity: finding.severity,
    };

    newEntries.push(entry);
    blockedFiles.add(finding.file_path);
  }

  const fullLedger = [...existingLedger, ...newEntries];
  saveLedger(runDir, fullLedger);

  return {
    quarantined: newEntries,
    blocked_from_kit: Array.from(blockedFiles),
  };
}

export function isQuarantined(filePath: string, runDir: string): boolean {
  const ledger = loadLedger(runDir);
  const resolvedPath = path.resolve(filePath);
  return ledger.some(
    (entry) => path.resolve(entry.original_path) === resolvedPath,
  );
}

export function getQuarantineLedger(runDir: string): QuarantineEntry[] {
  return loadLedger(runDir);
}
