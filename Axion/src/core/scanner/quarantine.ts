import { NotImplementedError } from "../../utils/errors.js";
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

export function quarantine(_findings: ScanFinding[], _runDir: string): QuarantineResult {
  throw new NotImplementedError("quarantine");
}

export function isQuarantined(_filePath: string, _runDir: string): boolean {
  throw new NotImplementedError("isQuarantined");
}
