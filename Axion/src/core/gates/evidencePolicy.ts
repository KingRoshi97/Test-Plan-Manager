import { readJson } from "../../utils/fs.js";
import { join } from "node:path";
import { existsSync } from "node:fs";

export interface ProofTypeEntry {
  proof_type: string;
  version: string;
  required_fields: string[];
  description: string;
}

export interface ProofTypeRegistry {
  $schema: string;
  description: string;
  entries: ProofTypeEntry[];
}

export interface EvidenceRequirement {
  gate_id: string;
  required_proof_types: string[];
}

export interface EvidenceCompletenessResult {
  gate_id: string;
  required_proof_types: string[];
  satisfied: string[];
  missing: string[];
  complete: boolean;
}

const GATE_EVIDENCE_MAP: Record<string, string[]> = {
  G1_INTAKE_VALIDITY: ["intake_validation"],
  G2_CANONICAL_INTEGRITY: ["canonical_validation"],
  G3_STANDARDS_RESOLVED: ["standards_resolution"],
  G4_TEMPLATE_SELECTION: ["template_selection"],
  G5_TEMPLATE_COMPLETENESS: ["template_completeness"],
  G6_PLAN_COVERAGE: ["plan_coverage"],
  G7_VERIFICATION: ["verification_result", "proof_ledger"],
  G8_PACKAGE_INTEGRITY: ["package_integrity"],
};

export function loadProofTypeRegistry(baseDir: string): ProofTypeRegistry {
  const registryPath = join(baseDir, "registries", "PROOF_TYPE_REGISTRY.json");
  if (!existsSync(registryPath)) {
    return { $schema: "proof_type_registry/v1", description: "empty", entries: [] };
  }
  return readJson<ProofTypeRegistry>(registryPath);
}

export function getRequiredProofTypes(gateId: string): string[] {
  return GATE_EVIDENCE_MAP[gateId] ?? [];
}

export function evaluateEvidenceCompleteness(
  gateId: string,
  availableProofTypes: string[]
): EvidenceCompletenessResult {
  const required = getRequiredProofTypes(gateId);
  const satisfied = required.filter((pt) => availableProofTypes.includes(pt));
  const missing = required.filter((pt) => !availableProofTypes.includes(pt));

  return {
    gate_id: gateId,
    required_proof_types: required,
    satisfied,
    missing,
    complete: missing.length === 0,
  };
}
