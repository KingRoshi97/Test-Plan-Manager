import { NotImplementedError } from "../../utils/errors.js";
import type { ScanPack } from "./packs.js";

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

export function scanArtifact(_filePath: string, _packs: ScanPack[]): ScanFinding[] {
  throw new NotImplementedError("scanArtifact");
}

export function scanDirectory(_dirPath: string, _packs: ScanPack[]): ScanResult {
  throw new NotImplementedError("scanDirectory");
}
