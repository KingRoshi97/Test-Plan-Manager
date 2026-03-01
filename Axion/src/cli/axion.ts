import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { cmdInit } from "./commands/initAxion.js";
import { cmdRunControlPlane } from "./commands/runControlPlane.js";
import { cmdRunGates } from "./commands/runGates.js";
import { cmdPlanWork } from "./commands/planWork.js";
import { cmdPackageKit } from "./commands/packageKit.js";
import { cmdVerify } from "./commands/verify.js";
import { cmdWriteState } from "./commands/writeState.js";
import { cmdWriteProof } from "./commands/writeProof.js";

const USAGE = `
axion — Axion CLI (scaffold stub)

Usage:
  axion init                  Initialize .axion/ directory
  axion run                   Create a new run and generate full artifact spine
  axion help                  Show this help message

Commands:
  init      Creates .axion/runs/ directory structure
  run       Creates a run_id, then writes all placeholder artifacts
  help      Prints usage information
`;

function walk(base: string, current: string): string[] {
  const results: string[] = [];
  for (const name of readdirSync(current)) {
    const full = join(current, name);
    const rel = full.slice(base.length + 1);
    if (statSync(full).isDirectory()) {
      results.push(rel + "/");
      results.push(...walk(base, full));
    } else {
      results.push(rel);
    }
  }
  return results;
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const baseDir = ".";

  switch (command) {
    case "init": {
      cmdInit(baseDir);
      break;
    }

    case "run": {
      cmdInit(baseDir);

      console.log("\n[1/6] Creating run manifest...");
      const runId = cmdRunControlPlane(baseDir);
      const runDir = join(baseDir, ".axion", "runs", runId);

      console.log("\n[2/6] Generating planning artifacts...");
      cmdPlanWork(runId, runDir);

      console.log("\n[3/6] Running gates...");
      cmdRunGates(runId, runDir);

      console.log("\n[4/6] Writing proof ledger...");
      cmdWriteProof(runId, runDir);

      console.log("\n[5/6] Packaging kit...");
      cmdPackageKit(runId, runDir);

      console.log("\n[6/6] Writing state + verification...");
      cmdWriteState(runId, runDir);
      cmdVerify(runId, runDir);

      console.log(`\nDone. Full artifact spine written to: ${runDir}`);
      console.log("\nArtifact listing:");
      for (const entry of walk(runDir, runDir)) {
        console.log(`  ${entry}`);
      }
      break;
    }

    case "help":
    default: {
      console.log(USAGE);
      break;
    }
  }
}

main();
