import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { writeRenderedDocs } from "../../core/templates/evidence.js";

export function cmdFillTemplates(runDir: string, templateLibraryPath?: string): void {
  const manifestPath = join(runDir, "run_manifest.json");
  if (!existsSync(manifestPath)) {
    console.error(`Run manifest not found at: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = readJson<{ run_id: string; created_at: string }>(manifestPath);
  const runId = manifest.run_id;
  const generatedAt = manifest.created_at;

  const baseDir = templateLibraryPath ?? ".";

  const selectionPath = join(runDir, "templates", "selection_result.json");
  if (!existsSync(selectionPath)) {
    console.error(`Selection result not found at: ${selectionPath}. Run S6_SELECT_TEMPLATES first.`);
    process.exit(1);
  }

  writeRenderedDocs(runDir, runId, generatedAt, baseDir);

  console.log(`Templates filled for run ${runId}`);
  console.log(`  Rendered docs: ${runDir}/templates/rendered_docs/`);
  console.log(`  Render report: ${runDir}/templates/render_report.json`);
  console.log(`  Completeness report: ${runDir}/templates/template_completeness_report.json`);
}
