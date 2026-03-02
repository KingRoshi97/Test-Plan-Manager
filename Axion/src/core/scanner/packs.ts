import { NotImplementedError } from "../../utils/errors.js";

export interface ScanPack {
  pack_id: string;
  name: string;
  version: string;
  patterns: ScanPattern[];
}

export interface ScanPattern {
  pattern_id: string;
  type: "regex" | "entropy" | "keyword";
  value: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

export function loadScanPacks(_packsPath: string): ScanPack[] {
  throw new NotImplementedError("loadScanPacks");
}

export function getDefaultPacks(): ScanPack[] {
  throw new NotImplementedError("getDefaultPacks");
}
