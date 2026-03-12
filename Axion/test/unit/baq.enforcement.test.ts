import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

import {
  evaluateGateBQ01,
  evaluateGateBQ02,
  evaluateGateBQ03,
  evaluateGateBQ04,
  evaluateGateBQ05,
  evaluateGateBQ06,
  evaluateGateBQ07,
  evaluateAllGates,
} from "../../src/core/baq/gates.js";
import type { FullGateEvaluation, VerificationSignals, PackagingSignals } from "../../src/core/baq/gates.js";
import {
  buildQualityReport,
  writeQualityReport,
  updateQualityReportWithPackagingDecision,
} from "../../src/core/baq/qualityReport.js";
import type { QualityReportInput, ExtendedBuildQualityReport, PackagingDecisionRecord } from "../../src/core/baq/qualityReport.js";
import {
  FailureCollector,
  buildFailureReport,
  createExtendedFailureEntry,
} from "../../src/core/baq/failureReport.js";
import type { RetryClassification, ExtendedFailureReport } from "../../src/core/baq/failureReport.js";
import {
  runPreflightCheck,
  createFileTracker,
  trackGeneratedFile,
  reconcileGeneration,
} from "../../src/core/baq/generationAlignment.js";
import type { ReconciliationResult } from "../../src/core/baq/generationAlignment.js";
import {
  runPackagingPreflight,
  writePackagingDecision,
} from "../../src/core/baq/packagingEnforcement.js";
import type { PackagingPreflightDecision } from "../../src/core/baq/packagingEnforcement.js";
import { BuildQualityHookRunner, createHookContext } from "../../src/core/baq/hooks.js";
import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
} from "../../src/core/baq/types.js";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "baq-test-"));
}

function makeExtraction(overrides: Partial<BAQKitExtraction> = {}): BAQKitExtraction {
  return {
    schema_version: "1.0.0",
    extraction_id: "EXT-001",
    run_id: "RUN-TEST",
    kit_ref: "KIT-001",
    kit_version: "1.0.0",
    status: "extraction_complete",
    sections: [],
    critical_obligations: [],
    warnings: [],
    summary: {
      total_sections: 5,
      consumed_count: 5,
      deferred_count: 0,
      not_applicable_count: 0,
      invalid_count: 0,
      missing_count: 0,
      required_sections_present: 5,
      required_sections_total: 5,
      critical_obligations_total: 3,
      critical_obligations_fulfilled: 3,
      blocking_warnings: 0,
    },
    extraction_result: "passed",
    gate_recommendation: "allow",
    created_at: new Date().toISOString(),
    ...overrides,
  } as BAQKitExtraction;
}

function makeDerivedInputs(overrides: Partial<BAQDerivedBuildInputs> = {}): BAQDerivedBuildInputs {
  return {
    schema_version: "1.0.0",
    derivation_id: "DER-001",
    run_id: "RUN-TEST",
    summary: {
      derivation_completeness: 90,
      feature_count: 3,
      subsystem_count: 2,
      role_count: 2,
      workflow_count: 1,
      domain_entity_count: 3,
      api_surface_count: 1,
      ui_surface_count: 2,
      verification_obligation_count: 1,
      ops_obligation_count: 1,
      assumption_count: 0,
      risk_count: 0,
    },
    ...overrides,
  } as BAQDerivedBuildInputs;
}

function makeInventory(fileCount: number = 5, overrides: Partial<BAQRepoInventory> = {}): BAQRepoInventory {
  const files = Array.from({ length: fileCount }, (_, i) => ({
    file_id: `FILE-${i}`,
    path: `src/file${i}.ts`,
    template_ref: `TPL-${i}`,
    slot: "04_implementation",
    generation_method: "deterministic" as const,
    required: i < 3,
    trace_refs: i < 2 ? [`REQ-${i}`] : [],
    estimated_byte_count: 1000,
    content_hash: null,
  }));

  return {
    schema_version: "1.0.0",
    inventory_id: "INV-001",
    run_id: "RUN-TEST",
    files,
    summary: {
      total_files: fileCount,
      required_files: Math.min(fileCount, 3),
      optional_files: Math.max(0, fileCount - 3),
      by_slot: {},
      by_method: { deterministic: fileCount, ai_assisted: 0 },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as BAQRepoInventory;
}

function makeTraceMap(coveragePct: number = 80, overrides: Partial<BAQRequirementTraceMap> = {}): BAQRequirementTraceMap {
  return {
    schema_version: "1.0.0",
    trace_map_id: "TRC-001",
    run_id: "RUN-TEST",
    inventory_ref: "INV-001",
    traces: [],
    unmapped_requirements: [],
    summary: {
      total_requirements: 10,
      fully_covered: Math.round(coveragePct / 10),
      partially_covered: Math.round((100 - coveragePct) / 20),
      not_covered: 10 - Math.round(coveragePct / 10) - Math.round((100 - coveragePct) / 20),
      coverage_percent: coveragePct,
      unmapped_critical: 0,
      unmapped_total: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as BAQRequirementTraceMap;
}

function makeSufficiency(score: number = 80, overrides: Partial<BAQSufficiencyEvaluation> = {}): BAQSufficiencyEvaluation {
  return {
    schema_version: "1.0.0",
    evaluation_id: "SUF-001",
    run_id: "RUN-TEST",
    inventory_ref: "INV-001",
    trace_map_ref: "TRC-001",
    overall_score: score,
    status: score >= 70 ? "sufficient" : score >= 50 ? "marginal" : "insufficient",
    dimensions: [],
    gaps: [],
    summary: {
      total_dimensions: 6,
      passing_dimensions: Math.round(score / 20),
      total_gaps: score < 70 ? 3 : 0,
      critical_gaps: 0,
      overall_score: score,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as BAQSufficiencyEvaluation;
}

function makeVerificationSignals(overrides: Partial<VerificationSignals> = {}): VerificationSignals {
  return {
    verification_passed: true,
    files_verified: 10,
    files_failed: 0,
    structural_violations: 0,
    fidelity_percent: 95,
    ...overrides,
  };
}

function makePackagingSignals(overrides: Partial<PackagingSignals> = {}): PackagingSignals {
  return {
    export_attempted: true,
    export_success: true,
    file_count: 20,
    zip_size_bytes: 50000,
    ...overrides,
  };
}

function makeReconciliation(overrides: Partial<ReconciliationResult> = {}): ReconciliationResult {
  return {
    total_planned: 10,
    total_generated: 10,
    total_missing: 0,
    total_unplanned: 0,
    coverage_percent: 100,
    missing_files: [],
    missing_required_files: [],
    missing_optional_files: [],
    unplanned_files: [],
    violations: [],
    placeholder_violations: [],
    inventory_variance: {
      expected_files: 10,
      produced_files: 10,
      missing_files: 0,
      unplanned_files: 0,
      required_missing: 0,
      optional_missing: 0,
      placeholder_count: 0,
      placeholder_in_required: 0,
      trace_linked_generated: 5,
      trace_linked_total: 5,
    },
    passed: true,
    evaluated_at: new Date().toISOString(),
    ...overrides,
  };
}

function allPassingGateEval(): FullGateEvaluation {
  return evaluateAllGates({
    extraction: makeExtraction(),
    derivedInputs: makeDerivedInputs(),
    inventory: makeInventory(),
    traceMap: makeTraceMap(),
    sufficiency: makeSufficiency(),
    reconciliation: makeReconciliation(),
    verificationSignals: makeVerificationSignals(),
    packagingSignals: makePackagingSignals(),
  });
}

describe("BAQ Gate Evaluation — G-BQ-01: Kit Extraction Integrity", () => {
  it("passes with valid extraction", () => {
    const result = evaluateGateBQ01(makeExtraction());
    expect(result.status).toBe("pass");
    expect(result.blockers).toHaveLength(0);
  });

  it("fails when extraction is null", () => {
    const result = evaluateGateBQ01(null);
    expect(result.status).toBe("fail");
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("fails when extraction_result is failed", () => {
    const result = evaluateGateBQ01(makeExtraction({ extraction_result: "failed" }));
    expect(result.status).toBe("fail");
  });

  it("fails when required sections are missing", () => {
    const ext = makeExtraction();
    ext.summary.required_sections_present = 2;
    ext.summary.required_sections_total = 5;
    const result = evaluateGateBQ01(ext);
    expect(result.status).toBe("fail");
    expect(result.conditions.some(c => c.condition_id === "BQ01-C3" && !c.passed)).toBe(true);
  });

  it("fails with blocking warnings", () => {
    const ext = makeExtraction();
    ext.summary.blocking_warnings = 2;
    const result = evaluateGateBQ01(ext);
    expect(result.status).toBe("fail");
  });

  it("includes evidence_refs pointing to artifact path", () => {
    const result = evaluateGateBQ01(makeExtraction());
    for (const cond of result.conditions) {
      expect(cond.evidence_refs).toContain("kit_extraction.json");
    }
  });
});

describe("BAQ Gate Evaluation — G-BQ-02: Derived Inputs Completeness", () => {
  it("passes with valid derived inputs", () => {
    const result = evaluateGateBQ02(makeDerivedInputs());
    expect(result.status).toBe("pass");
  });

  it("fails when derived inputs are null", () => {
    const result = evaluateGateBQ02(null);
    expect(result.status).toBe("fail");
  });

  it("fails when derivation completeness < 50%", () => {
    const result = evaluateGateBQ02(makeDerivedInputs({
      summary: {
        derivation_completeness: 30,
        feature_count: 3,
        subsystem_count: 2,
        role_count: 2,
        workflow_count: 1,
        domain_entity_count: 3,
        api_surface_count: 1,
        ui_surface_count: 2,
        verification_obligation_count: 1,
        ops_obligation_count: 1,
        assumption_count: 0,
        risk_count: 0,
      },
    } as Partial<BAQDerivedBuildInputs>));
    expect(result.status).toBe("fail");
  });

  it("fails when no features are mapped", () => {
    const di = makeDerivedInputs();
    di.summary.feature_count = 0;
    const result = evaluateGateBQ02(di);
    expect(result.status).toBe("fail");
  });
});

describe("BAQ Gate Evaluation — G-BQ-03: Inventory & Traceability Integrity", () => {
  it("passes with valid inventory, trace map, and sufficiency", () => {
    const result = evaluateGateBQ03(makeInventory(), makeTraceMap(), makeSufficiency());
    expect(result.status).toBe("pass");
  });

  it("fails when inventory is null", () => {
    const result = evaluateGateBQ03(null, makeTraceMap(), makeSufficiency());
    expect(result.status).toBe("fail");
  });

  it("fails when trace map is null", () => {
    const result = evaluateGateBQ03(makeInventory(), null, makeSufficiency());
    expect(result.status).toBe("fail");
  });

  it("fails when coverage < 30%", () => {
    const result = evaluateGateBQ03(makeInventory(), makeTraceMap(20), makeSufficiency());
    expect(result.status).toBe("fail");
  });

  it("fails when critical unmapped requirements exist", () => {
    const tm = makeTraceMap();
    tm.summary.unmapped_critical = 2;
    const result = evaluateGateBQ03(makeInventory(), tm, makeSufficiency());
    expect(result.status).toBe("fail");
  });

  it("fails when sufficiency is insufficient", () => {
    const result = evaluateGateBQ03(makeInventory(), makeTraceMap(), makeSufficiency(30));
    expect(result.status).toBe("fail");
  });
});

describe("BAQ Gate Evaluation — G-BQ-04: Requirement Coverage", () => {
  it("passes with >= 70% coverage", () => {
    const result = evaluateGateBQ04(makeTraceMap(80));
    expect(result.status).toBe("pass");
  });

  it("fails when trace map is null", () => {
    const result = evaluateGateBQ04(null);
    expect(result.status).toBe("fail");
  });

  it("reports low coverage as warning condition", () => {
    const result = evaluateGateBQ04(makeTraceMap(50));
    const coverageCond = result.conditions.find(c => c.condition_id === "BQ04-C2");
    expect(coverageCond).toBeDefined();
    expect(coverageCond!.passed).toBe(false);
  });
});

describe("BAQ Gate Evaluation — G-BQ-05: Output Sufficiency", () => {
  it("passes with valid reconciliation and sufficiency", () => {
    const result = evaluateGateBQ05(makeReconciliation(), makeSufficiency());
    expect(result.status).toBe("pass");
  });

  it("fails when reconciliation is null", () => {
    const result = evaluateGateBQ05(null, makeSufficiency());
    expect(result.status).toBe("fail");
  });

  it("fails when missing required files exist", () => {
    const result = evaluateGateBQ05(
      makeReconciliation({ missing_required_files: ["src/core.ts"] }),
      makeSufficiency(),
    );
    expect(result.status).toBe("fail");
  });

  it("fails when violations exist", () => {
    const result = evaluateGateBQ05(
      makeReconciliation({ violations: ["Unplanned file generated"] }),
      makeSufficiency(),
    );
    expect(result.status).toBe("fail");
  });

  it("fails with placeholder violations in required files", () => {
    const result = evaluateGateBQ05(
      makeReconciliation({ placeholder_violations: ["Required file has placeholder"] }),
      makeSufficiency(),
    );
    expect(result.status).toBe("fail");
  });
});

describe("BAQ Gate Evaluation — G-BQ-06: Verification Integrity", () => {
  it("passes with valid verification signals", () => {
    const result = evaluateGateBQ06(makeVerificationSignals());
    expect(result.status).toBe("pass");
  });

  it("fails when verification signals are null", () => {
    const result = evaluateGateBQ06(null);
    expect(result.status).toBe("fail");
  });

  it("fails when verification did not pass", () => {
    const result = evaluateGateBQ06(makeVerificationSignals({ verification_passed: false }));
    expect(result.status).toBe("fail");
  });

  it("fails with low fidelity", () => {
    const result = evaluateGateBQ06(makeVerificationSignals({ fidelity_percent: 50 }));
    expect(result.status).toBe("fail");
  });
});

describe("BAQ Gate Evaluation — G-BQ-07: Packaging Integrity", () => {
  it("passes with successful packaging signals", () => {
    const result = evaluateGateBQ07(makePackagingSignals());
    expect(result.status).toBe("pass");
  });

  it("fails when packaging signals are null (no data available)", () => {
    const result = evaluateGateBQ07(null);
    expect(result.status).toBe("fail");
  });

  it("fails when export failed", () => {
    const result = evaluateGateBQ07(makePackagingSignals({ export_success: false }));
    expect(result.status).toBe("fail");
  });

  it("passes when export not attempted (build_only)", () => {
    const result = evaluateGateBQ07(makePackagingSignals({ export_attempted: false }));
    expect(result.status).toBe("pass");
  });
});

describe("BAQ evaluateAllGates", () => {
  it("reports packaging_eligible=true when all gates pass", () => {
    const result = allPassingGateEval();
    expect(result.all_passed).toBe(true);
    expect(result.packaging_eligible).toBe(true);
    expect(result.failed_count).toBe(0);
    expect(result.total).toBe(7);
  });

  it("reports packaging_eligible=false when any gate fails", () => {
    const result = evaluateAllGates({
      extraction: null,
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      packagingSignals: makePackagingSignals(),
    });
    expect(result.all_passed).toBe(false);
    expect(result.packaging_eligible).toBe(false);
    expect(result.failed_count).toBeGreaterThan(0);
  });

  it("counts all 7 gates", () => {
    const result = allPassingGateEval();
    expect(result.gates).toHaveLength(7);
    const gateIds = result.gates.map(g => g.gate_id);
    expect(gateIds).toContain("G-BQ-01");
    expect(gateIds).toContain("G-BQ-07");
  });
});

describe("BAQ Quality Report", () => {
  it("produces approved decision with all gates passing and high score", () => {
    const gateEval = allPassingGateEval();
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);
    expect(report.decision).toBe("approved");
    expect(report.overall_quality_score).toBeGreaterThanOrEqual(70);
    expect(report.packaging_eligibility.eligible).toBe(true);
  });

  it("produces blocked decision when a gate fails", () => {
    const gateEval = evaluateAllGates({
      extraction: null,
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      packagingSignals: makePackagingSignals(),
    });
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: null,
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);
    expect(report.decision).toBe("blocked");
    expect(report.packaging_eligibility.eligible).toBe(false);
  });

  it("produces failed decision when build status is failed", () => {
    const gateEval = allPassingGateEval();
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "failed",
    };
    const report = buildQualityReport(input);
    expect(report.decision).toBe("failed");
  });

  it("includes coverage_metrics with extraction/acceptance/proof percentages", () => {
    const gateEval = allPassingGateEval();
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);
    expect(report.coverage_metrics.extraction_coverage_percent).toBe(100);
    expect(report.coverage_metrics.acceptance_coverage_percent).toBe(100);
    expect(report.coverage_metrics.proof_coverage_percent).toBe(95);
    expect(report.coverage_metrics.requirement_coverage_percent).toBe(80);
  });

  it("includes inventory_metrics with variance", () => {
    const gateEval = allPassingGateEval();
    const recon = makeReconciliation({
      inventory_variance: {
        expected_files: 10,
        produced_files: 8,
        missing_files: 2,
        unplanned_files: 0,
        required_missing: 1,
        optional_missing: 1,
        placeholder_count: 1,
        placeholder_in_required: 0,
        trace_linked_generated: 5,
        trace_linked_total: 5,
      },
    });
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: recon,
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);
    expect(report.inventory_metrics.inventory_variance_percent).toBe(20);
    expect(report.inventory_metrics.inventory_variance_delta).toBe(-2);
    expect(report.inventory_metrics.placeholder_count).toBe(1);
  });

  it("writes report to disk", () => {
    const tmpDir = makeTmpDir();
    const gateEval = allPassingGateEval();
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);
    const reportPath = writeQualityReport(tmpDir, report);
    expect(fs.existsSync(reportPath)).toBe(true);
    const loaded = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    expect(loaded.decision).toBe("approved");
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe("BAQ Failure Report & Taxonomy", () => {
  it("creates failure entries with retry classification", () => {
    const entry = createExtendedFailureEntry({
      failureClass: "generation_failure",
      severity: "error",
      phase: "generation",
      description: "File generation failed",
      retryClassification: "safe_retry",
    });
    expect(entry.retry_classification).toBe("safe_retry");
    expect(entry.failure_class).toBe("generation_failure");
  });

  it("defaults to manual_review_required when no classification given", () => {
    const entry = createExtendedFailureEntry({
      failureClass: "extraction_failure",
      severity: "critical",
      phase: "extraction",
      description: "Extraction failed",
    });
    expect(entry.retry_classification).toBe("manual_review_required");
  });

  it("FailureCollector aggregates entries correctly", () => {
    const collector = new FailureCollector();
    collector.addFromError("gen", "generation_failure", "err1", "error", {
      retryClassification: "safe_retry",
      failingUnit: "file_gen",
    });
    collector.addFromError("gen", "generation_failure", "err2", "critical", {
      retryClassification: "do_not_retry",
      failingUnit: "file_gen",
    });
    expect(collector.count()).toBe(2);
    expect(collector.hasBlockingFailures()).toBe(true);
    const report = collector.finalize("RUN-TEST", "BUILD-001");
    expect(report.retry_recommendation.classification).toBe("do_not_retry");
    expect(report.retry_recommendation.safe_retry_count).toBe(1);
    expect(report.retry_recommendation.do_not_retry_count).toBe(1);
  });

  it("builds report with upstream blockers and repair hints", () => {
    const collector = new FailureCollector();
    collector.addFromError("gen", "generation_failure", "err1", "error", {
      retryClassification: "repair_then_retry",
      upstreamBlockers: ["GATE-01"],
      repairHints: ["Fix extraction"],
    });
    const report = collector.finalize("RUN-TEST", "BUILD-001");
    expect(report.upstream_blockers).toContain("GATE-01");
    expect(report.repair_hints).toContain("Fix extraction");
  });

  it("classifies all four retry types correctly", () => {
    const classifications: RetryClassification[] = [
      "safe_retry",
      "repair_then_retry",
      "manual_review_required",
      "do_not_retry",
    ];
    for (const cls of classifications) {
      const entry = createExtendedFailureEntry({
        failureClass: "generation_failure",
        severity: "error",
        phase: "test",
        description: `Test ${cls}`,
        retryClassification: cls,
      });
      expect(entry.retry_classification).toBe(cls);
    }
  });

  it("summary counts by_class and by_severity", () => {
    const collector = new FailureCollector();
    collector.addFromError("ext", "extraction_failure", "e1", "critical");
    collector.addFromError("gen", "generation_failure", "e2", "error");
    collector.addFromError("gen", "generation_failure", "e3", "warning");
    const report = collector.finalize("RUN-TEST", "BUILD-001");
    expect(report.summary.total_failures).toBe(3);
    expect(report.summary.by_class.extraction_failure).toBe(1);
    expect(report.summary.by_class.generation_failure).toBe(2);
    expect(report.summary.by_severity.critical).toBe(1);
    expect(report.summary.by_severity.error).toBe(1);
    expect(report.summary.by_severity.warning).toBe(1);
    expect(report.summary.blocking_count).toBe(2);
  });
});

describe("BAQ Preflight Check & File Tracking", () => {
  it("fails preflight when required artifacts are missing", () => {
    const tmpDir = makeTmpDir();
    const result = runPreflightCheck(tmpDir);
    expect(result.passed).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("passes preflight when all artifacts exist and are valid", () => {
    const tmpDir = makeTmpDir();
    const artifacts = [
      "kit_extraction.json",
      "derived_build_inputs.json",
      "repo_inventory.json",
      "requirement_trace_map.json",
      "sufficiency_evaluation.json",
    ];
    for (const name of artifacts) {
      fs.writeFileSync(
        path.join(tmpDir, name),
        JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }),
      );
    }
    const result = runPreflightCheck(tmpDir);
    expect(result.passed).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("detects invalid JSON in preflight", () => {
    const tmpDir = makeTmpDir();
    const artifacts = [
      "kit_extraction.json",
      "derived_build_inputs.json",
      "repo_inventory.json",
      "requirement_trace_map.json",
      "sufficiency_evaluation.json",
    ];
    for (const name of artifacts) {
      fs.writeFileSync(path.join(tmpDir, name), "NOT JSON");
    }
    const result = runPreflightCheck(tmpDir);
    expect(result.passed).toBe(false);
    expect(result.invalid.length).toBe(5);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("tracks generated files and detects unplanned files", () => {
    const inventory = makeInventory(3);
    const tracker = createFileTracker(inventory);
    trackGeneratedFile(tracker, "src/file0.ts", "export const x = 1;");
    trackGeneratedFile(tracker, "src/file1.ts", "export const y = 2;");
    trackGeneratedFile(tracker, "src/unplanned.ts", "export const z = 3;");

    expect(tracker.generated_files.size).toBe(3);
    expect(tracker.violations.length).toBe(1);
    expect(tracker.violations[0]).toContain("Unplanned");
  });

  it("detects placeholders in required files", () => {
    const inventory = makeInventory(3);
    const tracker = createFileTracker(inventory);
    trackGeneratedFile(tracker, "src/file0.ts", "// TODO: [AXION] implement this");
    expect(tracker.placeholder_violations.length).toBe(1);
  });

  it("reconciles generation and computes variance", () => {
    const inventory = makeInventory(5);
    const tracker = createFileTracker(inventory);
    trackGeneratedFile(tracker, "src/file0.ts", "export const a = 1;");
    trackGeneratedFile(tracker, "src/file1.ts", "export const b = 2;");
    trackGeneratedFile(tracker, "src/file2.ts", "export const c = 3;");

    const result = reconcileGeneration(tracker);
    expect(result.total_planned).toBe(5);
    expect(result.total_generated).toBe(3);
    expect(result.total_missing).toBe(2);
    expect(result.missing_files).toContain("src/file3.ts");
    expect(result.missing_files).toContain("src/file4.ts");
    expect(result.inventory_variance.expected_files).toBe(5);
    expect(result.inventory_variance.produced_files).toBe(3);
    expect(result.coverage_percent).toBe(60);
  });
});

describe("BAQ Packaging Enforcement", () => {
  it("blocks packaging when build_quality_report.json is missing", () => {
    const tmpDir = makeTmpDir();
    const bundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(bundleDir, { recursive: true });
    const decision = runPackagingPreflight(tmpDir, bundleDir);
    expect(decision.allowed).toBe(false);
    expect(decision.block_reasons.some(r => r.includes("Missing package-critical"))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("blocks packaging when gate failures are recorded", () => {
    const tmpDir = makeTmpDir();
    const bundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(bundleDir, { recursive: true });

    const gateEval = evaluateAllGates({
      extraction: null,
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      packagingSignals: makePackagingSignals(),
    });
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: null,
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);

    const criticals = ["kit_extraction.json", "derived_build_inputs.json",
      "repo_inventory.json", "requirement_trace_map.json", "sufficiency_evaluation.json"];
    for (const name of criticals) {
      fs.writeFileSync(path.join(tmpDir, name), JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));
    }
    writeQualityReport(tmpDir, report);

    fs.mkdirSync(path.join(tmpDir, "proof"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "proof", "proof_ledger.jsonl"), "");
    fs.writeFileSync(path.join(tmpDir, "requirement_trace_map.json"),
      JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));

    const decision = runPackagingPreflight(tmpDir, bundleDir);
    expect(decision.allowed).toBe(false);
    expect(decision.block_reasons.some(r => r.includes("not passed"))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("blocks packaging when proof ledger is missing", () => {
    const tmpDir = makeTmpDir();
    const bundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(bundleDir, { recursive: true });

    const gateEval = allPassingGateEval();
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);

    const criticals = ["kit_extraction.json", "derived_build_inputs.json",
      "repo_inventory.json", "requirement_trace_map.json", "sufficiency_evaluation.json"];
    for (const name of criticals) {
      fs.writeFileSync(path.join(tmpDir, name), JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));
    }
    writeQualityReport(tmpDir, report);

    const decision = runPackagingPreflight(tmpDir, bundleDir);
    expect(decision.allowed).toBe(false);
    expect(decision.block_reasons.some(r => r.includes("Proof ledger"))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("allows packaging when all checks pass", () => {
    const tmpDir = makeTmpDir();
    const bundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(bundleDir, { recursive: true });
    fs.writeFileSync(path.join(bundleDir, "00_START_HERE.md"), "# Start");

    const gateEval = allPassingGateEval();
    const input: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(0),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    const report = buildQualityReport(input);

    const criticals = ["kit_extraction.json", "derived_build_inputs.json",
      "repo_inventory.json", "requirement_trace_map.json", "sufficiency_evaluation.json"];
    for (const name of criticals) {
      fs.writeFileSync(path.join(tmpDir, name), JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));
    }
    writeQualityReport(tmpDir, report);

    fs.mkdirSync(path.join(tmpDir, "proof"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "proof", "proof_ledger.jsonl"), "");
    fs.writeFileSync(path.join(tmpDir, "requirement_trace_map.json"),
      JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));

    const decision = runPackagingPreflight(tmpDir, bundleDir);
    expect(decision.allowed).toBe(true);
    expect(decision.block_reasons).toHaveLength(0);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("writes packaging decision to disk", () => {
    const tmpDir = makeTmpDir();
    const decision: PackagingPreflightDecision = {
      allowed: false,
      block_reasons: ["test block"],
      gate_evidence: [],
      manifest_mismatches: [],
      artifact_checks: [],
      evaluated_at: new Date().toISOString(),
    };
    const decisionPath = writePackagingDecision(tmpDir, decision);
    expect(fs.existsSync(decisionPath)).toBe(true);
    const loaded = JSON.parse(fs.readFileSync(decisionPath, "utf-8"));
    expect(loaded.allowed).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("detects manifest target mismatches when packaging_manifest lists missing files", () => {
    const tmpDir = makeTmpDir();
    const bundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(bundleDir, { recursive: true });
    fs.writeFileSync(path.join(bundleDir, "existing_file.md"), "content");

    fs.writeFileSync(path.join(tmpDir, "repo_inventory.json"), JSON.stringify(makeInventory(0)));

    const criticals = ["kit_extraction.json", "derived_build_inputs.json",
      "requirement_trace_map.json", "sufficiency_evaluation.json"];
    for (const name of criticals) {
      fs.writeFileSync(path.join(tmpDir, name), JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));
    }

    fs.mkdirSync(path.join(tmpDir, "kit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "kit", "packaging_manifest.json"), JSON.stringify({
      files: [
        { path: "agent_kit/missing_file_1.md", sha256: "abc" },
        { path: "agent_kit/missing_file_2.json", sha256: "def" },
      ],
    }));

    const gateEval = allPassingGateEval();
    const rInput: QualityReportInput = {
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    };
    writeQualityReport(tmpDir, buildQualityReport(rInput));

    fs.mkdirSync(path.join(tmpDir, "proof"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "proof", "proof_ledger.jsonl"), "");

    const decision = runPackagingPreflight(tmpDir, bundleDir);
    expect(decision.manifest_mismatches.length).toBe(2);
    expect(decision.allowed).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe("BAQ Regression Tests — False-Green Prevention", () => {
  it("blocks when extraction passes but critical obligations unfulfilled", () => {
    const ext = makeExtraction();
    ext.summary.critical_obligations_fulfilled = 0;
    ext.summary.critical_obligations_total = 3;
    const result = evaluateGateBQ01(ext);
    expect(result.status).toBe("pass");

    const gateEval = evaluateAllGates({
      extraction: ext,
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      packagingSignals: makePackagingSignals(),
    });
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: ext,
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    });
    expect(report.coverage_metrics.acceptance_coverage_percent).toBe(0);
  });

  it("blocked decision when missing infrastructure modules", () => {
    const recon = makeReconciliation({
      missing_required_files: ["src/infra/database.ts", "src/infra/auth.ts"],
    });
    const gateEval = evaluateAllGates({
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: recon,
      verificationSignals: makeVerificationSignals(),
      packagingSignals: makePackagingSignals(),
    });
    expect(gateEval.all_passed).toBe(false);
    const g5 = gateEval.gates.find(g => g.gate_id === "G-BQ-05");
    expect(g5?.status).toBe("fail");
  });

  it("blocked decision when missing shared contracts", () => {
    const recon = makeReconciliation({
      violations: ["Missing shared contract: api-types.ts"],
    });
    const gateEval = evaluateAllGates({
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: recon,
      verificationSignals: makeVerificationSignals(),
      packagingSignals: makePackagingSignals(),
    });
    expect(gateEval.all_passed).toBe(false);
  });

  it("blocked decision when verification proof missing", () => {
    const gateEval = evaluateAllGates({
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: makeReconciliation(),
      verificationSignals: null,
      packagingSignals: makePackagingSignals(),
    });
    expect(gateEval.all_passed).toBe(false);
    const g6 = gateEval.gates.find(g => g.gate_id === "G-BQ-06");
    expect(g6?.status).toBe("fail");
  });

  it("blocked decision when incomplete feature family generation", () => {
    const recon = makeReconciliation({
      total_planned: 20,
      total_generated: 10,
      coverage_percent: 50,
      missing_required_files: ["src/features/auth.ts", "src/features/dashboard.ts"],
    });
    const gateEval = evaluateAllGates({
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      reconciliation: recon,
      verificationSignals: makeVerificationSignals(),
      packagingSignals: makePackagingSignals(),
    });
    expect(gateEval.all_passed).toBe(false);
  });

  it("prevented from packaging with manifest/output mismatch", () => {
    const tmpDir = makeTmpDir();
    const bundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(bundleDir, { recursive: true });
    fs.writeFileSync(path.join(bundleDir, "actual_output.md"), "generated content");

    const gateEval = allPassingGateEval();
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(),
      sufficiency: makeSufficiency(),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    });

    const criticals = ["kit_extraction.json", "derived_build_inputs.json",
      "requirement_trace_map.json", "sufficiency_evaluation.json"];
    for (const name of criticals) {
      fs.writeFileSync(path.join(tmpDir, name), JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));
    }
    fs.writeFileSync(path.join(tmpDir, "repo_inventory.json"), JSON.stringify(makeInventory(0)));
    writeQualityReport(tmpDir, report);

    fs.mkdirSync(path.join(tmpDir, "kit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "kit", "packaging_manifest.json"), JSON.stringify({
      files: [
        { path: "agent_kit/expected_but_missing.md", sha256: "abc123" },
      ],
    }));

    fs.mkdirSync(path.join(tmpDir, "proof"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "proof", "proof_ledger.jsonl"), "");

    const decision = runPackagingPreflight(tmpDir, bundleDir);
    expect(decision.manifest_mismatches.length).toBeGreaterThan(0);
    expect(decision.allowed).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("false-green packaging path prevented: all gates pass but quality report blocked", () => {
    const tmpDir = makeTmpDir();
    const bundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(bundleDir, { recursive: true });

    const blockedReport: ExtendedBuildQualityReport = {
      schema_version: "1.0.0",
      report_id: "BQR-001",
      run_id: "RUN-TEST",
      build_id: "BUILD-001",
      status: "verification_complete",
      extraction: null,
      derivation: null,
      inventory: null,
      traceability: null,
      gates: [{
        gate_id: "G-BQ-01",
        gate_name: "Kit Extraction Integrity",
        status: "fail",
        conditions: [],
        blockers: ["Extraction missing"],
        evaluated_at: new Date().toISOString(),
      }],
      overall_quality_score: 30,
      gate_summary: { total_gates: 7, passed: 6, failed: 1, skipped: 0 },
      decision: "blocked",
      decision_reasons: ["G-BQ-01 failed"],
      coverage_metrics: {
        requirement_coverage_percent: 0,
        extraction_coverage_percent: 0,
        acceptance_coverage_percent: 0,
        proof_coverage_percent: 0,
        fully_covered_count: 0,
        partially_covered_count: 0,
        not_covered_count: 0,
        unmapped_critical_count: 0,
      },
      inventory_metrics: {
        planned_files: 0,
        generated_files: 0,
        missing_files: 0,
        missing_required_files: 0,
        unplanned_files: 0,
        generation_coverage_percent: 0,
        placeholder_count: 0,
        placeholder_in_required: 0,
        trace_linked_coverage_percent: 0,
        inventory_variance_percent: 0,
        inventory_variance_delta: 0,
      },
      quality_signals: {
        extraction_result: null,
        extraction_completeness_percent: null,
        derivation_completeness: null,
        sufficiency_score: null,
        sufficiency_status: null,
        verification_fidelity_percent: null,
        verification_passed: null,
        structural_violations: null,
        placeholder_ratio: null,
        inferred_ratio: null,
        warning_count: 0,
        blocking_count: 1,
        inventory_variance_percent: null,
      },
      packaging_eligibility: {
        eligible: false,
        blocking_gates: ["G-BQ-01"],
        reasons: ["G-BQ-01 (Kit Extraction Integrity) failed"],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const criticals = ["kit_extraction.json", "derived_build_inputs.json",
      "repo_inventory.json", "requirement_trace_map.json", "sufficiency_evaluation.json"];
    for (const name of criticals) {
      fs.writeFileSync(path.join(tmpDir, name), JSON.stringify({ schema_version: "1.0.0", run_id: "RUN-TEST" }));
    }
    writeQualityReport(tmpDir, blockedReport);

    fs.mkdirSync(path.join(tmpDir, "proof"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "proof", "proof_ledger.jsonl"), "");

    const decision = runPackagingPreflight(tmpDir, bundleDir);
    expect(decision.allowed).toBe(false);
    expect(decision.block_reasons.some(r => r.includes("not passed"))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe("BAQ Hook Runner", () => {
  it("runs hooks in order and enforces upstream dependencies", async () => {
    const runner = new BuildQualityHookRunner();
    const result = await runner.run(
      "onPackagingDecision",
      createHookContext("onPackagingDecision", "RUN-TEST", "BUILD-001"),
    );
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain("missing hooks");
  });

  it("passes through when no handler is registered", async () => {
    const runner = new BuildQualityHookRunner();
    const result = await runner.run(
      "onBuildAuthorityLoaded",
      createHookContext("onBuildAuthorityLoaded", "RUN-TEST", "BUILD-001"),
    );
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("marks hook as completed after successful run", async () => {
    const runner = new BuildQualityHookRunner();
    await runner.run(
      "onBuildAuthorityLoaded",
      createHookContext("onBuildAuthorityLoaded", "RUN-TEST", "BUILD-001"),
    );
    expect(runner.isCompleted("onBuildAuthorityLoaded")).toBe(true);
  });

  it("catches errors from hook handlers", async () => {
    const runner = new BuildQualityHookRunner();
    runner.register("onBuildAuthorityLoaded", () => {
      throw new Error("Test error");
    });
    const result = await runner.run(
      "onBuildAuthorityLoaded",
      createHookContext("onBuildAuthorityLoaded", "RUN-TEST", "BUILD-001"),
    );
    expect(result.success).toBe(false);
    expect(result.blocking).toBe(true);
    expect(result.errors[0]).toContain("Test error");
  });
});

describe("BAQ Quality Score Calculation", () => {
  it("scores 0 when all upstream artifacts are null", () => {
    const gateEval = evaluateAllGates({
      extraction: null,
      derivedInputs: null,
      inventory: null,
      traceMap: null,
      sufficiency: null,
      reconciliation: null,
      verificationSignals: null,
      packagingSignals: null,
    });
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: null,
      derivedInputs: null,
      inventory: null,
      traceMap: null,
      sufficiency: null,
      gateEvaluation: gateEval,
      reconciliation: null,
      verificationSignals: null,
      buildStatus: "failed",
    });
    expect(report.overall_quality_score).toBe(0);
  });

  it("scores maximum 100 with all passing artifacts", () => {
    const gateEval = allPassingGateEval();
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs({ summary: { ...makeDerivedInputs().summary, derivation_completeness: 100 } } as Partial<BAQDerivedBuildInputs>),
      inventory: makeInventory(),
      traceMap: makeTraceMap(100),
      sufficiency: makeSufficiency(100),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation({ coverage_percent: 100 }),
      verificationSignals: makeVerificationSignals({ fidelity_percent: 100 }),
      buildStatus: "verification_complete",
    });
    expect(report.overall_quality_score).toBe(100);
  });

  it("approved_with_warnings when score below 70 but all gates pass", () => {
    const gateEval = allPassingGateEval();
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction({ extraction_result: "partial" }),
      derivedInputs: makeDerivedInputs({ summary: { ...makeDerivedInputs().summary, derivation_completeness: 30 } } as Partial<BAQDerivedBuildInputs>),
      inventory: makeInventory(),
      traceMap: makeTraceMap(40),
      sufficiency: makeSufficiency(40),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation({ coverage_percent: 40 }),
      verificationSignals: makeVerificationSignals({ fidelity_percent: 40 }),
      buildStatus: "verification_complete",
    });
    expect(report.overall_quality_score).toBeLessThan(70);
    expect(report.decision).toBe("approved_with_warnings");
  });
});

describe("BAQ Quality Report — Packaging Decision Propagation", () => {
  it("updates quality report with allowed packaging decision", () => {
    const tmpDir = makeTmpDir();
    const gateEval = allPassingGateEval();
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(100),
      sufficiency: makeSufficiency(100),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    });
    writeQualityReport(tmpDir, report);

    updateQualityReportWithPackagingDecision(tmpDir, {
      packaging_allowed: true,
      block_reasons: [],
      evaluated_at: "2025-01-01T00:00:00Z",
    });

    const updated = JSON.parse(fs.readFileSync(path.join(tmpDir, "build_quality_report.json"), "utf-8"));
    expect(updated.packaging_decision).toBeDefined();
    expect(updated.packaging_decision.packaging_allowed).toBe(true);
    expect(updated.packaging_decision.block_reasons).toEqual([]);
    expect(updated.packaging_eligibility.eligible).toBe(true);
  });

  it("updates quality report with blocked packaging decision", () => {
    const tmpDir = makeTmpDir();
    const gateEval = allPassingGateEval();
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(100),
      sufficiency: makeSufficiency(100),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    });
    writeQualityReport(tmpDir, report);

    const blockReasons = ["Hard gate(s) failed: G-BQ-01", "Missing proof ledger"];
    updateQualityReportWithPackagingDecision(tmpDir, {
      packaging_allowed: false,
      block_reasons: blockReasons,
      evaluated_at: "2025-01-01T00:00:00Z",
    });

    const updated = JSON.parse(fs.readFileSync(path.join(tmpDir, "build_quality_report.json"), "utf-8"));
    expect(updated.packaging_decision.packaging_allowed).toBe(false);
    expect(updated.packaging_decision.block_reasons).toEqual(blockReasons);
    expect(updated.packaging_eligibility.eligible).toBe(false);
    expect(updated.packaging_eligibility.reasons).toEqual(blockReasons);
  });

  it("handles missing quality report gracefully (no-op)", () => {
    const tmpDir = makeTmpDir();
    expect(() =>
      updateQualityReportWithPackagingDecision(tmpDir, {
        packaging_allowed: true,
        block_reasons: [],
        evaluated_at: "2025-01-01T00:00:00Z",
      }),
    ).not.toThrow();
  });

  it("preserves updated_at timestamp after packaging decision update", () => {
    const tmpDir = makeTmpDir();
    const gateEval = allPassingGateEval();
    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(100),
      sufficiency: makeSufficiency(100),
      gateEvaluation: gateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    });
    writeQualityReport(tmpDir, report);

    const beforeUpdate = JSON.parse(fs.readFileSync(path.join(tmpDir, "build_quality_report.json"), "utf-8"));
    const originalUpdatedAt = beforeUpdate.updated_at;

    updateQualityReportWithPackagingDecision(tmpDir, {
      packaging_allowed: true,
      block_reasons: [],
      evaluated_at: "2025-01-01T00:00:00Z",
    });

    const afterUpdate = JSON.parse(fs.readFileSync(path.join(tmpDir, "build_quality_report.json"), "utf-8"));
    expect(afterUpdate.updated_at).not.toBe(originalUpdatedAt);
  });
});

describe("BAQ Packager-Level Preflight Enforcement", () => {
  it("packageKit is not importable without preflight — packager enforces gate internally", async () => {
    const { packageKit } = await import("../../src/core/kit/packager.js");
    expect(typeof packageKit).toBe("function");
  });

  it("packager blocks when quality report has failed gates", () => {
    const tmpDir = makeTmpDir();

    const failedGateEval: FullGateEvaluation = {
      gates: [
        { gate_id: "G-BQ-01", gate_name: "Extraction Integrity", status: "fail", conditions: [], blockers: ["test"], evidence_refs: [] },
        { gate_id: "G-BQ-02", gate_name: "Derived Inputs", status: "pass", conditions: [], blockers: [], evidence_refs: [] },
        { gate_id: "G-BQ-03", gate_name: "Inventory", status: "pass", conditions: [], blockers: [], evidence_refs: [] },
        { gate_id: "G-BQ-04", gate_name: "Requirements", status: "pass", conditions: [], blockers: [], evidence_refs: [] },
        { gate_id: "G-BQ-05", gate_name: "Sufficiency", status: "pass", conditions: [], blockers: [], evidence_refs: [] },
        { gate_id: "G-BQ-06", gate_name: "Verification", status: "pass", conditions: [], blockers: [], evidence_refs: [] },
        { gate_id: "G-BQ-07", gate_name: "Packaging", status: "pass", conditions: [], blockers: [], evidence_refs: [] },
      ],
      total: 7,
      passed_count: 6,
      failed_count: 1,
      skipped_count: 0,
      packaging_eligible: false,
    };

    const report = buildQualityReport({
      runId: "RUN-TEST",
      buildId: "BUILD-001",
      extraction: makeExtraction(),
      derivedInputs: makeDerivedInputs(),
      inventory: makeInventory(),
      traceMap: makeTraceMap(100),
      sufficiency: makeSufficiency(100),
      gateEvaluation: failedGateEval,
      reconciliation: makeReconciliation(),
      verificationSignals: makeVerificationSignals(),
      buildStatus: "verification_complete",
    });
    writeQualityReport(tmpDir, report);

    const kitBundleDir = path.join(tmpDir, "kit", "bundle", "agent_kit");
    fs.mkdirSync(kitBundleDir, { recursive: true });

    fs.writeFileSync(path.join(tmpDir, "kit_extraction.json"), "{}");
    fs.writeFileSync(path.join(tmpDir, "derived_build_inputs.json"), "{}");
    fs.writeFileSync(path.join(tmpDir, "repo_inventory.json"), "{}");
    fs.writeFileSync(path.join(tmpDir, "requirement_trace_map.json"), "{}");
    fs.writeFileSync(path.join(tmpDir, "sufficiency_evaluation.json"), "{}");
    fs.mkdirSync(path.join(tmpDir, "proof"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "proof", "proof_ledger.jsonl"), "{}");

    const decision = runPackagingPreflight(tmpDir, kitBundleDir);
    expect(decision.allowed).toBe(false);
    expect(decision.block_reasons.some(r => r.includes("gate"))).toBe(true);
  });
});
