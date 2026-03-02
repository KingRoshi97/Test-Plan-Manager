import { NotImplementedError } from "../../utils/errors.js";

export interface DiffEntry {
  path: string;
  change_type: "added" | "removed" | "modified" | "unchanged";
  previous_hash?: string;
  current_hash?: string;
  classification?: string;
}

export interface DiffReport {
  previous_run_id: string;
  current_run_id: string;
  diffed_at: string;
  entries: DiffEntry[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

export function diffRuns(_previousRunDir: string, _currentRunDir: string): DiffReport {
  throw new NotImplementedError("diffRuns");
}
