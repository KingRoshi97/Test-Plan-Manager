import { NotImplementedError } from "../../utils/errors.js";

export interface ReproSelection {
  run_id: string;
  selected_artifacts: Array<{ path: string; reason: string }>;
  excluded_artifacts: Array<{ path: string; reason: string }>;
}

export function selectReproArtifacts(_runDir: string, _options?: { minimal?: boolean }): ReproSelection {
  throw new NotImplementedError("selectReproArtifacts");
}
