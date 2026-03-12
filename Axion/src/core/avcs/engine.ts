import * as fs from "fs";
import * as path from "path";
import { AVCSStore } from "./store.js";
import {
  evaluateBuildIntegrity,
  evaluateFunctional,
  evaluateSecurity,
  evaluatePerformance,
  evaluateDeploymentReadiness,
  evaluateUI,
  evaluateUX,
  evaluateAccessibility,
  evaluateEnterprise,
} from "./evaluators.js";
import type { EvaluatorContext } from "./evaluators.js";
import type {
  CertificationRun,
  CertificationRunType,
  CertificationDomain,
  CertificationVerdict,
  CertificationFinding,
  CertificationReport,
  CertificationEvidence,
  DomainResult,
  ScoreBreakdown,
  CoverageEntry,
  RemediationManifest,
  DOMAIN_WEIGHTS,
  RUN_TYPE_DOMAINS,
} from "./types.js";

import {
  DOMAIN_WEIGHTS as weights,
  RUN_TYPE_DOMAINS as runTypeDomains,
} from "./types.js";
import { buildTestPlan } from "./test-plan-builder.js";
import { getAdapterStatus } from "./tool-adapters.js";

const AXION_ROOT = path.resolve(
  fs.existsSync(path.join(process.cwd(), "Axion")) ? path.join(process.cwd(), "Axion") : process.cwd()
);

function getStore(): AVCSStore {
  return new AVCSStore(path.join(AXION_ROOT, "avcs_data"));
}

function getBuildDir(runId: string): string {
  const axionDir = fs.existsSync(path.join(AXION_ROOT, ".axion"))
    ? path.join(AXION_ROOT, ".axion")
    : path.join(AXION_ROOT, "Axion", ".axion");
  return path.join(axionDir, "runs", runId, "build");
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function planRun(
  assemblyId: number,
  runId: string,
  runType: CertificationRunType,
): CertificationRun {
  const store = getStore();
  const certRunId = store.generateRunId();
  const buildDir = getBuildDir(runId);

  const domains = runTypeDomains[runType] ?? runTypeDomains.full_certification;

  const run: CertificationRun = {
    id: certRunId,
    assembly_id: assemblyId,
    run_id: runId,
    run_type: runType,
    status: "planned",
    domains_evaluated: domains,
    target_build: buildDir,
    evidence_path: path.join(buildDir, "avcs_evidence"),
    created_at: new Date().toISOString(),
  };

  store.createRun(run);
  console.log(`[AVCS] Planned certification run ${certRunId} (${runType}) for assembly ${assemblyId}, build ${runId}`);
  return run;
}

export async function executeRun(certRunId: string): Promise<CertificationReport | null> {
  const store = getStore();
  const run = store.getRun(certRunId);
  if (!run) {
    console.error(`[AVCS] Run ${certRunId} not found`);
    return null;
  }

  run.status = "running";
  run.started_at = new Date().toISOString();
  store.updateRun(run);

  const buildDir = run.target_build;
  const repoDir = path.join(buildDir, "repo");

  if (!fs.existsSync(repoDir)) {
    console.error(`[AVCS] Build repo directory not found: ${repoDir}`);
    run.status = "failed";
    run.verdict = "BLOCKED";
    store.updateRun(run);
    return null;
  }

  console.log(`[AVCS] Executing certification run ${certRunId} against ${repoDir}`);
  console.log(`[AVCS] Domains to evaluate: ${run.domains_evaluated.join(", ")}`);

  const planFiles = loadPlanFiles(buildDir);
  const blueprintFeatures = loadBlueprintFeatures(buildDir);

  const allDomainResults: DomainResult[] = [];
  const allFindings: CertificationFinding[] = [];
  const allEvidence: CertificationEvidence[] = [];

  for (const domain of run.domains_evaluated) {
    console.log(`[AVCS] Evaluating domain: ${domain}`);

    const ctx: EvaluatorContext = {
      certRunId,
      buildDir,
      planFiles,
      blueprintFeatures,
      findingIdGenerator: () => store.generateFindingId(),
    };

    const evaluator = getEvaluator(domain);
    if (!evaluator) {
      console.log(`[AVCS]   Skipping domain ${domain}: no evaluator`);
      allDomainResults.push({
        domain,
        status: "skip",
        checks: [],
        findings_count: 0,
        coverage_state: "not_tested",
        score: 0,
        evidence_refs: [],
      });
      continue;
    }

    const output = evaluator(ctx);

    allDomainResults.push(output.result);
    for (const finding of output.findings) {
      store.addFinding(finding);
      allFindings.push(finding);
    }

    const evidence: CertificationEvidence = {
      id: store.generateEvidenceId(),
      cert_run_id: certRunId,
      domain,
      type: "summary",
      title: `${domain} evaluation summary`,
      content: JSON.stringify({
        status: output.result.status,
        score: output.result.score,
        checks_total: output.result.checks.length,
        checks_passed: output.result.checks.filter(c => c.result === "pass").length,
        checks_failed: output.result.checks.filter(c => c.result === "fail").length,
        findings: output.findings.length,
      }),
      created_at: new Date().toISOString(),
    };
    store.addEvidence(evidence);
    allEvidence.push(evidence);

    console.log(`[AVCS]   ${domain}: ${output.result.status} (score=${output.result.score}, findings=${output.findings.length})`);
  }

  const overallScore = computeOverallScore(allDomainResults, run.domains_evaluated);
  const verdict = computeVerdict(allDomainResults, allFindings, overallScore);
  const scoreBreakdown = computeScoreBreakdown(allDomainResults, run.domains_evaluated);
  const coverageSummary = computeCoverage(allDomainResults, planFiles);
  const hardStops = detectHardStops(allFindings, allDomainResults);
  const remediationManifest = computeRemediationManifest(allFindings, buildDir);

  const findingsSummary = {
    critical: allFindings.filter(f => f.severity === "critical").length,
    high: allFindings.filter(f => f.severity === "high").length,
    medium: allFindings.filter(f => f.severity === "medium").length,
    low: allFindings.filter(f => f.severity === "low").length,
    info: allFindings.filter(f => f.severity === "info").length,
    total: allFindings.length,
  };

  let finalVerdict = verdict;
  if (hardStops.length > 0) {
    const anyBlocked = allDomainResults.some(d => d.status === "blocked");
    finalVerdict = anyBlocked ? "BLOCKED" : "FAIL";
  }

  let testPlan;
  let adapterStatusList;
  try {
    testPlan = buildTestPlan(run.run_type, { mvpOnly: true });
    adapterStatusList = await getAdapterStatus();
  } catch (e) {
    console.log(`[AVCS] Warning: Could not build test plan or adapter status: ${e}`);
  }

  const report: CertificationReport = {
    id: `RPT-${certRunId}`,
    cert_run_id: certRunId,
    assembly_id: run.assembly_id,
    run_id: run.run_id,
    verdict: finalVerdict,
    domains: allDomainResults,
    findings_summary: findingsSummary,
    findings: allFindings,
    coverage_summary: coverageSummary,
    score_breakdown: scoreBreakdown,
    overall_score: overallScore,
    hard_stop_failures: hardStops,
    evidence_manifest: allEvidence.map(e => e.id),
    remediation_manifest: remediationManifest,
    test_plan: testPlan,
    adapter_status: adapterStatusList,
    created_at: new Date().toISOString(),
  };

  store.saveReport(report);

  run.status = "completed";
  run.completed_at = new Date().toISOString();
  run.verdict = report.verdict;
  run.score = overallScore;
  store.updateRun(run);

  console.log(`[AVCS] ═══ CERTIFICATION RESULT ═══`);
  console.log(`[AVCS]   Verdict:      ${report.verdict}`);
  console.log(`[AVCS]   Score:        ${overallScore.toFixed(1)}`);
  console.log(`[AVCS]   Findings:     ${findingsSummary.total} (critical=${findingsSummary.critical}, high=${findingsSummary.high}, medium=${findingsSummary.medium}, low=${findingsSummary.low})`);
  console.log(`[AVCS]   Hard stops:   ${hardStops.length}`);
  console.log(`[AVCS]   Remediation:  ${remediationManifest.total_files} files across ${remediationManifest.affected_unit_ids.length} units`);

  return report;
}

function getEvaluator(domain: CertificationDomain) {
  switch (domain) {
    case "build_integrity": return evaluateBuildIntegrity;
    case "functional": return evaluateFunctional;
    case "security": return evaluateSecurity;
    case "performance": return evaluatePerformance;
    case "deployment_readiness": return evaluateDeploymentReadiness;
    case "ui": return evaluateUI;
    case "ux": return evaluateUX;
    case "accessibility": return evaluateAccessibility;
    case "enterprise": return evaluateEnterprise;
    default: return null;
  }
}

function loadPlanFiles(buildDir: string): string[] {
  const planPath = path.join(buildDir, "build_plan.json");
  const plan = readJsonFile<any>(planPath);
  if (!plan?.slices) return [];
  const files: string[] = [];
  for (const slice of plan.slices) {
    if (slice.files) {
      for (const f of slice.files) {
        if (f.relativePath) files.push(f.relativePath);
      }
    }
  }
  return files;
}

function loadBlueprintFeatures(buildDir: string): string[] {
  const bpPath = path.join(buildDir, "repo_blueprint.json");
  const bp = readJsonFile<any>(bpPath);
  if (!bp?.feature_map) return [];
  return bp.feature_map.map((f: any) => f.name || f.feature_id || "").filter(Boolean);
}

function computeVerdict(
  domainResults: DomainResult[],
  findings: CertificationFinding[],
  weightedScore: number,
): CertificationVerdict {
  const hasCritical = findings.some(f => f.severity === "critical" && f.status === "open");
  const highCount = findings.filter(f => f.severity === "high" && f.status === "open").length;
  const hasBlocker = findings.some(f => f.impact === "release_blocker" && f.status === "open");
  const anyBlocked = domainResults.some(d => d.status === "blocked");

  if (anyBlocked) return "BLOCKED";
  if (hasCritical || hasBlocker) return "FAIL";

  if (weightedScore >= 80 && highCount === 0) return "PASS";
  if (weightedScore >= 70 && highCount <= 2) return "PASS_WITH_WARNINGS";
  if (weightedScore >= 60 && !hasCritical) return "CONDITIONAL_PASS";
  return "FAIL";
}

function computeOverallScore(
  domainResults: DomainResult[],
  evaluatedDomains: CertificationDomain[],
): number {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const dr of domainResults) {
    const w = weights[dr.domain] ?? 0.25;
    totalWeight += w;
    weightedSum += dr.score * w;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function computeScoreBreakdown(
  domainResults: DomainResult[],
  evaluatedDomains: CertificationDomain[],
): ScoreBreakdown[] {
  return domainResults.map(dr => ({
    domain: dr.domain,
    weight: weights[dr.domain] ?? 0.25,
    raw_score: dr.score,
    weighted_score: dr.score * (weights[dr.domain] ?? 0.25),
  }));
}

function computeCoverage(
  domainResults: DomainResult[],
  planFiles: string[],
): CoverageEntry[] {
  const entries: CoverageEntry[] = [];
  for (const dr of domainResults) {
    entries.push({
      surface_type: "domain",
      surface_id: dr.domain,
      surface_name: dr.domain.replace(/_/g, " "),
      state: dr.coverage_state,
      domain: dr.domain,
    });
  }

  const allDomains: CertificationDomain[] = ["build_integrity", "functional", "security", "performance", "deployment_readiness", "ui", "ux", "accessibility", "enterprise"];
  for (const d of allDomains) {
    if (!domainResults.find(dr => dr.domain === d)) {
      entries.push({
        surface_type: "domain",
        surface_id: d,
        surface_name: d.replace(/_/g, " "),
        state: "not_tested",
        domain: d,
      });
    }
  }

  return entries;
}

function detectHardStops(
  findings: CertificationFinding[],
  domainResults: DomainResult[],
): string[] {
  const stops: string[] = [];

  const criticals = findings.filter(f => f.severity === "critical" && f.status === "open");
  for (const c of criticals) {
    stops.push(`Critical finding: ${c.title}`);
  }

  const blockers = findings.filter(f => f.impact === "release_blocker" && f.status === "open");
  for (const b of blockers) {
    if (!criticals.find(c => c.id === b.id)) {
      stops.push(`Release blocker: ${b.title}`);
    }
  }

  for (const dr of domainResults) {
    if (dr.status === "blocked") {
      stops.push(`Domain blocked: ${dr.domain}`);
    }
  }

  return stops;
}

export function computeRemediationManifest(
  findings: CertificationFinding[],
  buildDir: string,
): RemediationManifest {
  const openFindings = findings.filter(f => f.status === "open" || f.status === "acknowledged");

  const directlyAffectedFiles = new Set<string>();
  const affectedFindingSummaries: RemediationManifest["affected_findings"] = [];

  for (const f of openFindings) {
    if (f.affected_files && f.affected_files.length > 0) {
      for (const file of f.affected_files) {
        directlyAffectedFiles.add(file);
      }
      affectedFindingSummaries.push({
        finding_id: f.id,
        title: f.title,
        severity: f.severity,
        affected_files: f.affected_files,
        remediation: f.remediation,
      });
    }
  }

  const affectedUnitIds = new Set<string>();
  const allFilesToRegenerate = new Set<string>(directlyAffectedFiles);
  const dependencyFiles = new Set<string>();

  const gseInventoryPath = path.join(buildDir, "generation_strategy", "build_unit_inventory.json");
  const gseInventory = readJsonFile<any[]>(gseInventoryPath);

  if (gseInventory && Array.isArray(gseInventory)) {
    const unitFileMap = new Map<string, string[]>();
    const unitDepMap = new Map<string, string[]>();
    const fileToUnit = new Map<string, string>();

    for (const unit of gseInventory) {
      unitFileMap.set(unit.id, unit.file_ids || []);
      unitDepMap.set(unit.id, unit.dependency_unit_ids || []);
    }

    const blueprintPath = path.join(buildDir, "repo_blueprint.json");
    const blueprint = readJsonFile<any>(blueprintPath);
    const fileIdToPath = new Map<string, string>();
    if (blueprint?.file_inventory) {
      for (const f of blueprint.file_inventory) {
        fileIdToPath.set(f.file_id, f.path);
      }
    }

    for (const unit of gseInventory) {
      const unitFilePaths = (unit.file_ids || []).map((fid: string) => fileIdToPath.get(fid) || fid);
      for (const fp of unitFilePaths) {
        fileToUnit.set(fp, unit.id);
      }
    }

    Array.from(directlyAffectedFiles).forEach(affectedFile => {
      const unitId = fileToUnit.get(affectedFile);
      if (unitId) {
        affectedUnitIds.add(unitId);
      }
    });

    Array.from(affectedUnitIds).forEach(unitId => {
      const unitFilePaths = (unitFileMap.get(unitId) || []).map((fid: string) => fileIdToPath.get(fid) || fid);
      for (const fp of unitFilePaths) {
        allFilesToRegenerate.add(fp);
      }
    });

    Array.from(affectedUnitIds).forEach(unitId => {
      const deps = unitDepMap.get(unitId) || [];
      for (const depId of deps) {
        affectedUnitIds.add(depId);
        const depFilePaths = (unitFileMap.get(depId) || []).map((fid: string) => fileIdToPath.get(fid) || fid);
        for (const fp of depFilePaths) {
          if (!allFilesToRegenerate.has(fp)) {
            dependencyFiles.add(fp);
            allFilesToRegenerate.add(fp);
          }
        }
      }
    });
  }

  if (affectedUnitIds.size === 0 && directlyAffectedFiles.size > 0) {
    const buildPlanPath = path.join(buildDir, "build_plan.json");
    const buildPlan = readJsonFile<any>(buildPlanPath);
    if (buildPlan?.slices && Array.isArray(buildPlan.slices)) {
      const fileToSlice = new Map<string, string>();
      for (const slice of buildPlan.slices) {
        const sliceId = slice.sliceId || slice.id || `slice-${slice.name || "unknown"}`;
        for (const f of (slice.files || [])) {
          fileToSlice.set(f.relativePath, sliceId);
        }
      }

      for (const affectedFile of directlyAffectedFiles) {
        const sliceId = fileToSlice.get(affectedFile);
        if (sliceId) {
          affectedUnitIds.add(sliceId);
        }
      }

      if (affectedUnitIds.size === 0) {
        const syntheticId = "remediation-direct-files";
        affectedUnitIds.add(syntheticId);
      }
    }
  }

  const totalPlannedFiles = loadPlanFiles(buildDir).length || 1;

  return {
    affected_findings: affectedFindingSummaries,
    directly_affected_files: Array.from(directlyAffectedFiles),
    affected_unit_ids: Array.from(affectedUnitIds),
    all_files_to_regenerate: Array.from(allFilesToRegenerate),
    dependency_files: Array.from(dependencyFiles),
    total_files: allFilesToRegenerate.size,
    estimated_scope_pct: Math.round((allFilesToRegenerate.size / totalPlannedFiles) * 100),
  };
}

export function getAVCSStatus(): { total_runs: number; completed_runs: number; latest_verdict?: CertificationVerdict; latest_run_id?: string; latest_score?: number } {
  const store = getStore();
  const runs = store.listRuns();
  const completed = runs.filter(r => r.status === "completed");
  const latest = completed.sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""))[0];

  return {
    total_runs: runs.length,
    completed_runs: completed.length,
    latest_verdict: latest?.verdict,
    latest_run_id: latest?.id,
    latest_score: latest?.score,
  };
}

export { AVCSStore, getStore };
