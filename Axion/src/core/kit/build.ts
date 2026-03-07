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

function buildStartHereMd(
  runId: string,
  specId: string,
  projectName: string,
  projectOverview: string,
  featureCount: number,
  roleCount: number,
  hasDesignIdentity: boolean,
  hasBuildBrief: boolean
): string {
  const featureRoleSummary = `This project defines ${featureCount} feature${featureCount !== 1 ? "s" : ""} and ${roleCount} user role${roleCount !== 1 ? "s" : ""}.`;

  const readingOrderItems: string[] = [];
  let step = 1;
  if (hasBuildBrief) {
    readingOrderItems.push(`${step}. **Read \`00_BUILD_BRIEF.md\` first** — it contains the complete product specification summary`);
    step++;
  }
  if (hasDesignIdentity) {
    readingOrderItems.push(`${step}. Read \`00_DESIGN_IDENTITY.md\` for visual direction, color system, and UI guidelines`);
    step++;
  }
  readingOrderItems.push(`${step}. Read \`00_KIT_MANIFEST.md\` for file listing and structure`);
  step++;
  readingOrderItems.push(`${step}. Read \`01_core_artifacts/03_canonical_spec.json\` for the full project specification`);
  step++;
  readingOrderItems.push(`${step}. Read \`01_core_artifacts/04_work_breakdown.json\` for work units`);
  step++;
  readingOrderItems.push(`${step}. Read \`01_core_artifacts/05_acceptance_map.json\` for acceptance criteria`);
  step++;
  readingOrderItems.push(`${step}. Browse \`10_app/\` for rendered documents by domain`);

  const briefNote = hasBuildBrief
    ? `\n> **Read \`00_BUILD_BRIEF.md\` first** — it contains the complete product specification, feature list, design direction, technical profile, and build priorities.\n`
    : "";

  return `# 00 — START HERE

## Project: ${projectName}

${projectOverview ? projectOverview : `This is the build kit for ${projectName}.`}

${featureRoleSummary}
${briefNote}
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
${readingOrderItems.join("\n")}

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
      "00_BUILD_BRIEF.md",
      "00_DESIGN_IDENTITY.md",
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

## Instruction Files

| File | Description |
|------|-------------|
| \`00_BUILD_BRIEF.md\` | Product specification summary — read first |
| \`00_DESIGN_IDENTITY.md\` | Visual direction and design system |

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
    if (files.length === 0) return null;
    return `| \`${key}/\` | ${s.label} | ${files.join(", ")} |`;
  }).filter(Boolean).join("\n");

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

function buildBuildBriefMd(runDir: string, projectName: string): string {
  const canonicalSpec = safeReadJson<Record<string, unknown>>(join(runDir, "canonical", "canonical_spec.json"));
  const normalizedInput = safeReadJson<Record<string, unknown>>(join(runDir, "intake", "normalized_input.json"));
  const workBreakdown = safeReadJson<Record<string, unknown>>(join(runDir, "planning", "work_breakdown.json"));

  const meta = (canonicalSpec?.meta ?? {}) as Record<string, unknown>;
  const entities = (canonicalSpec?.entities ?? {}) as Record<string, unknown>;
  const constraints = (canonicalSpec?.constraints ?? {}) as Record<string, unknown>;
  const normalizedConstraints = (normalizedInput?.constraints ?? {}) as Record<string, unknown>;

  const intent = (normalizedInput?.intent ?? {}) as Record<string, unknown>;
  const design = (normalizedInput?.design ?? {}) as Record<string, unknown>;
  const dataModel = (normalizedInput?.data_model ?? {}) as Record<string, unknown>;
  const integrations = (normalizedInput?.integrations ?? {}) as Record<string, unknown>;
  const project = (normalizedInput?.project ?? {}) as Record<string, unknown>;

  const features = (Array.isArray(entities.features) ? entities.features : []) as Array<Record<string, unknown>>;
  const roles = (Array.isArray(entities.roles) ? entities.roles : []) as Array<Record<string, unknown>>;
  const workflows = (Array.isArray(entities.workflows) ? entities.workflows : []) as Array<Record<string, unknown>>;
  const units = (Array.isArray((workBreakdown as Record<string, unknown> | null)?.units) ? (workBreakdown as Record<string, unknown>).units : []) as Array<Record<string, unknown>>;

  const primaryGoals = Array.isArray(intent.primary_goals) ? intent.primary_goals as string[] : [];
  const successMetrics = Array.isArray(intent.success_metrics) ? intent.success_metrics as string[] : [];
  const outOfScope = Array.isArray(intent.out_of_scope) ? intent.out_of_scope as string[] : [];

  const sections: string[] = [];

  sections.push(`# 00 — BUILD BRIEF\n`);

  sections.push(`## Project Identity\n`);
  sections.push(`**Name**: ${projectName}`);
  if (project.project_overview) {
    sections.push(`**Overview**: ${project.project_overview}`);
  }
  if (primaryGoals.length > 0) {
    sections.push(`**Primary Goals**:`);
    for (const goal of primaryGoals) {
      sections.push(`- ${goal}`);
    }
  }
  sections.push(``);

  const featureSummaries = features.slice(0, 5).map((f) => String(f.name ?? "")).filter(Boolean);
  if (featureSummaries.length > 0 || project.project_overview) {
    sections.push(`## What This App Does\n`);
    const overview = project.project_overview ? String(project.project_overview) : projectName;
    const featureList = featureSummaries.length > 0 ? ` Core capabilities include ${featureSummaries.join(", ")}.` : "";
    sections.push(`${overview}${featureList}\n`);
  }

  if (features.length > 0) {
    sections.push(`## Core Features\n`);
    sections.push(`| Feature ID | Name | Description | Priority |`);
    sections.push(`|-----------|------|-------------|----------|`);
    for (const f of features) {
      const fid = String(f.feature_id ?? "");
      const fname = String(f.name ?? "");
      const fdesc = String(f.description ?? "").replace(/\|/g, "-").slice(0, 120);
      const fpri = String(f.priority_tier ?? "must");
      sections.push(`| ${fid} | ${fname} | ${fdesc} | ${fpri} |`);
    }
    sections.push(``);
  }

  if (Object.keys(design).length > 0) {
    sections.push(`## Design Direction\n`);
    if (design.brand_colors && typeof design.brand_colors === "object") {
      const colors = design.brand_colors as Record<string, unknown>;
      sections.push(`**Brand Colors**:`);
      for (const [key, val] of Object.entries(colors)) {
        sections.push(`- ${key}: \`${val}\``);
      }
    }
    if (design.visual_preset) sections.push(`**Visual Preset**: ${design.visual_preset}`);
    if (design.navigation_pref) sections.push(`**Navigation Preference**: ${design.navigation_pref}`);
    if (Array.isArray(design.style_adjectives) && (design.style_adjectives as string[]).length > 0) {
      sections.push(`**Style Adjectives**: ${(design.style_adjectives as string[]).join(", ")}`);
    }
    if (design.ui_density) sections.push(`**UI Density**: ${design.ui_density}`);
    sections.push(``);
  }

  sections.push(`## Technical Profile\n`);
  const auth = normalizedConstraints.auth as Record<string, unknown> | undefined;
  const nfr = normalizedConstraints.nfr as Record<string, unknown> | undefined;
  if (auth) {
    if (auth.auth_provider) sections.push(`**Auth Provider**: ${auth.auth_provider}`);
    if (auth.authorization_model) sections.push(`**Authorization Model**: ${auth.authorization_model}`);
    if (auth.session_handling) sections.push(`**Session Handling**: ${auth.session_handling}`);
  }
  if (nfr) {
    if (nfr.expected_users) sections.push(`**Expected Users**: ${nfr.expected_users}`);
    if (nfr.throughput) sections.push(`**Throughput**: ${nfr.throughput}`);
    if (nfr.response_time) sections.push(`**Response Time**: ${nfr.response_time}`);
    if (nfr.offline_support !== undefined) sections.push(`**Offline Support**: ${nfr.offline_support}`);
    if (Array.isArray(nfr.compliance) && (nfr.compliance as string[]).length > 0) {
      sections.push(`**Compliance**: ${(nfr.compliance as string[]).join(", ")}`);
    }
  }
  sections.push(``);

  if (roles.length > 0) {
    sections.push(`## User Roles\n`);
    sections.push(`| Role | Primary Goal |`);
    sections.push(`|------|-------------|`);
    for (const r of roles) {
      const rname = String(r.name ?? "");
      const rgoal = String(r.primary_goal ?? r.description ?? "");
      sections.push(`| ${rname} | ${rgoal} |`);
    }
    sections.push(``);
  }

  if (workflows.length > 0) {
    const topWorkflows = workflows.slice(0, 3);
    sections.push(`## Key Workflows\n`);
    for (const w of topWorkflows) {
      sections.push(`### ${w.name}`);
      sections.push(`**Actor**: ${w.actor_role_ref ?? "User"}`);
      if (Array.isArray(w.steps)) {
        sections.push(`**Steps**:`);
        for (const step of w.steps as string[]) {
          sections.push(`1. ${step}`);
        }
      }
      if (w.success_outcome) sections.push(`**Success Outcome**: ${w.success_outcome}`);
      sections.push(``);
    }
  }

  if (dataModel && Object.keys(dataModel).length > 0) {
    sections.push(`## Data Model\n`);
    if (Array.isArray(dataModel.entities)) {
      for (const entity of dataModel.entities as Array<Record<string, unknown>>) {
        const ename = String(entity.name ?? "");
        sections.push(`**${ename}**`);
        if (Array.isArray(entity.fields)) {
          for (const field of entity.fields as Array<Record<string, unknown>>) {
            sections.push(`- ${field.name}: ${field.type ?? "unknown"}`);
          }
        }
      }
    } else {
      for (const [key, val] of Object.entries(dataModel)) {
        sections.push(`- **${key}**: ${typeof val === "object" ? JSON.stringify(val) : val}`);
      }
    }
    sections.push(``);
  }

  if (integrations && Object.keys(integrations).length > 0) {
    sections.push(`## Integrations\n`);
    if (Array.isArray(integrations.platforms)) {
      for (const platform of integrations.platforms as Array<Record<string, unknown>>) {
        sections.push(`- **${platform.name ?? platform}**: ${platform.purpose ?? ""}`);
      }
    } else {
      for (const [key, val] of Object.entries(integrations)) {
        sections.push(`- **${key}**: ${typeof val === "object" ? JSON.stringify(val) : val}`);
      }
    }
    sections.push(``);
  }

  if (units.length > 0) {
    const topUnits = units.slice(0, 5);
    sections.push(`## Build Priority\n`);
    sections.push(`| Unit ID | Name | Description |`);
    sections.push(`|---------|------|-------------|`);
    for (const u of topUnits) {
      const uid = String(u.unit_id ?? "");
      const uname = String(u.name ?? u.title ?? "");
      const udesc = String(u.description ?? "").replace(/\|/g, "-").slice(0, 120);
      sections.push(`| ${uid} | ${uname} | ${udesc} |`);
    }
    sections.push(``);
  }

  if (outOfScope.length > 0) {
    sections.push(`## What NOT To Build\n`);
    for (const item of outOfScope) {
      sections.push(`- ${item}`);
    }
    sections.push(``);
  }

  if (successMetrics.length > 0) {
    sections.push(`## Success Metrics\n`);
    for (const metric of successMetrics) {
      sections.push(`- ${metric}`);
    }
    sections.push(``);
  }

  return sections.join("\n");
}

function buildDesignIdentityMd(design: Record<string, unknown>): string {
  const brandColors = design.brand_colors as Record<string, string> | undefined;
  const visualPreset = String(design.visual_preset ?? "");
  const navigationPref = String(design.navigation_pref ?? "");
  const styleAdjectives = (design.style_adjectives ?? []) as string[];
  const uiDensity = String(design.ui_density ?? "comfortable");

  let md = `# 00 — DESIGN IDENTITY\n\n`;

  md += `## Color System\n\n`;
  if (brandColors && Object.keys(brandColors).length > 0) {
    md += `| Role | Hex | Usage |\n|------|-----|-------|\n`;
    const colorUsage: Record<string, string> = {
      primary: "Primary actions, active states, key CTAs, focused elements",
      secondary: "Supporting UI, secondary buttons, tags, badges",
      accent: "Highlights, notifications, progress indicators, links",
      background: "Page background, card surfaces, modal overlays",
      text: "Body text, headings, labels, input values",
      surface: "Card backgrounds, dropdown menus, sidebar fill",
      error: "Error states, destructive actions, validation failures",
      success: "Success states, confirmations, positive indicators",
      warning: "Warning states, caution indicators, pending status",
    };
    for (const [role, hex] of Object.entries(brandColors)) {
      const usage = colorUsage[role] ?? `Used for ${role} elements`;
      md += `| ${role} | \`${hex}\` | ${usage} |\n`;
    }
  } else {
    md += `No brand colors specified. Use a neutral professional palette.\n`;
  }
  md += `\n`;

  md += `## Visual Preset\n\n`;
  const presetGuidance: Record<string, { description: string; borderRadius: string; spacing: string; animation: string; typography: string }> = {
    professional: {
      description: "Clean, structured, trust-building. Suitable for B2B, enterprise, and business tools.",
      borderRadius: "4px for inputs/buttons, 8px for cards",
      spacing: "16px base unit, consistent 8px grid",
      animation: "Subtle transitions (150-200ms), no playful animations",
      typography: "System fonts or Inter/Roboto. 14px base, 1.5 line-height",
    },
    playful: {
      description: "Energetic, friendly, approachable. Suitable for consumer apps, social, and gamified experiences.",
      borderRadius: "12px for buttons, 16px for cards, pill-shaped tags",
      spacing: "20px base unit, generous whitespace",
      animation: "Bouncy transitions (300ms), micro-interactions on hover/click",
      typography: "Rounded fonts (Nunito, Poppins). 16px base, 1.6 line-height",
    },
    minimalist: {
      description: "Stripped-back, content-focused, maximum clarity. Suitable for productivity tools and dashboards.",
      borderRadius: "2px or 0px for sharp edges",
      spacing: "12px base unit, tight but breathable",
      animation: "Minimal (100ms fade only), no decorative motion",
      typography: "Monospace accents, clean sans-serif body. 14px base, 1.4 line-height",
    },
    bold: {
      description: "High-contrast, statement-making, attention-grabbing. Suitable for marketing, media, and creative tools.",
      borderRadius: "8px standard, 24px for hero elements",
      spacing: "24px base unit, dramatic section breaks",
      animation: "Confident transitions (250ms), scale transforms on interaction",
      typography: "Heavy-weight headings (700-900), large sizes. 16px base, 1.5 line-height",
    },
    elegant: {
      description: "Refined, luxurious, sophisticated. Suitable for premium products, fashion, and high-end services.",
      borderRadius: "6px subtle curves",
      spacing: "20px base unit, generous margins, centered layouts",
      animation: "Smooth ease-in-out (300ms), parallax scrolling acceptable",
      typography: "Serif headings (Playfair, Georgia), light-weight body. 15px base, 1.7 line-height",
    },
    technical: {
      description: "Data-dense, precise, information-rich. Suitable for developer tools, analytics, and admin panels.",
      borderRadius: "4px consistent",
      spacing: "8px base unit, compact layouts, dense tables",
      animation: "Instant transitions (100ms), no decorative motion",
      typography: "Monospace for data (JetBrains Mono), sans-serif UI. 13px base, 1.4 line-height",
    },
    warm: {
      description: "Inviting, human, comfortable. Suitable for community platforms, wellness, and education.",
      borderRadius: "10px rounded, soft edges throughout",
      spacing: "18px base unit, comfortable gaps",
      animation: "Gentle transitions (250ms), fade and slide",
      typography: "Humanist sans-serif (Lato, Source Sans). 15px base, 1.6 line-height",
    },
  };
  const preset = presetGuidance[visualPreset.toLowerCase()];
  if (preset) {
    md += `**Preset**: ${visualPreset}\n\n`;
    md += `${preset.description}\n\n`;
    md += `| Property | Value |\n|----------|-------|\n`;
    md += `| Border Radius | ${preset.borderRadius} |\n`;
    md += `| Spacing Scale | ${preset.spacing} |\n`;
    md += `| Animation | ${preset.animation} |\n`;
    md += `| Typography | ${preset.typography} |\n`;
  } else if (visualPreset) {
    md += `**Preset**: ${visualPreset}\n\nApply the "${visualPreset}" aesthetic consistently across all components.\n`;
  } else {
    md += `No visual preset specified. Default to a professional, clean aesthetic.\n`;
  }
  md += `\n`;

  md += `## Navigation Pattern\n\n`;
  const navGuidance: Record<string, string> = {
    sidebar: "**Fixed left sidebar** with collapsible navigation groups. Width: 240-280px expanded, 64px collapsed. Include logo/brand at top, primary nav items with icons, collapsible sub-groups, and user profile/settings at bottom. Support keyboard navigation and responsive collapse to hamburger on mobile.",
    topnav: "**Horizontal top navigation bar** with dropdown menus. Height: 56-64px. Logo on left, primary nav items centered or left-aligned, user actions on right. Use dropdowns for sub-items (max 2 levels). Sticky on scroll. Collapse to hamburger menu on mobile with slide-out drawer.",
    tabs: "**Tab-based navigation** for content switching within a view. Use top-aligned tabs with clear active state. Support swipe gestures on mobile. Keep tab count to 5-7 maximum. Use icons + labels for clarity.",
    bottom_nav: "**Bottom navigation bar** (mobile-first). Height: 56px. 3-5 primary destinations with icons and labels. Highlight active tab. Fixed position at viewport bottom. On desktop, convert to sidebar or top nav.",
    breadcrumb: "**Breadcrumb-driven navigation** for deep hierarchies. Show full path with clickable ancestors. Combine with sidebar for primary navigation. Use separator characters (/ or >) between levels.",
    hybrid: "**Hybrid navigation** combining sidebar for primary sections and top bar for global actions/search/user menu. Sidebar width: 240px. Top bar height: 56px. This is the most common pattern for complex applications.",
  };
  const navKey = navigationPref.toLowerCase().replace(/[\s-]/g, "_");
  const navGuide = navGuidance[navKey];
  if (navGuide) {
    md += `${navGuide}\n`;
  } else if (navigationPref) {
    md += `**Pattern**: ${navigationPref}\n\nImplement the "${navigationPref}" navigation pattern consistently across all views.\n`;
  } else {
    md += `No navigation preference specified. Default to sidebar navigation for desktop, bottom nav for mobile.\n`;
  }
  md += `\n`;

  md += `## Typography & Density\n\n`;
  const densityGuidance: Record<string, { padding: string; gap: string; fontSize: string; rowHeight: string; description: string }> = {
    compact: {
      description: "Maximum information density. Best for power users and data-heavy interfaces.",
      padding: "4px vertical, 8px horizontal on interactive elements",
      gap: "4-8px between elements, 12px between sections",
      fontSize: "12-13px body, 11px captions, 16px headings",
      rowHeight: "32px table rows, 28px list items",
    },
    comfortable: {
      description: "Balanced density. Good default for most applications.",
      padding: "8px vertical, 16px horizontal on interactive elements",
      gap: "8-12px between elements, 20px between sections",
      fontSize: "14px body, 12px captions, 20px headings",
      rowHeight: "44px table rows, 40px list items",
    },
    spacious: {
      description: "Generous whitespace. Best for content-focused and consumer-facing interfaces.",
      padding: "12px vertical, 24px horizontal on interactive elements",
      gap: "16-20px between elements, 32px between sections",
      fontSize: "16px body, 14px captions, 24px headings",
      rowHeight: "56px table rows, 48px list items",
    },
  };
  const density = densityGuidance[uiDensity.toLowerCase()];
  if (density) {
    md += `**UI Density**: ${uiDensity}\n\n`;
    md += `${density.description}\n\n`;
    md += `| Property | Value |\n|----------|-------|\n`;
    md += `| Padding | ${density.padding} |\n`;
    md += `| Gap / Spacing | ${density.gap} |\n`;
    md += `| Font Size | ${density.fontSize} |\n`;
    md += `| Row Height | ${density.rowHeight} |\n`;
  } else {
    md += `**UI Density**: ${uiDensity}\n\nApply "${uiDensity}" spacing throughout the interface.\n`;
  }
  md += `\n`;

  md += `## Style Adjectives Applied\n\n`;
  if (styleAdjectives.length > 0) {
    const adjectiveGuidance: Record<string, string> = {
      modern: "Use current design trends: flat design with subtle shadows, rounded corners, gradient accents. Avoid skeuomorphic elements.",
      clean: "Maximize whitespace, use clear visual hierarchy, avoid clutter. Every element must earn its place on screen.",
      corporate: "Conservative color usage, structured grid layouts, formal typography. Prioritize readability and professionalism over creativity.",
      creative: "Allow asymmetric layouts, unexpected color combinations, custom illustrations. Break grid occasionally for visual interest.",
      friendly: "Use warm colors, rounded shapes, conversational copy. Add personality through micro-copy and empty states.",
      serious: "Muted palette, structured layouts, minimal decoration. Focus on data clarity and task completion.",
      luxurious: "Rich colors, ample whitespace, serif typography for headings. Use subtle animations and high-quality imagery.",
      trustworthy: "Blue-leaning palette, consistent patterns, clear CTAs. Show security badges, testimonials, and certifications prominently.",
      innovative: "Gradient backgrounds, glassmorphism effects, animated transitions. Push visual boundaries while maintaining usability.",
      accessible: "High contrast ratios (WCAG AAA), large touch targets (48px+), clear focus indicators. Screen reader optimized.",
      dark: "Dark background theme as default. Light text on dark surfaces. Ensure sufficient contrast for readability.",
      light: "Light background theme as default. Dark text on light surfaces. Clean and open feel.",
      futuristic: "Neon accents on dark backgrounds, geometric shapes, monospace fonts for data. Sci-fi inspired aesthetics.",
      organic: "Earth tones, natural textures, flowing shapes. Avoid sharp corners and harsh contrasts.",
      minimal: "Reduce to essentials. Single accent color, ample whitespace, typography-driven hierarchy.",
      vibrant: "Saturated colors, bold contrasts, energetic compositions. Use color to create visual hierarchy.",
    };
    for (const adj of styleAdjectives) {
      const guidance = adjectiveGuidance[adj.toLowerCase()];
      if (guidance) {
        md += `**${adj}**: ${guidance}\n\n`;
      } else {
        md += `**${adj}**: Apply "${adj}" aesthetic throughout the interface design.\n\n`;
      }
    }
  } else {
    md += `No style adjectives specified. Apply a neutral, professional aesthetic.\n`;
  }

  return md;
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
    if (meta?.project_name) {
      projectName = meta.project_name as string;
    } else {
      const proj = (canonicalSpecData as Record<string, unknown>).project as Record<string, unknown> | undefined;
      if (proj?.project_name) projectName = proj.project_name as string;
    }
  }

  if (projectName === "Axion Generated Project") {
    const normalizedInputData = safeReadJson<Record<string, unknown>>(join(runDir, "intake", "normalized_input.json"));
    if (normalizedInputData) {
      const proj = normalizedInputData.project as Record<string, unknown> | undefined;
      if (proj?.project_name && typeof proj.project_name === "string" && proj.project_name.trim()) {
        projectName = proj.project_name as string;
      }
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

  writeFile(join(agentKitDir, "00_BUILD_BRIEF.md"), buildBuildBriefMd(runDir, projectName));
  const hasBuildBrief = true;

  const normalizedForDesign = safeReadJson<Record<string, unknown>>(join(runDir, "intake", "normalized_input.json"));
  const designData = normalizedForDesign?.design as Record<string, unknown> | undefined;
  const hasDesignIdentity = !!(designData && typeof designData === "object" && Object.keys(designData).length > 0);
  if (hasDesignIdentity) {
    writeFile(join(agentKitDir, "00_DESIGN_IDENTITY.md"), buildDesignIdentityMd(designData!));
  }

  const canonicalForStart = safeReadJson<Record<string, unknown>>(join(runDir, "canonical", "canonical_spec.json"));
  const startEntities = (canonicalForStart?.entities ?? {}) as Record<string, unknown>;
  const startMeta = (canonicalForStart?.meta ?? {}) as Record<string, unknown>;
  const startFeatures = Array.isArray(startEntities.features) ? startEntities.features as unknown[] : [];
  const startRoles = Array.isArray(startEntities.roles) ? startEntities.roles as unknown[] : [];
  const projectOverview = String(startMeta.project_overview ?? (normalizedForDesign?.project as Record<string, unknown> | undefined)?.project_overview ?? "");

  writeFile(join(agentKitDir, "00_START_HERE.md"), buildStartHereMd(runId, specId, projectName, projectOverview, startFeatures.length, startRoles.length, hasDesignIdentity, hasBuildBrief));
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
