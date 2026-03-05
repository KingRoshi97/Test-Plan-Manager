import { join } from "node:path";
import { existsSync } from "node:fs";
import { isoNow } from "../../utils/time.js";
import {
  writeSelectionResult,
  writeRenderedDocs,
} from "../../core/templates/evidence.js";
import { readJson } from "../../utils/fs.js";

export function cmdFillTemplates(runDir: string, templateLibraryPath?: string): void {
  const baseDir = templateLibraryPath ?? join(process.cwd(), "Axion");

  const specPath = join(runDir, "canonical", "canonical_spec.json");
  if (!existsSync(specPath)) {
    console.error(`canonical_spec.json not found in ${runDir}. Run build-spec stage first.`);
    process.exit(1);
  }

  let canonicalSpec: Record<string, unknown> | undefined;
  try {
    canonicalSpec = readJson<Record<string, unknown>>(specPath);
  } catch { /* optional */ }

  let standardsSnapshot: Record<string, unknown> | undefined;
  const snapshotPath = join(runDir, "standards", "resolved_standards_snapshot.json");
  if (existsSync(snapshotPath)) {
    try {
      standardsSnapshot = readJson<Record<string, unknown>>(snapshotPath);
    } catch { /* optional */ }
  }

  const runId = (canonicalSpec?.run_id as string) ?? "unknown";
  const generatedAt = isoNow();

  writeSelectionResult(runDir, runId, generatedAt, baseDir, canonicalSpec, standardsSnapshot);
  writeRenderedDocs(runDir, runId, generatedAt, baseDir);

  console.log(`Templates selected and rendered for ${runDir}`);
}
