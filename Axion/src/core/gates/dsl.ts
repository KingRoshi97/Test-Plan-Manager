import { NotImplementedError } from "../../utils/errors.js";

export type GateOperator = "AND" | "OR" | "NOT" | "REQUIRES" | "THRESHOLD";

export interface GateCondition {
  operator: GateOperator;
  operands: (GateCondition | string)[];
  threshold?: number;
}

export interface GateAST {
  gate_id: string;
  version: string;
  description: string;
  condition: GateCondition;
}

export function parseGate(_raw: unknown): GateAST {
  throw new NotImplementedError("parseGate");
}

export function evalGate(_ast: GateAST, _evidence: Record<string, unknown>): boolean {
  throw new NotImplementedError("evalGate");
}
