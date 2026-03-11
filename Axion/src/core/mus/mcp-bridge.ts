import * as path from "path";
import type { TaskRun, TaskDefinition, MusFinding, Insight, Recommendation, MusRun } from "./types.js";
import type { MusStore } from "./store.js";
import type {
  MaintenanceRun,
  MaintenanceUnit,
  AxionCompatibilityReport,
  DependencyUpdateReport,
  TestUpdateReport,
  RefactorReport,
  CIUpdateReport,
  MaintenanceRunReport,
} from "../mcp/model.js";
import { AxionIntegrationMaintainer } from "../mcp/axionIntegration.js";
import { DependencyManager } from "../mcp/dependencyManager.js";
import { TestMaintainer } from "../mcp/testMaintainer.js";

export function mapTaskRunToMcpRun(
  taskRun: TaskRun,
  taskDef: TaskDefinition,
): MaintenanceRun {
  const unitType = resolveUnitType(taskDef);
  const units: MaintenanceUnit[] = [{
    unit_id: `UNIT-${taskRun.run_id}`,
    type: unitType,
    status: "not_started",
    target_paths: taskRun.scope.asset_classes ?? [],
    verification_results: [],
  }];

  return {
    run_id: taskRun.run_id,
    mode_id: taskDef.task_id,
    intent_type: taskDef.intent,
    scope_constraints: taskRun.scope.asset_classes ?? [],
    risk_class: "low",
    status: "planned",
    units,
    baseline_revision: "HEAD",
    created_at: taskRun.created_at,
    updated_at: new Date().toISOString(),
  };
}

function resolveUnitType(taskDef: TaskDefinition): MaintenanceUnit["type"] {
  switch (taskDef.task_id) {
    case "TASK-QUAL-02": return "test_hardening";
    case "TASK-COST-01": return "dep_upgrade";
    case "TASK-SYS-01": return "refactor";
    default: return "refactor";
  }
}

export function mapCompatibilityReportToFindings(
  report: AxionCompatibilityReport,
  store: MusStore,
  taskRun: TaskRun,
  taskId: string,
): MusFinding[] {
  const findings: MusFinding[] = [];
  for (const breaking of report.breaking_changes) {
    findings.push({
      finding_id: store.generateId("FND"),
      run_id: taskRun.run_id,
      check_id: "mcp.contract_break",
      detector_pack_id: "MCP-COMPAT",
      severity: "high" as const,
      status: "open" as const,
      title: "MCP Contract Compatibility Issue",
      description: breaking,
      file_path: "axion_contracts",
      json_pointer: "/",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return findings;
}

export function mapCompatibilityReportToInsight(
  report: AxionCompatibilityReport,
  store: MusStore,
  taskRun: TaskRun,
  taskId: string,
): Insight {
  return {
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskId,
    category: "reliability",
    narrative: report.all_compatible
      ? `MCP compatibility check passed: ${report.contracts_checked.length} Axion contracts verified with no breaking changes detected.`
      : `MCP compatibility check found ${report.breaking_changes.length} breaking change(s) across ${report.contracts_checked.length} Axion contracts. These may indicate integration drift.`,
    evidence_refs: report.breaking_changes.length > 0 ? report.breaking_changes : report.contracts_checked,
    confidence: 90,
    suggested_next_actions: report.all_compatible
      ? ["Contracts are healthy", "Schedule periodic compatibility checks"]
      : ["Review breaking changes in contract artifacts", "Run TASK-SYS-01 for full drift scan"],
    created_at: new Date().toISOString(),
  };
}

export function mapTestReportToInsight(
  report: TestUpdateReport,
  store: MusStore,
  taskRun: TaskRun,
  taskId: string,
): Insight {
  const totalTests = report.tests_added.length + report.tests_modified.length + report.tests_removed.length;
  return {
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskId,
    category: "quality",
    narrative: `MCP test analysis: ${totalTests} test file(s) tracked (${report.tests_added.length} added, ${report.tests_modified.length} modified, ${report.tests_removed.length} removed). Determinism: ${report.deterministic ? "PASS" : "FAIL"}.`,
    evidence_refs: [...report.tests_added, ...report.tests_modified],
    confidence: 85,
    suggested_next_actions: report.deterministic
      ? ["Test suite is deterministic", "Monitor for non-determinism drift"]
      : ["Fix non-deterministic tests", "Review test isolation"],
    created_at: new Date().toISOString(),
  };
}

export function mapDependencyReportToInsight(
  report: DependencyUpdateReport,
  store: MusStore,
  taskRun: TaskRun,
  taskId: string,
): Insight {
  const breakingCount = report.deltas.filter(d => d.breaking).length;
  return {
    insight_id: store.generateId("INS"),
    run_id: taskRun.run_id,
    task_id: taskId,
    category: "cost",
    narrative: `MCP dependency analysis: ${report.deltas.length} dependencies tracked. ${breakingCount} with breaking changes. Lockfile ${report.lockfile_updated ? "updated" : "unchanged"}.`,
    evidence_refs: report.deltas.slice(0, 10).map(d => `${d.package_name}: ${d.from_version} → ${d.to_version}`),
    confidence: 80,
    suggested_next_actions: breakingCount > 0
      ? [`Review ${breakingCount} breaking dependency change(s)`, "Run compatibility tests"]
      : ["Dependencies are stable", "Schedule periodic dependency audit"],
    created_at: new Date().toISOString(),
  };
}

export function mapDependencyReportToFindings(
  report: DependencyUpdateReport,
  store: MusStore,
  taskRun: TaskRun,
  taskId: string,
): MusFinding[] {
  return report.deltas.filter(d => d.breaking).map(d => ({
    finding_id: store.generateId("FND"),
    run_id: taskRun.run_id,
    check_id: "mcp.breaking_dep",
    detector_pack_id: "MCP-DEPS",
    severity: "high" as const,
    status: "open" as const,
    title: `Breaking dependency change: ${d.package_name}`,
    description: `${d.package_name} upgraded from ${d.from_version} to ${d.to_version} with breaking changes.`,
    file_path: "package.json",
    json_pointer: `/dependencies/${d.package_name}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export interface McpBridgeContext {
  root: string;
  outputDir: string;
}

export function createMcpBridgeContext(root: string): McpBridgeContext {
  const axionRoot = path.resolve(root, "..", "..");
  const outputDir = path.join(axionRoot, ".axion", "mcp_reports");
  return { root, outputDir };
}

export function createAxionIntegrationMaintainer(ctx: McpBridgeContext): AxionIntegrationMaintainer {
  return new AxionIntegrationMaintainer({ outputDir: ctx.outputDir });
}

export function createDependencyManager(ctx: McpBridgeContext): DependencyManager {
  return new DependencyManager({ outputDir: ctx.outputDir });
}

export function createTestMaintainer(ctx: McpBridgeContext): TestMaintainer {
  return new TestMaintainer({ outputDir: ctx.outputDir });
}
