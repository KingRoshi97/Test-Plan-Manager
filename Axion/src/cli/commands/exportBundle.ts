import { NotImplementedError } from "../../utils/errors.js";

export type BundleProfile = "thin" | "full" | "audit" | "public" | "internal" | "repro";

export function cmdExportBundle(_runDir: string, _profile?: BundleProfile, _outputPath?: string): void {
  throw new NotImplementedError("cmdExportBundle");
}
