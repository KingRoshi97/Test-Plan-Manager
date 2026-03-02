import { NotImplementedError } from "../../utils/errors.js";
import type { DiffEntry } from "./runDiff.js";

export type ChangeClassification =
  | "structural"
  | "content"
  | "metadata"
  | "formatting"
  | "unknown";

export function classifyChanges(_entries: DiffEntry[]): DiffEntry[] {
  throw new NotImplementedError("classifyChanges");
}

export function classifySingleChange(_entry: DiffEntry): ChangeClassification {
  throw new NotImplementedError("classifySingleChange");
}
