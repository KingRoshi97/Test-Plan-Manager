import type { BuildOutputMode, BuildRequest } from "../../core/build/types.js";
import { runBuild } from "../../core/build/runner.js";

const VALID_MODES: BuildOutputMode[] = ["kit_only", "build_repo", "build_and_export"];

export async function cmdBuild(runId: string, mode: string): Promise<void> {
  if (!runId) {
    console.error("Error: --run is required");
    process.exit(1);
  }

  if (!VALID_MODES.includes(mode as BuildOutputMode)) {
    console.error(`Error: --mode must be one of: ${VALID_MODES.join(", ")}`);
    process.exit(1);
  }

  const outputMode = mode as BuildOutputMode;

  if (outputMode === "kit_only") {
    console.log("Mode 'kit_only' does not trigger a build. Kit is already available in the run directory.");
    process.exit(0);
  }

  const request: BuildRequest = {
    runId,
    outputMode,
    requestedAt: new Date().toISOString(),
  };

  console.log(`[build] Starting build for ${runId} (mode=${outputMode})`);

  const result = await runBuild(request);

  if (result.success) {
    console.log(`[build] Build completed successfully: ${result.buildId}`);
    console.log(`  State: ${result.state}`);
    console.log(`  Files generated: ${result.filesGenerated}`);
    console.log(`  Verification: ${result.verificationPassed ? "PASSED" : "FAILED"}`);
    if (result.exported && result.zipPath) {
      console.log(`  Export zip: ${result.zipPath}`);
    }
    process.exit(0);
  } else {
    console.error(`[build] Build failed: ${result.buildId}`);
    console.error(`  State: ${result.state}`);
    for (const err of result.errors) {
      console.error(`  Error: ${err}`);
    }
    process.exit(1);
  }
}
