import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import type { EvidenceEntry } from "./evaluator.js";

export type GateVerdict = "pass" | "fail";

export interface CheckReport {
  check_id: string;
  status: GateVerdict;
  failure_code: string | null;
  evidence: EvidenceEntry[];
}

export interface GateReportV1 {
  run_id: string;
  gate_id: string;
  stage_id: string;
  status: GateVerdict;
  evaluated_at: string;
  engine: {
    name: string;
    version: string;
  };
  checks: CheckReport[];
  failure_codes: string[];
  evidence: EvidenceEntry[];
}

export function writeGateReport(outputPath: string, report: GateReportV1): void {
  writeCanonicalJson(outputPath, report);
}
