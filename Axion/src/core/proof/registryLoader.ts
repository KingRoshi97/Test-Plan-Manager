import { join } from "node:path";
import { readJson } from "../../utils/fs.js";

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

export interface EvidencePolicy {
  gate_id: string;
  required_proof_types: string[];
}

const DEFAULT_GATE_PROOF_MAP: Record<string, string[]> = {
  G1_INTAKE_VALIDITY: ["automated_check"],
  G2_CANONICAL_INTEGRITY: ["automated_check"],
  G3_STANDARDS_RESOLVED: ["automated_check"],
  G4_TEMPLATE_SELECTION: ["automated_check"],
  G5_TEMPLATE_COMPLETENESS: ["automated_check"],
  G6_PLAN_COVERAGE: ["automated_check"],
  G7_VERIFICATION: ["automated_check"],
  G8_PACKAGE_INTEGRITY: ["automated_check"],
};

export function loadProofTypeRegistry(baseDir: string): ProofTypeRegistry {
  const registryPath = join(baseDir, "registries", "PROOF_TYPE_REGISTRY.json");
  return readJson<ProofTypeRegistry>(registryPath);
}

export function getEvidencePolicies(): EvidencePolicy[] {
  return Object.entries(DEFAULT_GATE_PROOF_MAP).map(([gate_id, required_proof_types]) => ({
    gate_id,
    required_proof_types,
  }));
}

export function getRequiredProofTypes(gateId: string): string[] {
  return DEFAULT_GATE_PROOF_MAP[gateId] ?? [];
}
