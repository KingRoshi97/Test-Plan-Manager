import { NotImplementedError } from "../../utils/errors.js";
import type { ExtractedRef } from "./extractor.js";

export interface RefNode {
  id: string;
  type: string;
  outgoing: string[];
  incoming: string[];
}

export interface RefGraph {
  nodes: Map<string, RefNode>;
  edges: Array<{ from: string; to: string; label: string }>;
}

export interface CycleResult {
  has_cycles: boolean;
  cycles: string[][];
}

export function buildGraph(_refs: ExtractedRef[]): RefGraph {
  throw new NotImplementedError("buildGraph");
}

export function detectCycles(_graph: RefGraph): CycleResult {
  throw new NotImplementedError("detectCycles");
}

export function topologicalSort(_graph: RefGraph): string[] {
  throw new NotImplementedError("topologicalSort");
}
