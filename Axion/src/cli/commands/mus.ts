import * as fs from "fs";
import * as path from "path";
import { validateRegistries, executeRun, loadMusPolicy, getRegistryVersions } from "../../core/mus/engine.js";
import { MusStore } from "../../core/mus/store.js";
import { initLedger, appendLedger } from "../../core/mus/ledger.js";
import type { MusRun, MusBudgets, MusScope } from "../../core/mus/types.js";

function resolveMusRoot(args: string[]): string {
  const rootIdx = args.indexOf("--root");
  if (rootIdx !== -1 && args[rootIdx + 1]) return path.resolve(args[rootIdx + 1]);
  if (fs.existsSync("./axion_mus_creation")) return path.resolve("./axion_mus_creation");
  if (fs.existsSync("./Axion/libraries/maintenance")) return path.resolve("./Axion/libraries/maintenance");
  if (fs.existsSync("./libraries/maintenance")) return path.resolve("./libraries/maintenance");
  console.error("ERROR: Could not find MUS root. Use --root <path> or place bootstrap at ./axion_mus_creation/");
  process.exit(1);
}

function resolveDataRoot(root: string): string {
  const dataRoot = path.join(path.dirname(root), "mus_data");
  if (!fs.existsSync(dataRoot)) fs.mkdirSync(dataRoot, { recursive: true });
  return dataRoot;
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
}

export async function runMusCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (!subcommand || subcommand === "help") {
    printHelp();
    return;
  }

  if (subcommand === "validate") {
    await cmdValidate(args.slice(1));
  } else if (subcommand === "run") {
    await cmdRun(args.slice(1));
  } else if (subcommand === "apply") {
    cmdApplyStub();
  } else if (subcommand === "publish") {
    cmdPublishStub();
  } else {
    console.error(`Unknown MUS subcommand: ${subcommand}`);
    printHelp();
    process.exit(1);
  }
}

async function cmdValidate(args: string[]): Promise<void> {
  const root = resolveMusRoot(args);
  const dataRoot = resolveDataRoot(root);
  initLedger(dataRoot);

  console.log(`\n  MUS VALIDATE`);
  console.log(`  Root: ${root}`);
  console.log(`  ${"─".repeat(50)}`);

  const result = validateRegistries(root);

  console.log(`\n  Registries checked: ${result.registries_checked}`);
  console.log(`  Items checked:      ${result.items_checked}`);
  console.log(`  Errors:             ${result.errors.length}`);
  console.log();

  if (result.pass) {
    console.log(`  ✓ PASS — All registries and policies validated successfully.`);
  } else {
    console.log(`  ✗ FAIL — ${result.errors.length} validation error(s) found:\n`);
    for (const err of result.errors) {
      console.log(`    [${err.file}] ${err.json_pointer}`);
      console.log(`      ${err.message}\n`);
    }
  }

  process.exit(result.pass ? 0 : 1);
}

async function cmdRun(args: string[]): Promise<void> {
  const root = resolveMusRoot(args);
  const dataRoot = resolveDataRoot(root);
  initLedger(dataRoot);
  const store = new MusStore(dataRoot);

  const modeId = getArg(args, "--mode");
  const trigger = (getArg(args, "--trigger") ?? "manual") as "manual" | "scheduled";
  const scopeArg = getArg(args, "--scope") ?? "all";

  if (!modeId) {
    console.error("ERROR: --mode is required (e.g., --mode MM-01)");
    process.exit(1);
  }

  if (!["MM-01", "MM-04"].includes(modeId)) {
    console.error(`ERROR: Mode "${modeId}" is not implemented in v1. Supported: MM-01, MM-04`);
    process.exit(1);
  }

  if (trigger === "scheduled") {
    console.log("  WARNING: Scheduled runs are proposal-only. Publish is disabled.");
  }

  const policy = loadMusPolicy(root);
  const defaultBudgets = (policy as any)?.budgets_default ?? {};
  const modesReg = JSON.parse(fs.readFileSync(path.join(root, "registries", "REG-MAINTENANCE-MODES.json"), "utf-8"));
  const modeItem = modesReg.items.find((m: any) => m.mode_id === modeId);
  const modeBudgets = modeItem?.default_budgets ?? {};

  const budgets: MusBudgets = {
    token_cap: modeBudgets.token_cap ?? defaultBudgets.token_cap ?? 15000,
    time_cap_ms: modeBudgets.time_cap_ms ?? defaultBudgets.time_cap_ms ?? 60000,
    max_findings: modeBudgets.max_findings ?? 500,
    max_proposals: modeBudgets.max_proposals ?? 25,
    max_assets_touched: modeBudgets.max_assets_touched ?? 50,
  };

  const scope: MusScope = scopeArg === "all"
    ? { asset_classes: modeItem?.allowed_scopes?.asset_classes ?? ["registries"] }
    : { asset_classes: scopeArg.split(",") };

  const run: MusRun = {
    run_id: store.generateRunId(),
    mode_id: modeId,
    trigger,
    scope,
    budgets,
    status: "created",
    created_at: new Date().toISOString(),
  };

  console.log(`\n  MUS RUN`);
  console.log(`  Root:    ${root}`);
  console.log(`  Mode:    ${modeId} (${modeItem?.name ?? "unknown"})`);
  console.log(`  Trigger: ${trigger}`);
  console.log(`  Run ID:  ${run.run_id}`);
  console.log(`  ${"─".repeat(50)}`);

  store.saveRun(run);

  const result = executeRun(root, store, run);

  console.log(`\n  Status:     ${result.run.status}`);
  console.log(`  Findings:   ${result.findings.length}`);
  console.log(`  Proposals:  ${result.proposals.length}`);

  if (result.run.limit_reasons && result.run.limit_reasons.length > 0) {
    console.log(`\n  Budget limits reached:`);
    for (const reason of result.run.limit_reasons) {
      console.log(`    - ${reason}`);
    }
  }

  if (result.findings.length > 0) {
    console.log(`\n  Findings:`);
    const bySeverity: Record<string, number> = {};
    for (const f of result.findings) {
      bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
    }
    for (const [sev, count] of Object.entries(bySeverity)) {
      console.log(`    ${sev}: ${count}`);
    }
    console.log();
    for (const f of result.findings.slice(0, 20)) {
      const sevIcon = f.severity === "critical" || f.severity === "high" ? "✗" : f.severity === "medium" ? "!" : "·";
      console.log(`    ${sevIcon} [${f.severity.toUpperCase()}] ${f.title}`);
      console.log(`      ${f.file_path} ${f.json_pointer}`);
    }
    if (result.findings.length > 20) {
      console.log(`    ... and ${result.findings.length - 20} more`);
    }
  }

  if (result.proposals.length > 0) {
    console.log(`\n  Proposal Packs:`);
    for (const pp of result.proposals) {
      console.log(`    ${pp.proposal_pack_id}: ${pp.patches.length} patch(es), risk=${pp.risk_class}, confidence=${pp.confidence_score}`);
      console.log(`      ${pp.explain_why.slice(0, 120)}`);
    }
  }

  const runDir = path.join(dataRoot, "runs", run.run_id);
  console.log(`\n  Output: ${runDir}/`);
  const outputFiles = fs.existsSync(runDir) ? fs.readdirSync(runDir) : [];
  for (const f of outputFiles) {
    console.log(`    - ${f}`);
  }
  console.log();
}

function cmdApplyStub(): void {
  console.log("\n  MUS APPLY");
  console.log("  Status: Apply Approval gate required.");
  console.log("  This command requires an Apply Approval (approval_type='apply') for the target changeset.");
  console.log("  ERROR: Not implemented yet. Apply execution is gated and disabled in v1.");
  console.log();
  appendLedger("apply_blocked", { reason: "Not implemented in v1" });
  process.exit(1);
}

function cmdPublishStub(): void {
  console.log("\n  MUS PUBLISH");
  console.log("  Status: Publish Approval gate required + scheduled publish hard block.");
  console.log("  This command requires a Publish Approval and cannot run from scheduled triggers.");
  console.log("  ERROR: Not implemented yet. Publish execution is gated and disabled in v1.");
  console.log();
  appendLedger("publish_blocked", { reason: "Not implemented in v1" });
  process.exit(1);
}

function printHelp(): void {
  console.log(`
  Axion MUS — Maintenance & Updating System CLI

  USAGE:
    axion mus validate [--root <path>]
    axion mus run --mode <MM-XX> [--trigger manual] [--scope all] [--root <path>]
    axion mus apply    (gated, not implemented in v1)
    axion mus publish  (gated, not implemented in v1)

  COMMANDS:
    validate   Validate all registries and policies under the MUS root
    run        Execute a maintenance mode (MM-01 Health Check, MM-04 Drift Detection)
    apply      Apply a changeset (requires Apply Approval — disabled in v1)
    publish    Publish a release (requires Publish Approval — disabled in v1)

  OPTIONS:
    --root <path>     Path to MUS bootstrap folder (default: ./axion_mus_creation/ or ./Axion/libraries/maintenance/)
    --mode <MM-XX>    Maintenance mode to run (MM-01 or MM-04 in v1)
    --trigger <type>  manual (default) or scheduled
    --scope <scope>   Comma-separated asset classes or "all"

  EXAMPLES:
    axion mus validate --root ./Axion/libraries/maintenance
    axion mus run --root ./Axion/libraries/maintenance --mode MM-01 --trigger manual --scope all
    axion mus run --root ./Axion/libraries/maintenance --mode MM-04 --trigger manual --scope all

  SAFETY:
    - Scheduled runs are proposal-only; publish is always blocked
    - Automation actors cannot apply or publish
    - Apply/publish commands are gated and disabled in v1
`);
}
