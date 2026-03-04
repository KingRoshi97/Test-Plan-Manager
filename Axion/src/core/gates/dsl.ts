export type GateOperator = "AND" | "OR" | "NOT" | "REQUIRES" | "THRESHOLD";

const VALID_OPERATORS = new Set<string>(["AND", "OR", "NOT", "REQUIRES", "THRESHOLD"]);

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

function isGateCondition(obj: unknown): obj is GateCondition {
  if (obj === null || typeof obj !== "object") return false;
  const rec = obj as Record<string, unknown>;
  return typeof rec.operator === "string" && Array.isArray(rec.operands);
}

function parseCondition(raw: unknown): GateCondition {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Gate condition must be an object");
  }
  const rec = raw as Record<string, unknown>;
  const operator = rec.operator;
  if (typeof operator !== "string" || !VALID_OPERATORS.has(operator)) {
    throw new Error(`Unknown gate DSL operator: "${operator}". Valid: ${[...VALID_OPERATORS].join(", ")}`);
  }
  if (!Array.isArray(rec.operands)) {
    throw new Error("Gate condition must have an operands array");
  }
  const operands: (GateCondition | string)[] = rec.operands.map((op: unknown) => {
    if (typeof op === "string") return op;
    if (typeof op === "object" && op !== null) return parseCondition(op);
    throw new Error(`Invalid operand type: ${typeof op}`);
  });

  const condition: GateCondition = { operator: operator as GateOperator, operands };
  if (operator === "THRESHOLD") {
    if (typeof rec.threshold !== "number") {
      throw new Error("THRESHOLD operator requires a numeric threshold field");
    }
    condition.threshold = rec.threshold;
  }
  return condition;
}

export function parseGate(raw: unknown): GateAST {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Gate definition must be an object");
  }
  const rec = raw as Record<string, unknown>;
  if (typeof rec.gate_id !== "string") {
    throw new Error("Gate definition must have a string gate_id");
  }
  if (typeof rec.version !== "string") {
    throw new Error("Gate definition must have a string version");
  }
  if (typeof rec.description !== "string") {
    throw new Error("Gate definition must have a string description");
  }
  if (!rec.condition) {
    throw new Error("Gate definition must have a condition");
  }
  return {
    gate_id: rec.gate_id,
    version: rec.version,
    description: rec.description,
    condition: parseCondition(rec.condition),
  };
}

function evalCondition(condition: GateCondition, evidence: Record<string, unknown>): boolean {
  switch (condition.operator) {
    case "AND":
      return condition.operands.every((op) => evalOperand(op, evidence));
    case "OR":
      return condition.operands.some((op) => evalOperand(op, evidence));
    case "NOT":
      if (condition.operands.length !== 1) {
        throw new Error("NOT operator requires exactly one operand");
      }
      return !evalOperand(condition.operands[0], evidence);
    case "REQUIRES":
      return condition.operands.every((op) => {
        if (typeof op === "string") {
          return op in evidence && evidence[op] !== undefined && evidence[op] !== null;
        }
        return evalOperand(op, evidence);
      });
    case "THRESHOLD": {
      const threshold = condition.threshold ?? 0;
      let count = 0;
      for (const op of condition.operands) {
        if (evalOperand(op, evidence)) count++;
      }
      return count >= threshold;
    }
    default:
      throw new Error(`Unknown gate DSL operator: "${condition.operator}"`);
  }
}

function evalOperand(operand: GateCondition | string, evidence: Record<string, unknown>): boolean {
  if (typeof operand === "string") {
    const val = evidence[operand];
    if (val === undefined || val === null) return false;
    if (typeof val === "boolean") return val;
    return true;
  }
  return evalCondition(operand, evidence);
}

export function evalGate(ast: GateAST, evidence: Record<string, unknown>): boolean {
  return evalCondition(ast.condition, evidence);
}
