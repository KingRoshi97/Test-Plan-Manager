import { NotImplementedError } from "../../utils/errors.js";
import type { UnknownEntity } from "./specBuilder.js";

export interface UnknownDetectionResult {
  unknowns: UnknownEntity[];
  unknown_index: Record<string, UnknownEntity>;
  stats: {
    total: number;
    blocking: number;
    high_impact: number;
  };
}

export function extractUnknowns(_normalizedInput: unknown, _spec: unknown): UnknownDetectionResult {
  throw new NotImplementedError("extractUnknowns");
}

export function mergeUnknowns(_existing: UnknownEntity[], _newUnknowns: UnknownEntity[]): UnknownEntity[] {
  throw new NotImplementedError("mergeUnknowns");
}
