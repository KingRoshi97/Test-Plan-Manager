import { join } from "node:path";
import { existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { buildRealKit } from "../../core/kit/build.js";

export function cmdGenerateKit(inputPath: string, outputDir?: string): void {
  const baseDir = join(process.cwd(), "Axion");

  const runDir = inputPath;
  if (!existsSync(runDir)) {
    console.error(`Run directory not found: ${runDir}`);
    process.exit(1);
  }

  const manifestPath = join(runDir, "run_manifest.json");
  let runId = "unknown";
  if (existsSync(manifestPath)) {
    try {
      const manifest = readJson<Record<string, unknown>>(manifestPath);
      runId = (manifest.run_id as string) ?? runId;
    } catch { /* use default */ }
  }

  const generatedAt = isoNow();
  const result = buildRealKit(runDir, runId, generatedAt, baseDir);

  console.log(`Kit generated: ${result.fileCount} files, hash=${result.contentHash.slice(0, 12)}`);
  if (outputDir) {
    console.log(`Output directory: ${outputDir}`);
  }
}
