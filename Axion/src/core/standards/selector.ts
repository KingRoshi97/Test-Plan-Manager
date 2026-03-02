import { NotImplementedError } from "../../utils/errors.js";
import type { ResolverContext, SelectedPack } from "./resolver.js";

export interface PackIndex {
  standards_library_version: string;
  packs: PackIndexEntry[];
}

export interface PackIndexEntry {
  pack_id: string;
  pack_version: string;
  category: string;
  applies_when: Record<string, unknown>;
  priority: number;
  rule_count: number;
}

export function loadPackIndex(_indexPath: string): PackIndex {
  throw new NotImplementedError("loadPackIndex");
}

export function matchPacks(_index: PackIndex, _context: ResolverContext): SelectedPack[] {
  throw new NotImplementedError("matchPacks");
}

export function computeSpecificityScore(_appliesWhen: Record<string, unknown>): number {
  throw new NotImplementedError("computeSpecificityScore");
}
