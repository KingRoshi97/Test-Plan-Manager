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

export function buildGraph(refs: ExtractedRef[]): RefGraph {
  const nodes = new Map<string, RefNode>();
  const edges: RefGraph["edges"] = [];

  function ensureNode(id: string, type: string): RefNode {
    let node = nodes.get(id);
    if (!node) {
      node = { id, type, outgoing: [], incoming: [] };
      nodes.set(id, node);
    }
    return node;
  }

  for (const ref of refs) {
    const sourceParts = ref.context.match(/from\s+([\w-]+)/);
    const sourceId = sourceParts ? sourceParts[1] : ref.source_path;

    const sourceType = detectType(sourceId);
    const sourceNode = ensureNode(sourceId, sourceType);
    const targetNode = ensureNode(ref.ref_id, ref.ref_type);

    if (!sourceNode.outgoing.includes(ref.ref_id)) {
      sourceNode.outgoing.push(ref.ref_id);
    }
    if (!targetNode.incoming.includes(sourceId)) {
      targetNode.incoming.push(sourceId);
    }

    edges.push({
      from: sourceId,
      to: ref.ref_id,
      label: ref.context,
    });
  }

  return { nodes, edges };
}

function detectType(id: string): string {
  if (id.startsWith("ROLE-")) return "ROLE";
  if (id.startsWith("FEAT-")) return "FEAT";
  if (id.startsWith("WF-")) return "WF";
  if (id.startsWith("PERM-")) return "PERM";
  if (id.startsWith("SCR-")) return "SCREEN";
  if (id.startsWith("DATA-")) return "DATA";
  if (id.startsWith("OP-")) return "OP";
  if (id.startsWith("INTG-")) return "INTG";
  if (id.startsWith("UNK-")) return "UNK";
  return "UNKNOWN";
}

export function detectCycles(graph: RefGraph): CycleResult {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];

  function dfs(nodeId: string): void {
    if (inStack.has(nodeId)) {
      const cycleStart = stack.indexOf(nodeId);
      if (cycleStart !== -1) {
        cycles.push([...stack.slice(cycleStart), nodeId]);
      }
      return;
    }
    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    inStack.add(nodeId);
    stack.push(nodeId);

    const node = graph.nodes.get(nodeId);
    if (node) {
      for (const target of node.outgoing) {
        dfs(target);
      }
    }

    stack.pop();
    inStack.delete(nodeId);
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  return { has_cycles: cycles.length > 0, cycles };
}

export function topologicalSort(graph: RefGraph): string[] {
  const inDegree = new Map<string, number>();
  for (const [id] of graph.nodes) {
    inDegree.set(id, 0);
  }
  for (const edge of graph.edges) {
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  queue.sort();

  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const node = graph.nodes.get(current);
    if (node) {
      const targets = [...node.outgoing].sort();
      for (const target of targets) {
        const newDegree = (inDegree.get(target) ?? 1) - 1;
        inDegree.set(target, newDegree);
        if (newDegree === 0) {
          queue.push(target);
          queue.sort();
        }
      }
    }
  }

  return result;
}
