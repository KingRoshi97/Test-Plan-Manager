import * as fs from "fs";
import * as path from "path";
import type { LedgerEntry } from "./types.js";

let ledgerPath: string | null = null;

export function initLedger(dataRoot: string): void {
  const logsDir = path.join(dataRoot, "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  ledgerPath = path.join(logsDir, "ledger.jsonl");
}

export function appendLedger(event: string, details: Record<string, unknown>, actor = "operator"): void {
  if (!ledgerPath) return;
  const entry: LedgerEntry = {
    timestamp: new Date().toISOString(),
    event,
    actor,
    details,
  };
  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + "\n", "utf-8");
}
