import type { GateAST } from "./dsl.js";
import { NotImplementedError } from "../../utils/errors.js";

export interface GateRegistryEntry {
  gate_id: string;
  version: string;
  applies_when: Record<string, unknown>;
  required_evidence: string[];
}

export function loadGateRegistry(_registryPath: string): GateRegistryEntry[] {
  throw new NotImplementedError("loadGateRegistry");
}

export function resolveGatesForRun(_entries: GateRegistryEntry[], _context: Record<string, unknown>): GateAST[] {
  throw new NotImplementedError("resolveGatesForRun");
}
