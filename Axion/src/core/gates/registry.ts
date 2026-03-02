import { readJson } from "../../utils/fs.js";

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
}

export interface GateRegistryFile {
  version: string;
  gates: GateDefinition[];
}

export function loadGateRegistry(registryPath: string): GateDefinition[] {
  const registry = readJson<GateRegistryFile>(registryPath);
  return registry.gates;
}

export function filterGatesByStage(gates: GateDefinition[], stageId: string): GateDefinition[] {
  return gates.filter((g) => g.stage_id === stageId);
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
