import { NotImplementedError } from "../../utils/errors.js";

export interface CoverageScore {
  total_items: number;
  covered_items: number;
  coverage_percent: number;
  by_category: Record<string, { total: number; covered: number; percent: number }>;
  uncovered: Array<{ item_id: string; category: string; reason: string }>;
}

export function computeCoverage(_spec: unknown, _proofLedger: unknown, _acceptanceMap: unknown): CoverageScore {
  throw new NotImplementedError("computeCoverage");
}

export function meetsCoverageThreshold(_score: CoverageScore, _threshold: number): boolean {
  throw new NotImplementedError("meetsCoverageThreshold");
}
