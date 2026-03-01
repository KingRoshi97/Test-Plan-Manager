import { NotImplementedError } from "../../utils/errors.js";

export interface VerificationPolicy {
  policy_id: string;
  version: string;
  rules: VerificationRule[];
}

export interface VerificationRule {
  rule_id: string;
  description: string;
  required_proof_types: string[];
  gate_ids: string[];
}

export function loadVerificationPolicy(_policyPath: string): VerificationPolicy {
  throw new NotImplementedError("loadVerificationPolicy");
}

export function resolveApplicableRules(
  _policy: VerificationPolicy,
  _context: Record<string, unknown>,
): VerificationRule[] {
  throw new NotImplementedError("resolveApplicableRules");
}
