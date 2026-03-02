import { NotImplementedError } from "../../utils/errors.js";
import type { ReproSelection } from "./selector.js";

export interface ReproPackage {
  repro_id: string;
  run_id: string;
  created_at: string;
  output_path: string;
  artifacts_included: number;
  manifest: ReproSelection;
}

export function buildReproPackage(_runDir: string, _outputPath: string, _selection: ReproSelection): ReproPackage {
  throw new NotImplementedError("buildReproPackage");
}
