import { NotImplementedError } from "../../utils/errors.js";

export interface CoverageRule {
  rule_id: string;
  category: string;
  description: string;
  required_proof_types: string[];
  minimum_coverage: number;
  applies_to: string[];
}

export function loadRules(_rulesPath: string): CoverageRule[] {
  throw new NotImplementedError("loadRules");
}

export function validateRules(_rules: CoverageRule[]): boolean {
  throw new NotImplementedError("validateRules");
}
