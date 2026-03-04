import { isoNow } from "../../utils/time.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import type { CanonicalSpec, FeatureEntity, WorkflowEntity, RoleEntity } from "../canonical/specBuilder.js";
import type { WorkBreakdown, WorkBreakdownItem, AcceptanceMap, AcceptanceMapEntry, SequencingReport, SequencingStep } from "./outputs.js";

export interface PlanningResult {
  workBreakdown: WorkBreakdown;
  acceptanceMap: AcceptanceMap;
  sequencingReport: SequencingReport;
  coverageReport: CoverageReport;
}

export interface CoverageReport {
  run_id: string;
  generated_at: string;
  coverage_percent: number;
  summary: {
    acceptance_total: number;
    spec_items_covered: number;
    spec_items_total: number;
    units_total: number;
  };
  uncovered: Array<{ item_id: string; item_type: string; reason: string }>;
  notes: Array<{ level: string; message: string }>;
}

function makeTaskId(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function buildWorkUnitsFromSpec(spec: CanonicalSpec, runId: string): { tasks: WorkBreakdownItem[]; violations: string[] } {
  const tasks: WorkBreakdownItem[] = [];
  const violations: string[] = [];
  const targetSet = new Set<string>();

  for (const feature of spec.entities.features) {
    const taskId = makeTaskId("WU-FEAT", tasks.length);
    const target = feature.feature_id;

    if (targetSet.has(target)) {
      violations.push(`Duplicate target "${target}" found in work unit "${taskId}". Each work unit must have exactly 1 unique target.`);
    }
    targetSet.add(target);

    tasks.push({
      task_id: taskId,
      name: `Implement feature: ${feature.name}`,
      description: feature.description ?? `Implement ${feature.name} (priority: ${feature.priority_tier})`,
      depends_on: [],
      acceptance_criteria_ids: [`AC-FEAT-${String(tasks.length + 1).padStart(3, "0")}`],
      status: "pending",
    });
  }

  for (const workflow of spec.entities.workflows) {
    const taskId = makeTaskId("WU-WF", tasks.length);
    const target = workflow.workflow_id;

    if (targetSet.has(target)) {
      violations.push(`Duplicate target "${target}" found in work unit "${taskId}". Each work unit must have exactly 1 unique target.`);
    }
    targetSet.add(target);

    const featureDeps = tasks
      .filter((t) => t.task_id.startsWith("WU-FEAT"))
      .map((t) => t.task_id);

    tasks.push({
      task_id: taskId,
      name: `Implement workflow: ${workflow.name}`,
      description: `Workflow for actor ${workflow.actor_role_ref}: ${workflow.steps.length} steps`,
      depends_on: featureDeps.slice(0, 3),
      acceptance_criteria_ids: [`AC-WF-${String(tasks.length + 1).padStart(3, "0")}`],
      status: "pending",
    });
  }

  for (const role of spec.entities.roles) {
    const taskId = makeTaskId("WU-ROLE", tasks.length);
    const target = role.role_id;

    if (targetSet.has(target)) {
      violations.push(`Duplicate target "${target}" found in work unit "${taskId}". Each work unit must have exactly 1 unique target.`);
    }
    targetSet.add(target);

    tasks.push({
      task_id: taskId,
      name: `Define role: ${role.name}`,
      description: role.description ?? `Define permissions and access for role ${role.name}`,
      depends_on: [],
      acceptance_criteria_ids: [`AC-ROLE-${String(tasks.length + 1).padStart(3, "0")}`],
      status: "pending",
    });
  }

  if (spec.entities.data_objects) {
    for (const dataObj of spec.entities.data_objects) {
      const taskId = makeTaskId("WU-DATA", tasks.length);
      const target = dataObj.data_object_id;

      if (targetSet.has(target)) {
        violations.push(`Duplicate target "${target}" found in work unit "${taskId}". Each work unit must have exactly 1 unique target.`);
      }
      targetSet.add(target);

      tasks.push({
        task_id: taskId,
        name: `Implement data object: ${dataObj.name}`,
        description: dataObj.description ?? `Data object with ${dataObj.fields_required.length} required fields`,
        depends_on: [],
        acceptance_criteria_ids: [`AC-DATA-${String(tasks.length + 1).padStart(3, "0")}`],
        status: "pending",
      });
    }
  }

  if (spec.entities.operations) {
    for (const op of spec.entities.operations) {
      const taskId = makeTaskId("WU-OP", tasks.length);
      const target = op.operation_id;

      if (targetSet.has(target)) {
        violations.push(`Duplicate target "${target}" found in work unit "${taskId}". Each work unit must have exactly 1 unique target.`);
      }
      targetSet.add(target);

      tasks.push({
        task_id: taskId,
        name: `Implement operation: ${op.name}`,
        description: op.purpose,
        depends_on: op.feature_refs.length > 0 ? [tasks[0]?.task_id].filter(Boolean) : [],
        acceptance_criteria_ids: [`AC-OP-${String(tasks.length + 1).padStart(3, "0")}`],
        status: "pending",
      });
    }
  }

  if (spec.entities.integrations) {
    for (const integ of spec.entities.integrations) {
      const taskId = makeTaskId("WU-INT", tasks.length);
      const target = integ.integration_id;

      if (targetSet.has(target)) {
        violations.push(`Duplicate target "${target}" found in work unit "${taskId}". Each work unit must have exactly 1 unique target.`);
      }
      targetSet.add(target);

      tasks.push({
        task_id: taskId,
        name: `Implement integration: ${integ.service_name}`,
        description: integ.purpose,
        depends_on: [],
        acceptance_criteria_ids: [`AC-INT-${String(tasks.length + 1).padStart(3, "0")}`],
        status: "pending",
      });
    }
  }

  return { tasks, violations };
}

function buildAcceptanceEntries(tasks: WorkBreakdownItem[]): AcceptanceMapEntry[] {
  const entries: AcceptanceMapEntry[] = [];

  for (const task of tasks) {
    for (const acId of task.acceptance_criteria_ids) {
      entries.push({
        criteria_id: acId,
        description: `Acceptance criteria for: ${task.name}`,
        linked_task_ids: [task.task_id],
        linked_gate_ids: ["G6_PLAN_COVERAGE"],
        status: "unverified",
      });
    }
  }

  return entries;
}

function buildSequencingSteps(tasks: WorkBreakdownItem[]): SequencingStep[] {
  return tasks.map((task, i) => ({
    order: i + 1,
    task_id: task.task_id,
    stage: "S8_BUILD_PLAN",
    dependencies_met: task.depends_on.length === 0 || task.depends_on.every((dep) => tasks.findIndex((t) => t.task_id === dep) < i),
  }));
}

function computeCoverage(
  spec: CanonicalSpec,
  tasks: WorkBreakdownItem[],
  acceptanceEntries: AcceptanceMapEntry[]
): CoverageReport["summary"] & { uncovered: CoverageReport["uncovered"] } {
  const specItems: Array<{ id: string; type: string }> = [];

  for (const f of spec.entities.features) specItems.push({ id: f.feature_id, type: "feature" });
  for (const w of spec.entities.workflows) specItems.push({ id: w.workflow_id, type: "workflow" });
  for (const r of spec.entities.roles) specItems.push({ id: r.role_id, type: "role" });
  if (spec.entities.data_objects) {
    for (const d of spec.entities.data_objects) specItems.push({ id: d.data_object_id, type: "data_object" });
  }
  if (spec.entities.operations) {
    for (const o of spec.entities.operations) specItems.push({ id: o.operation_id, type: "operation" });
  }
  if (spec.entities.integrations) {
    for (const i of spec.entities.integrations) specItems.push({ id: i.integration_id, type: "integration" });
  }

  const coveredIds = new Set<string>();
  for (const task of tasks) {
    const nameMatch = task.name.match(/: (.+)$/);
    if (nameMatch) {
      for (const item of specItems) {
        if (task.task_id.includes("FEAT") && item.type === "feature") coveredIds.add(item.id);
        if (task.task_id.includes("WF") && item.type === "workflow") coveredIds.add(item.id);
        if (task.task_id.includes("ROLE") && item.type === "role") coveredIds.add(item.id);
        if (task.task_id.includes("DATA") && item.type === "data_object") coveredIds.add(item.id);
        if (task.task_id.includes("OP") && item.type === "operation") coveredIds.add(item.id);
        if (task.task_id.includes("INT") && item.type === "integration") coveredIds.add(item.id);
      }
    }
  }

  const uncovered = specItems
    .filter((item) => !coveredIds.has(item.id))
    .map((item) => ({ item_id: item.id, item_type: item.type, reason: "No work unit covers this spec item" }));

  const specItemsTotal = specItems.length;
  const specItemsCovered = specItemsTotal - uncovered.length;
  const coveragePercent = specItemsTotal === 0 ? 100 : Math.round((specItemsCovered / specItemsTotal) * 100);

  return {
    acceptance_total: acceptanceEntries.length,
    spec_items_covered: specItemsCovered,
    spec_items_total: specItemsTotal,
    units_total: tasks.length,
    uncovered,
  };
}

export function generatePlan(runId: string, specPath: string): PlanningResult {
  let spec: CanonicalSpec;
  if (existsSync(specPath)) {
    spec = JSON.parse(readFileSync(specPath, "utf-8")) as CanonicalSpec;
  } else {
    spec = {
      meta: { spec_id: "SPEC-EMPTY", submission_id: "", schema_version_used: "1.0.0", standards_snapshot_id: "", standards_version_used: "", spec_version: "1.0.0", created_at: isoNow() },
      routing: {},
      constraints: { stack_constraints: {}, security_constraints: {}, quality_constraints: {}, fixed_vs_configurable: {} },
      entities: { roles: [], features: [], workflows: [], permissions: [] },
      rules: { definition_of_done: "N/A" },
      unknowns: [],
      index: { roles_by_id: {}, features_by_id: {}, workflows_by_id: {}, cross_maps: { workflow_to_features: {}, feature_to_workflows: {}, feature_to_operations: {}, role_to_workflows: {}, role_to_permissions: {} } },
    };
  }

  const { tasks, violations } = buildWorkUnitsFromSpec(spec, runId);

  if (violations.length > 0) {
    throw new Error(`1-target-per-unit violation(s):\n${violations.join("\n")}`);
  }

  const now = isoNow();

  const workBreakdown: WorkBreakdown = {
    run_id: runId,
    created_at: now,
    tasks,
  };

  const acceptanceEntries = buildAcceptanceEntries(tasks);
  const acceptanceMap: AcceptanceMap = {
    run_id: runId,
    created_at: now,
    entries: acceptanceEntries,
  };

  const steps = buildSequencingSteps(tasks);
  const sequencingReport: SequencingReport = {
    run_id: runId,
    created_at: now,
    steps,
  };

  const coverageData = computeCoverage(spec, tasks, acceptanceEntries);
  const coverageReport: CoverageReport = {
    run_id: runId,
    generated_at: now,
    coverage_percent: coverageData.spec_items_total === 0 ? 100 : Math.round((coverageData.spec_items_covered / coverageData.spec_items_total) * 100),
    summary: {
      acceptance_total: coverageData.acceptance_total,
      spec_items_covered: coverageData.spec_items_covered,
      spec_items_total: coverageData.spec_items_total,
      units_total: coverageData.units_total,
    },
    uncovered: coverageData.uncovered,
    notes: [{ level: "info", message: `Generated ${tasks.length} work units from canonical spec with ${coverageData.spec_items_total} spec items` }],
  };

  return { workBreakdown, acceptanceMap, sequencingReport, coverageReport };
}

export function generateAndWritePlan(runDir: string, runId: string): PlanningResult {
  const specPath = join(runDir, "canonical", "canonical_spec.json");
  const result = generatePlan(runId, specPath);

  writeCanonicalJson(join(runDir, "planning", "work_breakdown.json"), result.workBreakdown);
  writeCanonicalJson(join(runDir, "planning", "acceptance_map.json"), result.acceptanceMap);
  writeCanonicalJson(join(runDir, "planning", "coverage_report.json"), result.coverageReport);
  writeCanonicalJson(join(runDir, "planning", "sequencing_report.json"), result.sequencingReport);

  return result;
}
