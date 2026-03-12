import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { sha256 } from "../../utils/hash.js";
import type {
  BAQKitExtraction,
  BAQSectionEntry,
  BAQCriticalObligation,
  BAQExtractionWarning,
  BAQSectionStatus,
  BAQApplicabilityStatus,
  BAQSeverity,
} from "./types.js";

interface SectionDefinition {
  section_id: string;
  section_label: string;
  applicability: BAQApplicabilityStatus;
  type: "json" | "dir" | "md";
  core_path: string | null;
  app_path: string | null;
  obligation_types: Array<"functional" | "structural" | "security" | "data" | "verification" | "operational">;
}

const SECTION_REGISTRY: SectionDefinition[] = [
  {
    section_id: "SEC-NIR",
    section_label: "Normalized Input Record",
    applicability: "required",
    type: "json",
    core_path: "01_core_artifacts/01_normalized_input_record.json",
    app_path: null,
    obligation_types: ["functional"],
  },
  {
    section_id: "SEC-STD",
    section_label: "Resolved Standards Snapshot",
    applicability: "required",
    type: "json",
    core_path: "01_core_artifacts/02_resolved_standards_snapshot.json",
    app_path: null,
    obligation_types: ["structural"],
  },
  {
    section_id: "SEC-SPEC",
    section_label: "Canonical Specification",
    applicability: "required",
    type: "json",
    core_path: "01_core_artifacts/03_canonical_spec.json",
    app_path: null,
    obligation_types: ["functional", "structural"],
  },
  {
    section_id: "SEC-WB",
    section_label: "Work Breakdown",
    applicability: "required",
    type: "json",
    core_path: "01_core_artifacts/04_work_breakdown.json",
    app_path: null,
    obligation_types: ["functional"],
  },
  {
    section_id: "SEC-ACC",
    section_label: "Acceptance Map",
    applicability: "required",
    type: "json",
    core_path: "01_core_artifacts/05_acceptance_map.json",
    app_path: null,
    obligation_types: ["verification"],
  },
  {
    section_id: "SEC-STATE",
    section_label: "State Snapshot",
    applicability: "recommended",
    type: "json",
    core_path: "01_core_artifacts/06_state_snapshot.json",
    app_path: null,
    obligation_types: ["operational"],
  },
  {
    section_id: "SEC-REQ",
    section_label: "Requirements Pack",
    applicability: "recommended",
    type: "dir",
    core_path: null,
    app_path: "10_app/01_requirements",
    obligation_types: ["functional"],
  },
  {
    section_id: "SEC-DESIGN",
    section_label: "Design Pack",
    applicability: "optional",
    type: "dir",
    core_path: null,
    app_path: "10_app/02_design",
    obligation_types: ["functional"],
  },
  {
    section_id: "SEC-ARCH",
    section_label: "Architecture Pack",
    applicability: "required",
    type: "dir",
    core_path: null,
    app_path: "10_app/03_architecture",
    obligation_types: ["structural"],
  },
  {
    section_id: "SEC-IMPL",
    section_label: "Implementation Pack",
    applicability: "recommended",
    type: "dir",
    core_path: null,
    app_path: "10_app/04_implementation",
    obligation_types: ["functional"],
  },
  {
    section_id: "SEC-SEC",
    section_label: "Security Pack",
    applicability: "required",
    type: "dir",
    core_path: null,
    app_path: "10_app/05_security",
    obligation_types: ["security"],
  },
  {
    section_id: "SEC-QUAL",
    section_label: "Quality Pack",
    applicability: "recommended",
    type: "dir",
    core_path: null,
    app_path: "10_app/06_quality",
    obligation_types: ["verification"],
  },
  {
    section_id: "SEC-OPS",
    section_label: "Operations Pack",
    applicability: "optional",
    type: "dir",
    core_path: null,
    app_path: "10_app/07_ops",
    obligation_types: ["operational"],
  },
  {
    section_id: "SEC-DATA",
    section_label: "Data Pack",
    applicability: "required",
    type: "dir",
    core_path: null,
    app_path: "10_app/08_data",
    obligation_types: ["data"],
  },
  {
    section_id: "SEC-API",
    section_label: "API Contracts Pack",
    applicability: "required",
    type: "dir",
    core_path: null,
    app_path: "10_app/09_api_contracts",
    obligation_types: ["structural"],
  },
  {
    section_id: "SEC-REL",
    section_label: "Release Pack",
    applicability: "optional",
    type: "dir",
    core_path: null,
    app_path: "10_app/10_release",
    obligation_types: ["operational"],
  },
  {
    section_id: "SEC-GOV",
    section_label: "Governance Pack",
    applicability: "optional",
    type: "dir",
    core_path: null,
    app_path: "10_app/11_governance",
    obligation_types: ["operational"],
  },
  {
    section_id: "SEC-ANA",
    section_label: "Analytics Pack",
    applicability: "optional",
    type: "dir",
    core_path: null,
    app_path: "10_app/12_analytics",
    obligation_types: ["operational"],
  },
  {
    section_id: "SEC-BRIEF",
    section_label: "Build Brief",
    applicability: "recommended",
    type: "md",
    core_path: null,
    app_path: null,
    obligation_types: ["functional"],
  },
  {
    section_id: "SEC-DI",
    section_label: "Design Identity",
    applicability: "optional",
    type: "md",
    core_path: null,
    app_path: null,
    obligation_types: ["functional"],
  },
];

function readJsonSafe(filePath: string): { data: unknown; valid: boolean } {
  try {
    const content = readFileSync(filePath, "utf-8");
    return { data: JSON.parse(content), valid: true };
  } catch {
    return { data: null, valid: false };
  }
}

function scanDirStats(dirPath: string): { fileCount: number; byteCount: number; contentHash: string } {
  if (!existsSync(dirPath)) return { fileCount: 0, byteCount: 0, contentHash: "" };
  try {
    const entries = readdirSync(dirPath).filter(f => !f.startsWith("00_") && !f.startsWith("."));
    let totalBytes = 0;
    let actualFileCount = 0;
    const parts: string[] = [];
    for (const f of entries) {
      const fp = join(dirPath, f);
      try {
        const stat = statSync(fp);
        if (stat.isFile()) {
          actualFileCount++;
          totalBytes += stat.size;
          parts.push(f + ":" + stat.size);
        }
      } catch { /* skip unreadable files */ }
    }
    return {
      fileCount: actualFileCount,
      byteCount: totalBytes,
      contentHash: parts.length > 0 ? sha256(parts.join("|")) : "",
    };
  } catch {
    return { fileCount: 0, byteCount: 0, contentHash: "" };
  }
}

function classifyAbsentStatus(applicability: BAQApplicabilityStatus): BAQSectionStatus {
  switch (applicability) {
    case "required": return "missing";
    case "recommended": return "deferred";
    case "optional": return "not_applicable";
    case "not_applicable": return "not_applicable";
    default: return "not_applicable";
  }
}

function classifySectionStatus(
  def: SectionDefinition,
  kitRoot: string,
): { status: BAQSectionStatus; fileCount: number; byteCount: number; contentHash: string | null } {
  if (def.section_id === "SEC-BRIEF") {
    const briefPath = join(kitRoot, "00_BUILD_BRIEF.md");
    if (existsSync(briefPath)) {
      try {
        const content = readFileSync(briefPath, "utf-8");
        return { status: "consumed", fileCount: 1, byteCount: content.length, contentHash: sha256(content) };
      } catch {
        return { status: "invalid", fileCount: 0, byteCount: 0, contentHash: null };
      }
    }
    return { status: classifyAbsentStatus(def.applicability), fileCount: 0, byteCount: 0, contentHash: null };
  }

  if (def.section_id === "SEC-DI") {
    const diPath = join(kitRoot, "00_DESIGN_IDENTITY.md");
    if (existsSync(diPath)) {
      try {
        const content = readFileSync(diPath, "utf-8");
        return { status: "consumed", fileCount: 1, byteCount: content.length, contentHash: sha256(content) };
      } catch {
        return { status: "invalid", fileCount: 0, byteCount: 0, contentHash: null };
      }
    }
    return { status: classifyAbsentStatus(def.applicability), fileCount: 0, byteCount: 0, contentHash: null };
  }

  if (def.type === "json" && def.core_path) {
    const fullPath = join(kitRoot, def.core_path);
    if (!existsSync(fullPath)) {
      return { status: classifyAbsentStatus(def.applicability), fileCount: 0, byteCount: 0, contentHash: null };
    }
    const { data, valid } = readJsonSafe(fullPath);
    if (!valid) {
      return { status: "invalid", fileCount: 1, byteCount: 0, contentHash: null };
    }
    const content = readFileSync(fullPath, "utf-8");
    return { status: "consumed", fileCount: 1, byteCount: content.length, contentHash: sha256(content) };
  }

  if (def.type === "dir" && def.app_path) {
    const dirPath = join(kitRoot, def.app_path);
    if (!existsSync(dirPath)) {
      return { status: classifyAbsentStatus(def.applicability), fileCount: 0, byteCount: 0, contentHash: null };
    }
    const stats = scanDirStats(dirPath);
    if (stats.fileCount === 0) {
      return { status: "deferred", fileCount: 0, byteCount: 0, contentHash: null };
    }
    return { status: "consumed", fileCount: stats.fileCount, byteCount: stats.byteCount, contentHash: stats.contentHash };
  }

  return { status: "not_applicable", fileCount: 0, byteCount: 0, contentHash: null };
}

function extractObligationsFromSpec(kitRoot: string): BAQCriticalObligation[] {
  const obligations: BAQCriticalObligation[] = [];
  let counter = 1;

  const specPath = join(kitRoot, "01_core_artifacts", "03_canonical_spec.json");
  if (!existsSync(specPath)) return obligations;

  const { data } = readJsonSafe(specPath);
  if (!data || typeof data !== "object") return obligations;
  const spec = data as Record<string, unknown>;

  const entities = spec.entities as Record<string, unknown> | undefined;
  if (entities) {
    const features = entities.features as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(features)) {
      for (const f of features) {
        if (f.priority_tier === "must" || f.priority_rank === 1) {
          obligations.push({
            obligation_id: `OBL-${String(counter++).padStart(3, "0")}`,
            source_section: "SEC-SPEC",
            obligation_type: "functional",
            description: `Must-have feature: ${f.name ?? f.feature_id}`,
            severity: "critical",
            fulfilled: false,
            fulfillment_ref: null,
          });
        }
      }
    }

    const roles = entities.roles as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(roles) && roles.length > 0) {
      obligations.push({
        obligation_id: `OBL-${String(counter++).padStart(3, "0")}`,
        source_section: "SEC-SPEC",
        obligation_type: "security",
        description: `Role-based access: ${roles.map(r => r.name ?? r.role_id).join(", ")}`,
        severity: "error",
        fulfilled: false,
        fulfillment_ref: null,
      });
    }

    const workflows = entities.workflows as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(workflows)) {
      for (const w of workflows) {
        obligations.push({
          obligation_id: `OBL-${String(counter++).padStart(3, "0")}`,
          source_section: "SEC-SPEC",
          obligation_type: "functional",
          description: `Workflow: ${w.name ?? w.workflow_id}`,
          severity: "warning",
          fulfilled: false,
          fulfillment_ref: null,
        });
      }
    }
  }

  const constraints = spec.constraints as Record<string, unknown> | undefined;
  if (constraints) {
    const secConstraints = constraints.security_constraints as Record<string, unknown> | undefined;
    if (secConstraints && Object.keys(secConstraints).length > 0) {
      obligations.push({
        obligation_id: `OBL-${String(counter++).padStart(3, "0")}`,
        source_section: "SEC-SEC",
        obligation_type: "security",
        description: "Security constraints defined in canonical spec",
        severity: "critical",
        fulfilled: false,
        fulfillment_ref: null,
      });
    }
  }

  const accPath = join(kitRoot, "01_core_artifacts", "05_acceptance_map.json");
  if (existsSync(accPath)) {
    const { data: accData } = readJsonSafe(accPath);
    if (accData && typeof accData === "object") {
      const accMap = accData as Record<string, unknown>;
      const items = (accMap.acceptance ?? accMap.acceptance_items ?? []) as Array<Record<string, unknown>>;
      const hardGates = items.filter(a => a.gating === "hard_gate");
      if (hardGates.length > 0) {
        obligations.push({
          obligation_id: `OBL-${String(counter++).padStart(3, "0")}`,
          source_section: "SEC-ACC",
          obligation_type: "verification",
          description: `${hardGates.length} hard-gate acceptance criteria require proof`,
          severity: "critical",
          fulfilled: false,
          fulfillment_ref: null,
        });
      }
    }
  }

  return obligations;
}

export function runBAQExtraction(runDir: string): BAQKitExtraction {
  const kitRoot = findKitRoot(runDir);
  const now = new Date().toISOString();
  const extractionId = `BAQX-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;

  let entrypointData: Record<string, unknown> | null = null;
  const entrypointPath = join(runDir, "kit", "entrypoint.json");
  if (existsSync(entrypointPath)) {
    const { data, valid } = readJsonSafe(entrypointPath);
    if (valid) entrypointData = data as Record<string, unknown>;
  }

  const kitRef = entrypointData?.kit_root as string ?? "kit/bundle/agent_kit";
  const kitVersion = entrypointData?.version as string ?? "1.0.0";
  const runId = entrypointData?.run_id as string ?? basename(runDir);

  const sections: BAQSectionEntry[] = [];
  const warnings: BAQExtractionWarning[] = [];
  let warningCounter = 1;

  for (const def of SECTION_REGISTRY) {
    const classification = classifySectionStatus(def, kitRoot);

    sections.push({
      section_id: def.section_id,
      section_path: def.core_path ?? def.app_path ?? def.section_id,
      section_label: def.section_label,
      applicability: def.applicability,
      status: classification.status,
      content_hash: classification.contentHash,
      file_count: classification.fileCount,
      byte_count: classification.byteCount,
      extraction_notes: [],
      extracted_at: classification.status === "consumed" ? now : null,
    });

    if (classification.status === "missing" && def.applicability === "required") {
      warnings.push({
        warning_id: `BAQW-${String(warningCounter++).padStart(3, "0")}`,
        section_id: def.section_id,
        severity: "critical",
        message: `Required section '${def.section_label}' is missing from the kit`,
        blocks_forward_progress: true,
      });
    } else if (classification.status === "invalid") {
      warnings.push({
        warning_id: `BAQW-${String(warningCounter++).padStart(3, "0")}`,
        section_id: def.section_id,
        severity: "error",
        message: `Section '${def.section_label}' exists but contains invalid content`,
        blocks_forward_progress: def.applicability === "required",
      });
    } else if (classification.status === "deferred" && def.applicability === "recommended") {
      warnings.push({
        warning_id: `BAQW-${String(warningCounter++).padStart(3, "0")}`,
        section_id: def.section_id,
        severity: "warning",
        message: `Recommended section '${def.section_label}' was deferred (empty or not populated)`,
        blocks_forward_progress: false,
      });
    }
  }

  const criticalObligations = extractObligationsFromSpec(kitRoot);

  const consumedCount = sections.filter(s => s.status === "consumed").length;
  const deferredCount = sections.filter(s => s.status === "deferred").length;
  const naCount = sections.filter(s => s.status === "not_applicable").length;
  const invalidCount = sections.filter(s => s.status === "invalid").length;
  const missingCount = sections.filter(s => s.status === "missing").length;
  const requiredSections = sections.filter(s => s.applicability === "required");
  const requiredPresent = requiredSections.filter(s => s.status === "consumed").length;
  const blockingWarnings = warnings.filter(w => w.blocks_forward_progress).length;

  const hasBlockers = blockingWarnings > 0;
  const hasWarnings = warnings.filter(w => !w.blocks_forward_progress && w.severity !== "info").length > 0;

  const extractionResult = hasBlockers ? "failed" as const : (invalidCount > 0 || deferredCount > 0) ? "partial" as const : "passed" as const;
  const gateRecommendation = hasBlockers ? "block" as const : hasWarnings ? "allow_with_warnings" as const : "allow" as const;

  return {
    schema_version: "1.0.0",
    extraction_id: extractionId,
    run_id: runId,
    kit_ref: kitRef,
    kit_version: kitVersion,
    status: "extraction_complete",
    sections,
    critical_obligations: criticalObligations,
    warnings,
    summary: {
      total_sections: sections.length,
      consumed_count: consumedCount,
      deferred_count: deferredCount,
      not_applicable_count: naCount,
      invalid_count: invalidCount,
      missing_count: missingCount,
      required_sections_present: requiredPresent,
      required_sections_total: requiredSections.length,
      critical_obligations_total: criticalObligations.length,
      critical_obligations_fulfilled: criticalObligations.filter(o => o.fulfilled).length,
      blocking_warnings: blockingWarnings,
    },
    extraction_result: extractionResult,
    gate_recommendation: gateRecommendation,
    created_at: now,
    updated_at: now,
  };
}

function findKitRoot(runDir: string): string {
  const entrypointPath = join(runDir, "kit", "entrypoint.json");
  if (existsSync(entrypointPath)) {
    try {
      const ep = JSON.parse(readFileSync(entrypointPath, "utf-8"));
      if (ep.kit_root) return join(runDir, ep.kit_root);
    } catch { /* fall through */ }
  }

  const bundlePath = join(runDir, "kit", "bundle", "agent_kit");
  if (existsSync(bundlePath)) return bundlePath;

  return join(runDir, "kit", "bundle", "agent_kit");
}

export function checkBAQExtractionGate(extraction: BAQKitExtraction): {
  passed: boolean;
  blockers: string[];
  gate_id: "G-BQ-01";
} {
  const blockers: string[] = [];

  if (extraction.extraction_result === "failed") {
    blockers.push("Extraction result is 'failed'");
  }

  if (extraction.summary.required_sections_present < extraction.summary.required_sections_total) {
    const missing = extraction.sections
      .filter(s => s.applicability === "required" && s.status !== "consumed")
      .map(s => s.section_label);
    blockers.push(`Missing required sections: ${missing.join(", ")}`);
  }

  if (extraction.summary.blocking_warnings > 0) {
    const blockingMsgs = extraction.warnings
      .filter(w => w.blocks_forward_progress)
      .map(w => w.message);
    blockers.push(...blockingMsgs);
  }

  return {
    passed: blockers.length === 0,
    blockers,
    gate_id: "G-BQ-01",
  };
}
