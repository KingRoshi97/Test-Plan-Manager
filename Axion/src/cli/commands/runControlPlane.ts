import { join } from "node:path";
import { writeJson, ensureDir } from "../../utils/fs.js";
import { isoNow, compactTimestamp } from "../../utils/time.js";
import { shortHash } from "../../utils/hash.js";
import type { RunManifest } from "../../types/run.js";

export function cmdRunControlPlane(baseDir: string = "."): string {
  const ts = compactTimestamp();
  const runId = `run_${ts}_${shortHash(ts, 6)}`;
  const runDir = join(baseDir, ".axion", "runs", runId);

  ensureDir(runDir);
  ensureDir(join(runDir, "standards"));
  ensureDir(join(runDir, "canonical"));
  ensureDir(join(runDir, "planning"));
  ensureDir(join(runDir, "gates"));
  ensureDir(join(runDir, "proof"));
  ensureDir(join(runDir, "verification"));
  ensureDir(join(runDir, "kit"));
  ensureDir(join(runDir, "state"));
  ensureDir(join(runDir, "state", "handoff_packet"));

  const manifest: RunManifest = {
    run_id: runId,
    status: "created",
    created_at: isoNow(),
    updated_at: isoNow(),
    stages: [],
    config: {},
  };

  writeJson(join(runDir, "run_manifest.json"), manifest);

  writeJson(join(runDir, "standards", "resolved_standards_snapshot.json"), {
    run_id: runId,
    resolved_at: isoNow(),
    standards: [],
  });

  writeJson(join(runDir, "canonical", "canonical_spec.json"), {
    run_id: runId,
    created_at: isoNow(),
    spec: {},
  });

  console.log(`Created run: ${runId}`);
  console.log(`  Run directory: ${runDir}`);
  return runId;
}
