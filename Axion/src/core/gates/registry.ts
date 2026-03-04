import { readJson } from "../../utils/fs.js";

export const KNOWN_OPERATORS = new Set([
  "file_exists",
  "json_valid",
  "json_has",
  "coverage_gte",
  "json_eq",
  "verify_hash_manifest",
]);

export interface GateCheck {
  op: string;
  path?: string;
  pointer?: string;
  min?: number;
  expected?: unknown;
  manifest_path?: string;
  bundle_root?: string;
}

export interface GateDefinition {
  gate_id: string;
  stage_id: string;
  severity: string;
  checks: GateCheck[];
  required_proof_types?: string[];
  non_overridable?: boolean;
}

export interface GateRegistryFile {
  version: string;
  gates: GateDefinition[];
}

export class UnknownOperatorError extends Error {
  constructor(gateId: string, op: string) {
    super(`Gate ${gateId}: unknown predicate operator "${op}". Known operators: ${[...KNOWN_OPERATORS].join(", ")}`);
    this.name = "UnknownOperatorError";
  }
}

export class NonOverridableGateError extends Error {
  constructor(gateId: string) {
    super(`Gate ${gateId} is non-overridable and cannot be skipped`);
    this.name = "NonOverridableGateError";
  }
}

export function validateGateOperators(gate: GateDefinition): void {
  for (const check of gate.checks) {
    if (!KNOWN_OPERATORS.has(check.op)) {
      throw new UnknownOperatorError(gate.gate_id, check.op);
    }
  }
}

export function loadGateRegistry(registryPath: string): GateDefinition[] {
  const registry = readJson<GateRegistryFile>(registryPath);
  for (const gate of registry.gates) {
    validateGateOperators(gate);
  }
  return registry.gates;
}

export function filterGatesByStage(gates: GateDefinition[], stageId: string): GateDefinition[] {
  return gates.filter((g) => g.stage_id === stageId);
}

export function isNonOverridable(gate: GateDefinition): boolean {
  return gate.non_overridable === true;
}

function templateString(value: string, runId: string): string {
  return value.replace(/\{\{run_id\}\}/g, runId);
}

function templateValue(value: unknown, runId: string): unknown {
  if (typeof value === "string") {
    return templateString(value, runId);
  }
  if (Array.isArray(value)) {
    return value.map((v) => templateValue(v, runId));
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = templateValue(v, runId);
    }
    return result;
  }
  return value;
}

export function templateGatePaths(gate: GateDefinition, runId: string): GateDefinition {
  return templateValue(gate, runId) as GateDefinition;
}
