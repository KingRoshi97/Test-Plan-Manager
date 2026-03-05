import { join, dirname } from "node:path";
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { ensureDir, readJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { writeCanonicalJson, canonicalJsonString } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";

export interface KitBuildResult {
  fileCount: number;
  contentHash: string;
}

const APP_SLOTS = [
  { num: "01", name: "requirements", label: "Requirements & Scope" },
  { num: "02", name: "architecture", label: "Architecture & Design" },
  { num: "03", name: "data_models", label: "Data Models & Schemas" },
  { num: "04", name: "api_contracts", label: "API Contracts & Interfaces" },
  { num: "05", name: "auth_security", label: "Auth & Security" },
  { num: "06", name: "frontend", label: "Frontend & UI" },
  { num: "07", name: "backend", label: "Backend & Services" },
  { num: "08", name: "devops", label: "DevOps & Deployment" },
  { num: "09", name: "testing", label: "Testing & QA" },
  { num: "10", name: "integrations", label: "Integrations" },
  { num: "11", name: "documentation", label: "Documentation" },
  { num: "12", name: "analytics", label: "Analytics & Monitoring" },
];

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function safeReadJson<T>(filePath: string): T | null {
  const content = safeRead(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function writeFile(destPath: string, content: string): void {
  ensureDir(dirname(destPath));
  writeFileSync(destPath, content, "utf-8");
}

function buildStartHereMd(runId: string, specId: string, projectName: string): string {
  return `# 00 — START HERE

## Purpose & How to Use
This kit contains all artifacts produced by the Axion pipeline for run \`${runId}\`.
It is the authoritative source for the project specification, standards, work breakdown, and acceptance criteria.

## Authoritative Artifacts
- \`01_core_artifacts/03_canonical_spec.json\` — canonical specification
- \`01_core_artifacts/01_normalized_input_record.json\` — normalized intake
- \`01_core_artifacts/02_resolved_standards_snapshot.json\` — resolved standards
- \`01_core_artifacts/04_work_breakdown.json\` — work breakdown
- \`01_core_artifacts/05_acceptance_map.json\` — acceptance map
- \`01_core_artifacts/06_state_snapshot.json\` — current state

## Reading Order
1. Read \`00_KIT_MANIFEST.md\` for file listing and structure
2. Read \`00_VERSIONS.md\` for version information
3. Read \`01_core_artifacts/03_canonical_spec.json\` for project specification
4. Read \`01_core_artifacts/04_work_breakdown.json\` for work units
5. Read \`01_core_artifacts/05_acceptance_map.json\` for acceptance criteria
6. Browse \`10_app/\` for rendered documents by domain

## Execution Loop
1. Load \`01_core_artifacts/06_state_snapshot.json\` to find \`current_unit_id\`
2. Open the relevant work unit in \`01_core_artifacts/04_work_breakdown.json\`
3. Check acceptance criteria in \`01_core_artifacts/05_acceptance_map.json\`
4. Execute the work unit
5. Record proof in \`00_PROOF_LOG.md\`
6. Update \`01_core_artifacts/06_state_snapshot.json\`
7. Advance to next unit

## How to Verify
- Consult \`01_core_artifacts/05_acceptance_map.json\` for acceptance criteria
- All \`hard_gate\` items require \`proof_required: true\`
- Record proof references in \`00_PROOF_LOG.md\`

## How to Record Progress
Update \`01_core_artifacts/06_state_snapshot.json\` after completing each unit.

## What Not To Do
- Do not modify core artifact files directly
- Do not skip hard gate acceptance items
- Do not deploy without all gate checks passing

## When Blocked
Record a blocker in \`01_core_artifacts/06_state_snapshot.json\` under \`blockers[]\`.

## Completion Definition
All work units have status \`done\`, all hard_gate acceptance items have status \`pass\`, and proof is recorded for each.

## Pointers
- Run ID: \`${runId}\`
- Spec ID: \`${specId}\`
- Project: \`${projectName}\`
`;
}

function buildKitManifestMd(
  runId: string,
  specId: string,
  projectName: string,
  kitId: string,
  workBreakdownId: string,
  acceptanceMapId: string,
  stateId: string,
  versions: Record<string, unknown>
): string {
  const manifestData = {
    manifest_version: "1.0.0",
    kit_id: kitId,
    run_id: runId,
    spec_id: specId,
    work_breakdown_id: workBreakdownId,
    acceptance_map_id: acceptanceMapId,
    state_id: stateId,
    reading_order: [
      "00_START_HERE.md",
      "00_KIT_MANIFEST.md",
      "00_KIT_INDEX.md",
      "00_VERSIONS.md",
      "00_RUN_RULES.md",
      "01_core_artifacts/01_normalized_input_record.json",
      "01_core_artifacts/02_resolved_standards_snapshot.json",
      "01_core_artifacts/03_canonical_spec.json",
      "01_core_artifacts/04_work_breakdown.json",
      "01_core_artifacts/05_acceptance_map.json",
      "01_core_artifacts/06_state_snapshot.json",
      "10_app/",
    ],
    core_artifacts: {
      normalized_input: "01_core_artifacts/01_normalized_input_record.json",
      standards_snapshot: "01_core_artifacts/02_resolved_standards_snapshot.json",
      canonical_spec: "01_core_artifacts/03_canonical_spec.json",
      work_breakdown: "01_core_artifacts/04_work_breakdown.json",
      acceptance_map: "01_core_artifacts/05_acceptance_map.json",
      state_snapshot: "01_core_artifacts/06_state_snapshot.json",
    },
    packs: {
      app: "10_app/",
    },
    proof: {
      proof_log: "00_PROOF_LOG.md",
    },
    run_rules: "00_RUN_RULES.md",
    versions,
  };

  return `# 00 — Kit Manifest

**Kit ID**: \`${kitId}\`
**Run ID**: \`${runId}\`
**Spec ID**: \`${specId}\`
**Project**: \`${projectName}\`

\`\`\`json
${JSON.stringify(manifestData, null, 2)}
\`\`\`
`;
}

function buildKitIndexMd(runId: string, projectName: string): string {
  const slotLines = APP_SLOTS.map(
    (s) => `| \`10_app/${s.num}_${s.name}/\` | ${s.label} |`
  ).join("\n");

  return `# 00 — Kit Index

**Run ID**: \`${runId}\`
**Project**: \`${projectName}\`

## Core Artifacts

| File | Description |
|------|-------------|
| \`01_core_artifacts/01_normalized_input_record.json\` | Normalized intake submission |
| \`01_core_artifacts/02_resolved_standards_snapshot.json\` | Resolved standards |
| \`01_core_artifacts/03_canonical_spec.json\` | Canonical specification |
| \`01_core_artifacts/04_work_breakdown.json\` | Work breakdown |
| \`01_core_artifacts/05_acceptance_map.json\` | Acceptance map |
| \`01_core_artifacts/06_state_snapshot.json\` | State snapshot |

## App Pack Slots

| Slot | Domain |
|------|--------|
${slotLines}
`;
}

function buildVersionsMd(versions: Record<string, unknown>): string {
  const versionsData = {
    "V-01_system_version": versions.system_version ?? "1.0.0",
    "V-02_intake": {
      form_version: versions.intake_form_version ?? "1.0.0",
      schema_version: versions.intake_schema_version ?? "1.0.0",
      int_ruleset: versions.intake_ruleset_version ?? "1.0.0",
    },
    "V-03_standards": {
      library_version: versions.standards_library_version ?? "1.0.0",
      resolver_version: versions.resolver_version ?? "1.0.0",
      packs_version: versions.packs_version ?? "1.0.0",
    },
    "V-04_templates": {
      library_version: versions.template_library_version ?? "1.0.0",
      index_version: versions.template_index_version ?? "1.0.0",
      fill_rules_version: versions.fill_rules_version ?? "1.0.0",
      templates_used: versions.templates_used ?? 0,
    },
    "V-05_canonical_model": versions.canonical_model_version ?? "1.0.0",
    "V-06_planning_verification": versions.planning_version ?? "1.0.0",
    "V-07_kit_contracts": versions.kit_contracts_version ?? "1.0.0",
  };

  return `# 00 — Versions

\`\`\`json
${JSON.stringify(versionsData, null, 2)}
\`\`\`
`;
}

function buildRunRulesMd(): string {
  return `# 00 — Run Rules

## Rules

1. **No claims without proof** — Do not mark a work unit as done without recording proof in \`00_PROOF_LOG.md\`
2. **Update state snapshot** — After completing each unit, update \`01_core_artifacts/06_state_snapshot.json\`
3. **Follow work breakdown order** — Execute units in the order defined in \`01_core_artifacts/04_work_breakdown.json\`
4. **Hard gates are blocking** — All acceptance items with \`gating: "hard_gate"\` must pass before moving forward
5. **No modification of core artifacts** — Do not edit files in \`01_core_artifacts/\` directly
6. **Gate checks before deployment** — All gate reports must show \`pass\` before any deployment step
`;
}

function buildProofLogMd(runId: string): string {
  return `# 00 — Proof Log

**Run ID**: \`${runId}\`

| Unit ID | Acceptance ID | Proof Type | Proof Reference | Recorded At | Status |
|---------|--------------|------------|-----------------|-------------|--------|
| (no entries yet) | | | | | |
`;
}

function buildPackMetaMd(runId: string, projectName: string): string {
  return `# App Pack — Metadata

**Run ID**: \`${runId}\`
**Project**: \`${projectName}\`

This pack contains rendered documents organized by domain slot.
`;
}

function buildPackIndexMd(slotContents: Record<string, string[]>): string {
  const rows = APP_SLOTS.map((s) => {
    const key = `${s.num}_${s.name}`;
    const files = slotContents[key] ?? [];
    const fileList = files.length > 0 ? files.join(", ") : "00_NA.md";
    return `| \`${key}/\` | ${s.label} | ${fileList} |`;
  }).join("\n");

  return `# App Pack — Index

| Slot | Domain | Files |
|------|--------|-------|
${rows}
`;
}

function buildGateChecklistMd(runId: string): string {
  return `# App Pack — Gate Checklist

**Run ID**: \`${runId}\`

| Gate | Target | Status |
|------|--------|--------|
| G1_INTAKE_VALIDITY | intake/validation_result.json | (check run) |
| G2_CANONICAL_INTEGRITY | canonical/canonical_spec.json | (check run) |
| G3_STANDARDS_RESOLVED | standards/resolved_standards_snapshot.json | (check run) |
| G4_TEMPLATE_SELECTION | templates/selection_result.json | (check run) |
| G5_TEMPLATE_COMPLETENESS | templates/template_completeness_report.json | (check run) |
| G6_PLAN_COVERAGE | planning/coverage_report.json | (check run) |
| G7_VERIFICATION | verification/verification_run_result.json | (check run) |
| G8_PACKAGE_INTEGRITY | kit/kit_manifest.json | (check run) |
`;
}

function buildNaMd(slot: string, reason: string): string {
  return `# Not Applicable

**Slot**: \`${slot}\`
**Reason**: ${reason}
`;
}

function slotForOutputPath(outputPath: string): string | null {
  const lower = outputPath.toLowerCase();
  if (lower.includes("requirements") || lower.includes("prd") || lower.includes("scope")) return "01_requirements";
  if (lower.includes("architecture") || lower.includes("design") || lower.includes("system")) return "02_architecture";
  if (lower.includes("data") || lower.includes("model") || lower.includes("schema") || lower.includes("erd")) return "03_data_models";
  if (lower.includes("api") || lower.includes("contract") || lower.includes("interface")) return "04_api_contracts";
  if (lower.includes("auth") || lower.includes("security") || lower.includes("rbac") || lower.includes("permission")) return "05_auth_security";
  if (lower.includes("frontend") || lower.includes("ui") || lower.includes("ux") || lower.includes("component")) return "06_frontend";
  if (lower.includes("backend") || lower.includes("service") || lower.includes("server") || lower.includes("api")) return "07_backend";
  if (lower.includes("devops") || lower.includes("deploy") || lower.includes("infra") || lower.includes("ci")) return "08_devops";
  if (lower.includes("test") || lower.includes("qa") || lower.includes("quality")) return "09_testing";
  if (lower.includes("integration") || lower.includes("webhook") || lower.includes("connector")) return "10_integrations";
  if (lower.includes("doc") || lower.includes("readme") || lower.includes("guide") || lower.includes("reference")) return "11_documentation";
  if (lower.includes("analytics") || lower.includes("monitoring") || lower.includes("metric") || lower.includes("log")) return "12_analytics";
  return null;
}

export function buildRealKit(
  runDir: string,
  runId: string,
  generatedAt: string,
  baseDir: string,
): KitBuildResult {
  const kitRoot = join(runDir, "kit");
  const agentKitDir = join(kitRoot, "bundle", "agent_kit");
  ensureDir(agentKitDir);

  let specId = "SPEC-UNKNOWN";
  let projectName = "Axion Generated Project";
  let submissionId = "unknown";
  let workBreakdownId = `WBD-${runId}`;
  let acceptanceMapId = `ACCMAP-${runId}`;
  let stateId = `STATE-${runId}`;

  const canonicalSpecData = safeReadJson<Record<string, unknown>>(join(runDir, "canonical", "canonical_spec.json"));
  if (canonicalSpecData) {
    const meta = canonicalSpecData.meta as Record<string, unknown> | undefined;
    if (meta?.spec_id) specId = meta.spec_id as string;
    if (meta?.submission_id) submissionId = meta.submission_id as string;
    const routing = canonicalSpecData.routing as Record<string, unknown> | undefined;
    if (routing) {
      const proj = (canonicalSpecData as Record<string, unknown>).project as Record<string, unknown> | undefined;
      if (proj?.project_name) projectName = proj.project_name as string;
    }
  }

  const workBreakdownData = safeReadJson<Record<string, unknown>>(join(runDir, "planning", "work_breakdown.json"));
  if (workBreakdownData?.work_breakdown_id) workBreakdownId = workBreakdownData.work_breakdown_id as string;

  const acceptanceMapData = safeReadJson<Record<string, unknown>>(join(runDir, "planning", "acceptance_map.json"));
  if (acceptanceMapData?.acceptance_map_id) acceptanceMapId = acceptanceMapData.acceptance_map_id as string;

  const stateData = safeReadJson<Record<string, unknown>>(join(runDir, "state", "state_snapshot.json"));
  if (stateData) {
    const meta = stateData.meta as Record<string, unknown> | undefined;
    if (meta?.state_id) stateId = meta.state_id as string;
  }

  const stdSnapshot = safeReadJson<Record<string, unknown>>(join(runDir, "standards", "resolved_standards_snapshot.json"));
  const selectionResult = safeReadJson<Record<string, unknown>>(join(runDir, "templates", "selection_result.json"));

  const versions: Record<string, unknown> = {
    system_version: "1.0.0",
    intake_form_version: "1.0.0",
    intake_schema_version: "1.0.0",
    intake_ruleset_version: "1.0.0",
    standards_library_version: (stdSnapshot?.standards_library_version_used as string) ?? "1.0.0",
    resolver_version: (stdSnapshot?.resolver_version as string) ?? "1.0.0",
    packs_version: "1.0.0",
    template_library_version: (selectionResult?.template_library_version as string) ?? "1.0.0",
    template_index_version: (selectionResult?.template_index_version as string) ?? "1.0.0",
    fill_rules_version: "1.0.0",
    templates_used: Array.isArray(selectionResult?.selected) ? (selectionResult!.selected as unknown[]).length : 0,
    canonical_model_version: "1.0.0",
    planning_version: "1.0.0",
    kit_contracts_version: "1.0.0",
  };

  const kitId = `KIT-${runId}`;

  writeFile(join(agentKitDir, "00_START_HERE.md"), buildStartHereMd(runId, specId, projectName));
  writeFile(
    join(agentKitDir, "00_KIT_MANIFEST.md"),
    buildKitManifestMd(runId, specId, projectName, kitId, workBreakdownId, acceptanceMapId, stateId, versions)
  );
  writeFile(join(agentKitDir, "00_KIT_INDEX.md"), buildKitIndexMd(runId, projectName));
  writeFile(join(agentKitDir, "00_VERSIONS.md"), buildVersionsMd(versions));
  writeFile(join(agentKitDir, "00_RUN_RULES.md"), buildRunRulesMd());
  writeFile(join(agentKitDir, "00_PROOF_LOG.md"), buildProofLogMd(runId));

  const coreDir = join(agentKitDir, "01_core_artifacts");
  ensureDir(coreDir);

  const normalizedContent = safeRead(join(runDir, "intake", "normalized_input.json"));
  if (normalizedContent) {
    writeFileSync(join(coreDir, "01_normalized_input_record.json"), normalizedContent, "utf-8");
  } else {
    writeCanonicalJson(join(coreDir, "01_normalized_input_record.json"), { note: "not available" });
  }

  const stdSnapshotContent = safeRead(join(runDir, "standards", "resolved_standards_snapshot.json"));
  if (stdSnapshotContent) {
    writeFileSync(join(coreDir, "02_resolved_standards_snapshot.json"), stdSnapshotContent, "utf-8");
  } else {
    writeCanonicalJson(join(coreDir, "02_resolved_standards_snapshot.json"), { note: "not available" });
  }

  const canonicalContent = safeRead(join(runDir, "canonical", "canonical_spec.json"));
  if (canonicalContent) {
    writeFileSync(join(coreDir, "03_canonical_spec.json"), canonicalContent, "utf-8");
  } else {
    writeCanonicalJson(join(coreDir, "03_canonical_spec.json"), { note: "not available" });
  }

  const workBreakdownContent = safeRead(join(runDir, "planning", "work_breakdown.json"));
  if (workBreakdownContent) {
    writeFileSync(join(coreDir, "04_work_breakdown.json"), workBreakdownContent, "utf-8");
  } else {
    writeCanonicalJson(join(coreDir, "04_work_breakdown.json"), { note: "not available" });
  }

  const acceptanceMapContent = safeRead(join(runDir, "planning", "acceptance_map.json"));
  if (acceptanceMapContent) {
    writeFileSync(join(coreDir, "05_acceptance_map.json"), acceptanceMapContent, "utf-8");
  } else {
    writeCanonicalJson(join(coreDir, "05_acceptance_map.json"), { note: "not available" });
  }

  const stateContent = safeRead(join(runDir, "state", "state_snapshot.json"));
  if (stateContent) {
    writeFileSync(join(coreDir, "06_state_snapshot.json"), stateContent, "utf-8");
  } else {
    writeCanonicalJson(join(coreDir, "06_state_snapshot.json"), { note: "not available" });
  }

  const appDir = join(agentKitDir, "10_app");
  ensureDir(appDir);

  writeFile(join(appDir, "00_pack_meta.md"), buildPackMetaMd(runId, projectName));
  writeFile(join(appDir, "00_gate_checklist.md"), buildGateChecklistMd(runId));

  const slotContents: Record<string, string[]> = {};
  for (const slot of APP_SLOTS) {
    slotContents[`${slot.num}_${slot.name}`] = [];
  }

  const renderedDocsDir = join(runDir, "templates", "rendered_docs");
  if (existsSync(renderedDocsDir)) {
    const selectionData = safeReadJson<{ selected: Array<{ template_id: string; output_path: string }> }>(
      join(runDir, "templates", "selection_result.json")
    );

    for (const file of readdirSync(renderedDocsDir)) {
      if (!file.endsWith(".md")) continue;
      const templateId = file.replace(".md", "");
      const content = safeRead(join(renderedDocsDir, file));
      if (!content) continue;

      const templateEntry = selectionData?.selected?.find((t) => t.template_id === templateId);
      const outputPath = templateEntry?.output_path ?? file;

      const targetSlot = slotForOutputPath(outputPath) ?? slotForOutputPath(templateId);

      if (targetSlot) {
        const slotDir = join(appDir, targetSlot);
        ensureDir(slotDir);
        writeFileSync(join(slotDir, file), content, "utf-8");
        const slotKey = targetSlot.substring(3);
        for (const slot of APP_SLOTS) {
          if (`${slot.num}_${slot.name}` === targetSlot) {
            slotContents[targetSlot].push(file);
            break;
          }
        }
      } else {
        const slotDir = join(appDir, "11_documentation");
        ensureDir(slotDir);
        writeFileSync(join(slotDir, file), content, "utf-8");
        slotContents["11_documentation"].push(file);
      }
    }
  }

  for (const slot of APP_SLOTS) {
    const slotKey = `${slot.num}_${slot.name}`;
    const slotDir = join(appDir, slotKey);
    ensureDir(slotDir);
    if (slotContents[slotKey].length === 0) {
      writeFile(join(slotDir, "00_NA.md"), buildNaMd(slotKey, "No templates selected for this domain slot"));
    }
  }

  writeFile(join(appDir, "00_pack_index.md"), buildPackIndexMd(slotContents));

  const allFiles: Array<{ path: string; hash: string; bytes: number }> = [];

  function collectKitFiles(dir: string, base: string): void {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const rel = join(base, name);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        collectKitFiles(full, rel);
      } else {
        const content = readFileSync(full, "utf-8");
        allFiles.push({ path: rel, hash: sha256(content), bytes: stat.size });
      }
    }
  }

  collectKitFiles(agentKitDir, "agent_kit");

  const now = isoNow();

  const kitManifest = {
    kit_id: kitId,
    version: "1.0.0",
    run_id: runId,
    spec_id: specId,
    created_at: now,
    files: allFiles.map((f) => ({ path: f.path, hash: f.hash, bytes: f.bytes })),
  };

  writeCanonicalJson(join(kitRoot, "kit_manifest.json"), kitManifest);
  writeCanonicalJson(join(kitRoot, "entrypoint.json"), {
    version: "1.0.0",
    run_id: runId,
    spec_id: specId,
    kit_root: "kit/bundle/agent_kit",
    start_here: "kit/bundle/agent_kit/00_START_HERE.md",
  });

  writeCanonicalJson(join(kitRoot, "version_stamp.json"), {
    kit_id: kitId,
    run_id: runId,
    versions,
    generated_at: now,
  });

  const contentHash = sha256(canonicalJsonString(allFiles.map((f) => ({ path: f.path, sha256: f.hash }))));

  writeCanonicalJson(join(kitRoot, "packaging_manifest.json"), {
    algorithm: "sha256",
    files: allFiles.map((f) => ({ path: f.path, sha256: f.hash })),
    generated_at: now,
    root: "kit/bundle/agent_kit",
    run_id: runId,
  });

  return {
    fileCount: allFiles.length,
    contentHash,
  };
}
