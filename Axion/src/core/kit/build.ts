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
  { num: "01", name: "requirements", label: "Requirements", trigger: "Product/requirements templates selected" },
  { num: "02", name: "design", label: "Design", trigger: "UI/UX or consumer-facing project detected" },
  { num: "03", name: "architecture", label: "Architecture", trigger: "System architecture templates selected" },
  { num: "04", name: "implementation", label: "Implementation", trigger: "Build/implementation templates selected" },
  { num: "05", name: "security", label: "Security", trigger: "Auth enabled or security templates selected" },
  { num: "06", name: "quality", label: "Quality", trigger: "Testing/QA templates selected" },
  { num: "07", name: "ops", label: "Operations", trigger: "Production build target or ops templates selected" },
  { num: "08", name: "data", label: "Data", trigger: "Data models or data governance templates selected" },
  { num: "09", name: "api_contracts", label: "API Contracts", trigger: "API or contract templates selected" },
  { num: "10", name: "release", label: "Release", trigger: "Release/deployment templates selected" },
  { num: "11", name: "governance", label: "Governance", trigger: "Compliance or governance templates selected" },
  { num: "12", name: "analytics", label: "Analytics", trigger: "Analytics or observability templates selected" },
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
    "V-01_system": {
      system_version: versions.system_version ?? "1.0.0",
    },
    "V-02_intake": {
      form_version_used: versions.intake_form_version ?? "1.0.0",
      schema_version_used: versions.intake_schema_version ?? "1.0.0",
      int_ruleset_version_used: versions.intake_ruleset_version ?? "1.0.0",
    },
    "V-03_standards": {
      standards_library_version_used: versions.standards_library_version ?? "1.0.0",
      standards_packs_used: versions.standards_packs_used ?? [],
      standards_resolver_version_used: versions.resolver_version ?? "1.0.0",
    },
    "V-04_templates": {
      template_library_version_used: versions.template_library_version ?? "1.0.0",
      templates_used: versions.templates_used ?? [],
      template_index_version_used: versions.template_index_version ?? "1.0.0",
      template_fill_rules_version_used: versions.fill_rules_version ?? "1.0.0",
    },
    "V-05_canonical_model": {
      canonical_spec_model_version: versions.canonical_spec_model_version ?? "1.0.0",
      id_rules_version_used: versions.id_rules_version ?? "1.0.0",
      unknowns_model_version_used: versions.unknowns_model_version ?? "1.0.0",
    },
    "V-06_planning_verification": {
      planning_rules_version_used: versions.planning_rules_version ?? "1.0.0",
      proof_rules_version_used: versions.proof_rules_version ?? "1.0.0",
    },
    "V-07_kit_contracts": {
      kit_folder_structure_version: versions.kit_folder_structure_version ?? "1.0.0",
      manifest_format_version: versions.manifest_format_version ?? "1.0.0",
      entrypoint_contract_version: versions.entrypoint_contract_version ?? "1.0.0",
    },
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

function buildPackMetaMd(
  runId: string,
  projectName: string,
  specId: string,
  selectedSlots: string[],
  versions: Record<string, unknown>
): string {
  const packId = `PACK-APP-${runId}`;
  const metaBlock = {
    pack_id: packId,
    pack_level: "APP",
    run_id: runId,
    spec_id: specId,
    scope_refs: [specId],
    required_slots: selectedSlots,
    total_slots: APP_SLOTS.length,
    status: "generated",
    generated_at: isoNow(),
    system_version: versions.system_version ?? "1.0.0",
    kit_contracts_version: versions.kit_contracts_version ?? "1.0.0",
  };

  return `# App Pack — Metadata

**Pack ID**: \`${packId}\`
**Pack Level**: APP
**Run ID**: \`${runId}\`
**Project**: ${projectName}
**Spec ID**: \`${specId}\`

\`\`\`json
${JSON.stringify(metaBlock, null, 2)}
\`\`\`

This pack contains rendered documents organized by the 12 locked KIT-01 slot folders.
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

function buildNaMd(slot: string, reason: string, trigger: string): string {
  return `# Not Applicable

**Slot**: \`${slot}\`
**Reason**: ${reason}
**What would have triggered this slot**: ${trigger}
`;
}

const SUBDIR_TO_SLOT: Record<string, string> = {
  // 01_requirements — Product Definition
  requirements: "01_requirements",
  domain: "01_requirements",
  workflows: "01_requirements",
  risk: "01_requirements",
  roadmap: "01_requirements",
  research: "01_requirements",
  content: "01_requirements",
  prd: "01_requirements",
  urd: "01_requirements",
  stk: "01_requirements",
  dmg: "01_requirements",
  rsc: "01_requirements",
  brp: "01_requirements",
  smip: "01_requirements",

  // 02_design — Experience Design
  design: "02_design",
  design_system: "02_design",
  assets: "02_design",
  accessibility: "02_design",
  responsive: "02_design",
  ia: "02_design",
  des: "02_design",
  ixd: "02_design",
  cdx: "02_design",
  dsys: "02_design",
  ian: "02_design",
  a11yd: "02_design",
  yd: "02_design",
  rlb: "02_design",
  vap: "02_design",

  // 03_architecture — System Architecture
  architecture: "03_architecture",
  topology: "03_architecture",
  arc: "03_architecture",
  sic: "03_architecture",
  sbdt: "03_architecture",
  wfo: "03_architecture",
  rtm: "03_architecture",
  err: "03_architecture",

  // 04_implementation — Build / Frontend / Backend / Mobile
  fe: "04_implementation",
  smd: "04_implementation",
  uicp: "04_implementation",
  cer: "04_implementation",
  form: "04_implementation",
  route: "04_implementation",
  errors: "04_implementation",
  caching: "04_implementation",
  realtime: "04_implementation",
  search: "04_implementation",
  jbs: "04_implementation",
  evt: "04_implementation",
  rlim: "04_implementation",
  ffcfg: "04_implementation",
  fpmp: "04_implementation",
  admin: "04_implementation",
  pbp: "04_implementation",
  mob: "04_implementation",
  mdc: "04_implementation",
  ofs: "04_implementation",
  mbat: "04_implementation",
  mdl: "04_implementation",
  mpush: "04_implementation",

  // 05_security — Auth & Security
  policy: "05_security",
  authz: "05_security",
  pmad: "05_security",
  sec: "05_security",
  iam: "05_security",
  tma: "05_security",
  skm: "05_security",
  priv: "05_security",
  audit: "05_security",
  csec: "05_security",

  // 06_quality — Testing & QA
  qa: "06_quality",

  // 07_ops — Operations & Reliability
  obs: "07_ops",
  lts: "07_ops",
  alrt: "07_ops",
  slo: "07_ops",
  perf: "07_ops",
  irp: "07_ops",
  load: "07_ops",

  // 08_data — Data & Information
  data: "08_data",
  data_governance: "08_data",
  data_lifecycle: "08_data",
  data_quality: "08_data",
  dlr: "08_data",
  dgl: "08_data",
  dqv: "08_data",
  cache: "08_data",
  srch: "08_data",
  rpt: "08_data",

  // 09_api_contracts — API & Contracts
  api_governance: "09_api_contracts",
  api: "09_api_contracts",
  apig: "09_api_contracts",
  pfs: "09_api_contracts",

  // 10_release — Release & Deployment
  rel: "10_release",
  sign: "10_release",

  // 11_governance — Compliance & Governance
  governance: "11_governance",
  comp: "11_governance",
  cpr: "11_governance",

  // 12_analytics — Analytics & Monitoring
  anl: "12_analytics",
  cost: "12_analytics",
  reporting: "12_analytics",
  metrics: "12_analytics",

  // Integrations route to implementation
  integrations: "04_implementation",
  ixs: "04_implementation",
  sso: "04_implementation",
  crmerp: "04_implementation",
  whcp: "04_implementation",
  pay: "04_implementation",
  notif: "04_implementation",
  fms: "04_implementation",
};

function slotForOutputPath(outputPath: string): string | null {
  const lower = outputPath.toLowerCase();

  if (lower.startsWith("10_app/")) {
    const subdir = lower.split("/")[1];
    if (subdir && subdir in SUBDIR_TO_SLOT) {
      return SUBDIR_TO_SLOT[subdir];
    }
  }

  if (lower.includes("requirements") || lower.includes("prd") || lower.includes("scope") || lower.includes("stakeholder") || lower.includes("roadmap")) return "01_requirements";
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("accessibility") || lower.includes("a11y")) return "02_design";
  if (lower.includes("architecture") || lower.includes("topology") || lower.includes("system")) return "03_architecture";
  if (lower.includes("frontend") || lower.includes("backend") || lower.includes("service") || lower.includes("component") || lower.includes("build") || lower.includes("integration") || lower.includes("webhook") || lower.includes("connector")) return "04_implementation";
  if (lower.includes("auth") || lower.includes("security") || lower.includes("rbac") || lower.includes("permission") || lower.includes("threat")) return "05_security";
  if (lower.includes("test") || lower.includes("qa") || lower.includes("quality")) return "06_quality";
  if (lower.includes("ops") || lower.includes("observability") || lower.includes("alerting") || lower.includes("slo") || lower.includes("incident")) return "07_ops";
  if (lower.includes("data") || lower.includes("model") || lower.includes("schema") || lower.includes("erd") || lower.includes("cache")) return "08_data";
  if (lower.includes("api") || lower.includes("contract") || lower.includes("interface")) return "09_api_contracts";
  if (lower.includes("release") || lower.includes("deploy") || lower.includes("infra") || lower.includes("ci") || lower.includes("devops")) return "10_release";
  if (lower.includes("governance") || lower.includes("compliance") || lower.includes("policy") || lower.includes("doc") || lower.includes("readme") || lower.includes("guide")) return "11_governance";
  if (lower.includes("analytics") || lower.includes("monitoring") || lower.includes("metric") || lower.includes("log") || lower.includes("cost")) return "12_analytics";
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

  const selectedTemplates = Array.isArray(selectionResult?.selected)
    ? (selectionResult!.selected as Array<{ template_id: string; template_version?: string }>).map(
        (t) => `${t.template_id}@${t.template_version ?? "1.0.0"}`
      )
    : [];

  const standardsPacks = Array.isArray((stdSnapshot as Record<string, unknown> | null)?.standards_packs_used)
    ? (stdSnapshot as Record<string, unknown>).standards_packs_used as string[]
    : [];

  const versions: Record<string, unknown> = {
    system_version: "1.0.0",
    intake_form_version: "1.0.0",
    intake_schema_version: "1.0.0",
    intake_ruleset_version: "1.0.0",
    standards_library_version: (stdSnapshot?.standards_library_version_used as string) ?? "1.0.0",
    standards_packs_used: standardsPacks,
    resolver_version: (stdSnapshot?.resolver_version as string) ?? "1.0.0",
    template_library_version: (selectionResult?.template_library_version as string) ?? "1.0.0",
    template_index_version: (selectionResult?.template_index_version as string) ?? "1.0.0",
    fill_rules_version: "1.0.0",
    templates_used: selectedTemplates,
    canonical_spec_model_version: "1.0.0",
    id_rules_version: "1.0.0",
    unknowns_model_version: "1.0.0",
    planning_rules_version: "1.0.0",
    proof_rules_version: "1.0.0",
    kit_folder_structure_version: "1.0.0",
    manifest_format_version: "1.0.0",
    entrypoint_contract_version: "1.0.0",
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
        for (const slot of APP_SLOTS) {
          if (`${slot.num}_${slot.name}` === targetSlot) {
            slotContents[targetSlot].push(file);
            break;
          }
        }
      } else {
        const slotDir = join(appDir, "11_governance");
        ensureDir(slotDir);
        writeFileSync(join(slotDir, file), content, "utf-8");
        slotContents["11_governance"].push(file);
      }
    }
  }

  for (const slot of APP_SLOTS) {
    const slotKey = `${slot.num}_${slot.name}`;
    const slotDir = join(appDir, slotKey);
    ensureDir(slotDir);
    if (slotContents[slotKey].length === 0) {
      writeFile(join(slotDir, "00_NA.md"), buildNaMd(slotKey, `Not applicable for this project — no templates were selected for the ${slot.label} slot`, slot.trigger));
    }
  }

  const selectedSlots = APP_SLOTS
    .filter((s) => slotContents[`${s.num}_${s.name}`].length > 0)
    .map((s) => `${s.num}_${s.name}`);

  writeFile(join(appDir, "00_pack_meta.md"), buildPackMetaMd(runId, projectName, specId, selectedSlots, versions));
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
