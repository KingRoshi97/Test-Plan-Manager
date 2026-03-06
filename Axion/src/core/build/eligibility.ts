import * as fs from "fs";
import * as path from "path";
import { EligibilityResult, EligibilityCondition } from "./types.js";

const AXION_RUNS_DIR = fs.existsSync(path.resolve("Axion", ".axion"))
  ? path.resolve("Axion/.axion/runs")
  : path.resolve(".axion/runs");

const REQUIRED_GATES = [
  "G1_INTAKE_VALIDITY",
  "G2_CANONICAL_INTEGRITY",
  "G3_STANDARDS_RESOLVED",
  "G4_TEMPLATE_SELECTION",
  "G5_TEMPLATE_COMPLETENESS",
  "G6_PLAN_COVERAGE",
  "G7_VERIFICATION",
  "G8_PACKAGE_INTEGRITY",
];

export function checkBuildEligibility(runId: string): EligibilityResult {
  const runDir = path.join(AXION_RUNS_DIR, runId);
  const conditions: EligibilityCondition[] = [];
  const blockers: string[] = [];

  conditions.push(checkKitEntrypoint(runDir));
  conditions.push(checkKitManifest(runDir));
  conditions.push(...checkGatesPassed(runDir));
  conditions.push(checkCanonicalSpec(runDir));
  conditions.push(checkWorkBreakdown(runDir));
  conditions.push(checkRenderedDocs(runDir));
  conditions.push(checkNoCriticalBlockers(runDir));

  for (const c of conditions) {
    if (!c.passed) {
      blockers.push(c.detail || c.description);
    }
  }

  return {
    eligible: blockers.length === 0,
    conditions,
    blockers,
  };
}

function checkKitEntrypoint(runDir: string): EligibilityCondition {
  const entrypoint = path.join(runDir, "kit", "entrypoint.json");
  const exists = fs.existsSync(entrypoint);
  let detail: string | undefined;
  if (exists) {
    try {
      const data = JSON.parse(fs.readFileSync(entrypoint, "utf-8"));
      if (!data.kit_root || !data.run_id) {
        detail = "entrypoint.json is missing required fields (kit_root, run_id)";
        return { conditionId: "kit_entrypoint", description: "Kit entrypoint.json exists and is valid", passed: false, detail };
      }
      detail = `Kit root: ${data.kit_root}, Run: ${data.run_id}`;
    } catch {
      detail = "entrypoint.json exists but is not valid JSON";
      return { conditionId: "kit_entrypoint", description: "Kit entrypoint.json exists and is valid", passed: false, detail };
    }
  } else {
    detail = `File not found: ${entrypoint}`;
  }
  return { conditionId: "kit_entrypoint", description: "Kit entrypoint.json exists and is valid", passed: exists, detail };
}

function checkKitManifest(runDir: string): EligibilityCondition {
  const manifest = path.join(runDir, "kit", "kit_manifest.json");
  const exists = fs.existsSync(manifest);
  let detail: string | undefined;
  if (exists) {
    try {
      const data = JSON.parse(fs.readFileSync(manifest, "utf-8"));
      if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
        detail = "kit_manifest.json has no files listed";
        return { conditionId: "kit_manifest", description: "Kit manifest exists with file inventory", passed: false, detail };
      }
      detail = `${data.files.length} files in kit manifest`;
    } catch {
      detail = "kit_manifest.json exists but is not valid JSON";
      return { conditionId: "kit_manifest", description: "Kit manifest exists with file inventory", passed: false, detail };
    }
  } else {
    detail = `File not found: ${manifest}`;
  }
  return { conditionId: "kit_manifest", description: "Kit manifest exists with file inventory", passed: exists, detail };
}

function checkGatesPassed(runDir: string): EligibilityCondition[] {
  const gatesDir = path.join(runDir, "gates");
  const conditions: EligibilityCondition[] = [];

  for (const gateId of REQUIRED_GATES) {
    const reportFile = path.join(gatesDir, `${gateId}.gate_report.json`);
    const conditionId = `gate_${gateId.toLowerCase()}`;
    const description = `Gate ${gateId} passed`;

    if (!fs.existsSync(reportFile)) {
      conditions.push({ conditionId, description, passed: false, detail: `Gate report not found: ${gateId}` });
      continue;
    }

    try {
      const report = JSON.parse(fs.readFileSync(reportFile, "utf-8"));
      const status = report.status;
      const passed = status === "pass";
      conditions.push({
        conditionId,
        description,
        passed,
        detail: passed ? `Gate ${gateId} status: ${status}` : `Gate ${gateId} did not pass (status: ${status})`,
      });
    } catch {
      conditions.push({ conditionId, description, passed: false, detail: `Failed to parse gate report for ${gateId}` });
    }
  }

  return conditions;
}

function checkCanonicalSpec(runDir: string): EligibilityCondition {
  const specPath = path.join(runDir, "canonical", "canonical_spec.json");
  const exists = fs.existsSync(specPath);
  let detail: string | undefined;
  if (exists) {
    try {
      const data = JSON.parse(fs.readFileSync(specPath, "utf-8"));
      if (data.spec_id) {
        detail = `Canonical spec found: ${data.spec_id}`;
      } else {
        detail = "Canonical spec exists but missing spec_id";
      }
    } catch {
      detail = "canonical_spec.json exists but is not valid JSON";
      return { conditionId: "canonical_spec", description: "Canonical spec present", passed: false, detail };
    }
  } else {
    detail = `File not found: ${specPath}`;
  }
  return { conditionId: "canonical_spec", description: "Canonical spec present", passed: exists, detail };
}

function checkWorkBreakdown(runDir: string): EligibilityCondition {
  const wbPath = path.join(runDir, "planning", "work_breakdown.json");
  const exists = fs.existsSync(wbPath);
  let detail: string | undefined;
  if (exists) {
    try {
      JSON.parse(fs.readFileSync(wbPath, "utf-8"));
      detail = "Work breakdown present and valid";
    } catch {
      detail = "work_breakdown.json exists but is not valid JSON";
      return { conditionId: "work_breakdown", description: "Work breakdown present", passed: false, detail };
    }
  } else {
    detail = `File not found: ${wbPath}`;
  }
  return { conditionId: "work_breakdown", description: "Work breakdown present", passed: exists, detail };
}

function checkRenderedDocs(runDir: string): EligibilityCondition {
  const renderedDir = path.join(runDir, "templates", "rendered_docs");
  const exists = fs.existsSync(renderedDir);
  let detail: string | undefined;
  if (exists) {
    try {
      const files = fs.readdirSync(renderedDir);
      if (files.length === 0) {
        detail = "rendered_docs directory is empty";
        return { conditionId: "rendered_docs", description: "Rendered documentation present", passed: false, detail };
      }
      detail = `${files.length} rendered documents found`;
    } catch {
      detail = "Could not read rendered_docs directory";
      return { conditionId: "rendered_docs", description: "Rendered documentation present", passed: false, detail };
    }
  } else {
    detail = `Directory not found: ${renderedDir}`;
  }
  return { conditionId: "rendered_docs", description: "Rendered documentation present", passed: exists, detail };
}

function checkNoCriticalBlockers(runDir: string): EligibilityCondition {
  const unknownsPath = path.join(runDir, "canonical", "unknowns.json");
  if (!fs.existsSync(unknownsPath)) {
    return { conditionId: "no_critical_blockers", description: "No critical unresolved blockers", passed: true, detail: "No unknowns file found (no blockers)" };
  }

  try {
    const data = JSON.parse(fs.readFileSync(unknownsPath, "utf-8"));
    const unknowns = Array.isArray(data) ? data : (data.unknowns || []);
    const critical = unknowns.filter((u: any) => u.severity === "critical" || u.blocking === true);
    if (critical.length > 0) {
      return {
        conditionId: "no_critical_blockers",
        description: "No critical unresolved blockers",
        passed: false,
        detail: `${critical.length} critical blocker(s) found`,
      };
    }
    return { conditionId: "no_critical_blockers", description: "No critical unresolved blockers", passed: true, detail: `${unknowns.length} unknowns, none critical` };
  } catch {
    return { conditionId: "no_critical_blockers", description: "No critical unresolved blockers", passed: true, detail: "Could not parse unknowns.json, treating as non-blocking" };
  }
}
