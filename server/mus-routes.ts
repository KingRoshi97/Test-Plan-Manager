import { type Express, type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { validateRegistries, executeRun, loadMusPolicy, getRegistryVersions, listAgents, listTasks, createTaskRun, startTaskRun } from "../Axion/src/core/mus/engine.js";
import { MusStore } from "../Axion/src/core/mus/store.js";
import { initLedger, appendLedger } from "../Axion/src/core/mus/ledger.js";
import type { MusRun, MusBudgets, MusScope, MusChangeSet, MusApprovalEvent, MusSuppressionRule, MusScheduleEntry } from "../Axion/src/core/mus/types.js";

const AXION_ROOT = path.resolve(process.cwd(), "Axion");
const MUS_LIB_DIR = path.join(AXION_ROOT, "libraries", "maintenance");
const MUS_DATA_DIR = path.join(AXION_ROOT, "mus_data");

function ensureStore(): MusStore {
  initLedger(MUS_DATA_DIR);
  return new MusStore(MUS_DATA_DIR);
}

async function readRegistryJson(name: string): Promise<any> {
  const fp = path.join(MUS_LIB_DIR, "registries", `${name}.json`);
  try {
    await fsp.access(fp);
  } catch {
    return { items: [] };
  }
  try {
    return JSON.parse(await fsp.readFile(fp, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse registry JSON ${name}:`, err);
    return { items: [] };
  }
}

async function loadScheduleOverrides(): Promise<Record<string, boolean>> {
  const overridePath = path.join(MUS_DATA_DIR, "schedule_overrides.json");
  try {
    await fsp.access(overridePath);
    return JSON.parse(await fsp.readFile(overridePath, "utf-8"));
  } catch (err: any) {
    if (err?.code === "ENOENT") return {};
    console.error("Failed to parse schedule overrides:", err);
    return {};
  }
}

async function saveScheduleOverrides(overrides: Record<string, boolean>): Promise<void> {
  await fsp.mkdir(MUS_DATA_DIR, { recursive: true });
  await fsp.writeFile(path.join(MUS_DATA_DIR, "schedule_overrides.json"), JSON.stringify(overrides, null, 2));
}

export function registerMusRoutes(app: Express): void {
  app.get("/api/mus/status", async (_req: Request, res: Response) => {
    try {
      const versions = getRegistryVersions(MUS_LIB_DIR);
      const policy = loadMusPolicy(MUS_LIB_DIR);
      const store = ensureStore();
      const runs = store.listRuns();
      const lastRun = runs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))[0] ?? null;

      const validationPath = path.join(MUS_DATA_DIR, "last_validation.json");
      let lastValidation = null;
      try {
        lastValidation = JSON.parse(await fsp.readFile(validationPath, "utf-8"));
      } catch (err: any) {
        if (err?.code !== "ENOENT") console.error("Failed to read last validation:", err);
      }

      res.json({
        mus_root: MUS_LIB_DIR,
        data_root: MUS_DATA_DIR,
        registry_versions: versions,
        policy_loaded: !!policy,
        consent: {
          apply_required: (policy as any)?.consent?.apply_required ?? true,
          publish_required: (policy as any)?.consent?.publish_required ?? true,
        },
        locks: {
          scheduled_publish_blocked: true,
          automation_apply_blocked: true,
        },
        last_run: lastRun ? { run_id: lastRun.run_id, status: lastRun.status, completed_at: lastRun.completed_at } : null,
        last_validation: lastValidation,
        total_runs: runs.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/validate", async (_req: Request, res: Response) => {
    try {
      const result = validateRegistries(MUS_LIB_DIR);
      await fsp.mkdir(MUS_DATA_DIR, { recursive: true });
      await fsp.writeFile(path.join(MUS_DATA_DIR, "last_validation.json"), JSON.stringify(result, null, 2));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/runs", async (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const { mode_id, trigger = "manual", scope, budgets: userBudgets } = req.body;

      if (!mode_id) return res.status(400).json({ error: "mode_id is required" });
      if (!["MM-01", "MM-04"].includes(mode_id)) {
        return res.status(400).json({ error: `Mode "${mode_id}" not supported in v1. Use MM-01 or MM-04.` });
      }
      if (trigger !== "manual" && trigger !== "scheduled") {
        return res.status(400).json({ error: "trigger must be 'manual' or 'scheduled'" });
      }

      const modesReg = await readRegistryJson("REG-MAINTENANCE-MODES");
      const modeItem = modesReg.items?.find((m: any) => m.mode_id === mode_id);
      if (!modeItem) return res.status(404).json({ error: `Mode ${mode_id} not found` });

      const policy = loadMusPolicy(MUS_LIB_DIR) as any;
      const defaultBudgets = policy?.budgets_default ?? {};
      const modeBudgets = modeItem.default_budgets ?? {};

      const policyMaxProposals = policy?.proposal_rules?.max_proposal_packs_per_run ?? 5;
      const policyMaxPatches = policy?.proposal_rules?.max_patches_per_pack ?? 25;
      const policyMinConfidence = policy?.proposal_rules?.min_confidence ?? 60;

      const maxTokenCap = defaultBudgets.token_cap ?? 50000;
      const maxTimeCap = defaultBudgets.time_cap_ms ?? 120000;
      const maxFindingsCap = 1000;
      const maxProposalsCap = policyMaxProposals * 5;

      function clamp(val: number | undefined, fallback: number, max: number): number {
        const v = val ?? fallback;
        return Math.min(Math.max(1, v), max);
      }

      const budgets: MusBudgets = {
        token_cap: clamp(userBudgets?.token_cap, modeBudgets.token_cap ?? defaultBudgets.token_cap ?? 15000, maxTokenCap),
        time_cap_ms: clamp(userBudgets?.time_cap_ms, modeBudgets.time_cap_ms ?? defaultBudgets.time_cap_ms ?? 60000, maxTimeCap),
        max_findings: clamp(userBudgets?.max_findings, modeBudgets.max_findings ?? 500, maxFindingsCap),
        max_proposals: clamp(userBudgets?.max_proposals, modeBudgets.max_proposals ?? 25, maxProposalsCap),
        max_assets_touched: clamp(userBudgets?.max_assets_touched, modeBudgets.max_assets_touched ?? 50, 200),
      };

      const runScope: MusScope = scope ?? { asset_classes: modeItem.allowed_scopes?.asset_classes ?? ["registries"] };

      const run: MusRun = {
        run_id: store.generateRunId(),
        mode_id,
        trigger: trigger as "manual" | "scheduled",
        scope: runScope,
        budgets,
        status: "created",
        created_at: new Date().toISOString(),
      };

      store.saveRun(run);
      appendLedger("run_created", { run_id: run.run_id, mode_id, trigger });
      res.json(run);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/mus/runs/:runId/start", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const run = store.getRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      if (run.status !== "created") {
        return res.status(400).json({ error: `Run is in state '${run.status}', expected 'created'` });
      }

      const result = executeRun(MUS_LIB_DIR, store, run);
      res.json({
        run: result.run,
        findings_count: result.findings.length,
        proposals_count: result.proposals.length,
        blast_radius: result.blastRadius,
        proof_bundle_status: result.proofBundle.status,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/runs", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const runs = store.listRuns().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/runs/:runId", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const run = store.getRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      res.json(run);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/runs/:runId/findings", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const run = store.getRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });

      let findings = store.getRunFindings(req.params.runId);

      const suppressions = store.listSuppressions();
      const now = new Date();
      for (const f of findings) {
        const match = suppressions.find(s => {
          if (s.finding_type !== f.check_id) return false;
          if (s.expires_at && new Date(s.expires_at) < now) return false;
          for (const [key, val] of Object.entries(s.scope_selectors)) {
            if (key === "file_path" && f.file_path !== val) return false;
            if (key === "detector_pack_id" && f.detector_pack_id !== val) return false;
          }
          return true;
        });
        if (match && f.status === "open") {
          f.status = "suppressed";
        }
      }

      const status = req.query.status as string | undefined;
      if (status) findings = findings.filter(f => f.status === status);

      const severity = req.query.severity as string | undefined;
      if (severity) findings = findings.filter(f => f.severity === severity);

      res.json(findings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/mus/findings/:findingId", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const finding = store.getFinding(req.params.findingId);
      if (!finding) return res.status(404).json({ error: `Finding ${req.params.findingId} not found` });

      const { status } = req.body;
      if (!status || !["open", "acknowledged", "resolved"].includes(status)) {
        return res.status(400).json({ error: "status must be 'open', 'acknowledged', or 'resolved'" });
      }

      finding.status = status;
      finding.updated_at = new Date().toISOString();
      store.updateFinding(finding);
      appendLedger("finding_updated", { finding_id: finding.finding_id, new_status: status });
      res.json(finding);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/suppressions", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const { finding_type, scope_selectors = {}, reason, expires_at } = req.body;
      if (!finding_type || !reason) {
        return res.status(400).json({ error: "finding_type and reason are required" });
      }

      const rule: MusSuppressionRule = {
        suppression_id: store.generateId("SUP"),
        finding_type,
        scope_selectors,
        reason,
        expires_at,
        created_at: new Date().toISOString(),
      };

      store.saveSuppression(rule);
      appendLedger("suppression_created", { suppression_id: rule.suppression_id, finding_type });
      res.json(rule);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/mus/suppressions", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      res.json(store.listSuppressions());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/proposals", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      res.json(store.listProposals());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/proposals/:id", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const proposal = store.getProposal(req.params.id);
      if (!proposal) return res.status(404).json({ error: `Proposal ${req.params.id} not found` });
      res.json(proposal);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/runs/:runId/proposals", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const run = store.getRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      res.json(store.getRunProposals(req.params.runId));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/runs/:runId/blast-radius", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const br = store.getBlastRadius(req.params.runId);
      res.json(br ?? { affected_files: [], affected_registries: [], affected_asset_count: 0, risk_summary: "No proposals" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/runs/:runId/proof", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const proof = store.getProofBundle(req.params.runId);
      if (!proof) return res.status(404).json({ error: "No proof bundle for this run" });
      res.json(proof);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/changesets", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const { proposal_pack_id, selected_patch_ids, summary } = req.body;
      if (!proposal_pack_id) return res.status(400).json({ error: "proposal_pack_id is required" });

      const proposal = store.getProposal(proposal_pack_id);
      if (!proposal) return res.status(404).json({ error: `Proposal ${proposal_pack_id} not found` });

      let patches = proposal.patches;
      if (selected_patch_ids && Array.isArray(selected_patch_ids) && selected_patch_ids.length > 0) {
        patches = patches.filter(p => selected_patch_ids.includes(p.patch_id));
      }
      if (patches.length === 0) return res.status(400).json({ error: "No patches selected" });

      const cs: MusChangeSet = {
        changeset_id: store.generateId("CS"),
        source_proposal_pack_id: proposal_pack_id,
        selected_patch_ids: patches.map(p => p.patch_id),
        patches,
        summary: summary ?? `ChangeSet from proposal ${proposal_pack_id} with ${patches.length} patch(es)`,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.saveChangeSet(cs);
      appendLedger("changeset_created", { changeset_id: cs.changeset_id, proposal_pack_id, patch_count: patches.length });
      res.json(cs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/mus/changesets", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      res.json(store.listChangeSets());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/changesets/:id", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const cs = store.getChangeSet(req.params.id);
      if (!cs) return res.status(404).json({ error: `ChangeSet ${req.params.id} not found` });
      res.json(cs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/changesets/:id/apply", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const cs = store.getChangeSet(req.params.id);
      if (!cs) return res.status(404).json({ error: `ChangeSet ${req.params.id} not found` });
      if (cs.status !== "approved") {
        return res.status(400).json({ error: `ChangeSet is '${cs.status}', needs 'approved' status with Apply Approval` });
      }

      const approvals = store.listApprovals(cs.changeset_id);
      const hasApply = approvals.some(a => a.approval_type === "apply");
      if (!hasApply) {
        return res.status(403).json({ error: "Apply Approval required. Create an approval event first." });
      }

      appendLedger("apply_blocked", { changeset_id: cs.changeset_id, reason: "Not implemented in v1" });
      res.status(501).json({
        error: "Apply execution is not implemented in v1. Gate validation passed but execution is disabled.",
        changeset_id: cs.changeset_id,
        gate_status: "passed",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/releases/:id/publish", (req: Request, res: Response) => {
    try {
      const { trigger } = req.body;
      if (trigger === "scheduled") {
        appendLedger("publish_blocked", { reason: "Scheduled publish is always blocked" });
        return res.status(403).json({ error: "Scheduled runs cannot publish. This is a hard constraint." });
      }

      const store = ensureStore();
      const approvals = store.listApprovals(req.params.id);
      const hasPublish = approvals.some(a => a.approval_type === "publish");
      if (!hasPublish) {
        return res.status(403).json({ error: "Publish Approval required. Create an approval event first." });
      }

      appendLedger("publish_blocked", { release_id: req.params.id, reason: "Not implemented in v1" });
      res.status(501).json({
        error: "Publish execution is not implemented in v1. Gate validation passed but execution is disabled.",
        release_id: req.params.id,
        gate_status: "passed",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/approvals", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const { approval_type, target_type, target_id, reason, actor = "operator", diff_hash } = req.body;

      if (!approval_type || !["apply", "publish", "waiver"].includes(approval_type)) {
        return res.status(400).json({ error: "approval_type must be 'apply', 'publish', or 'waiver'" });
      }
      if (!target_type || !["changeset", "release"].includes(target_type)) {
        return res.status(400).json({ error: "target_type must be 'changeset' or 'release'" });
      }
      if (!target_id || !reason) {
        return res.status(400).json({ error: "target_id and reason are required" });
      }

      if (actor === "automation") {
        if (approval_type === "apply" || approval_type === "publish") {
          return res.status(403).json({ error: `Automation actors cannot create ${approval_type} approvals` });
        }
      }

      if (approval_type === "apply" && target_type === "changeset") {
        const cs = store.getChangeSet(target_id);
        if (cs && cs.status === "draft") {
          cs.status = "approved";
          cs.updated_at = new Date().toISOString();
          store.saveChangeSet(cs);
        }
      }

      const approval: MusApprovalEvent = {
        approval_id: store.generateId("APR"),
        approval_type,
        target_type,
        target_id,
        reason,
        diff_hash,
        actor,
        created_at: new Date().toISOString(),
      };

      store.saveApproval(approval);
      appendLedger("approval_created", { approval_id: approval.approval_id, approval_type, target_id });
      res.json(approval);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/mus/approvals", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const targetId = req.query.target_id as string | undefined;
      res.json(store.listApprovals(targetId));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/schedules", async (_req: Request, res: Response) => {
    try {
      const schedulesReg = await readRegistryJson("REG-SCHEDULES");
      const overrides = await loadScheduleOverrides();
      const schedules = (schedulesReg.items ?? []).map((s: any) => ({
        ...s,
        enabled: overrides[s.schedule_id] ?? (s.status !== "disabled"),
        proposal_only: true,
      }));
      res.json(schedules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/mus/schedules/:id", async (req: Request, res: Response) => {
    try {
      const { enabled } = req.body;
      if (typeof enabled !== "boolean") {
        return res.status(400).json({ error: "enabled must be a boolean" });
      }

      const schedulesReg = await readRegistryJson("REG-SCHEDULES");
      const schedule = schedulesReg.items?.find((s: any) => s.schedule_id === req.params.id);
      if (!schedule) return res.status(404).json({ error: `Schedule ${req.params.id} not found` });

      const overrides = await loadScheduleOverrides();
      overrides[req.params.id] = enabled;
      await saveScheduleOverrides(overrides);

      appendLedger("schedule_toggled", { schedule_id: req.params.id, enabled });
      res.json({ ...schedule, enabled, proposal_only: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/task-schedules", async (_req: Request, res: Response) => {
    try {
      const tasks = listTasks(MUS_LIB_DIR);
      const schedulableTasks = tasks.filter((t: any) => t.schedule_allowed);
      const overridesPath = path.join(MUS_DATA_DIR, "task_schedule_overrides.json");
      let overrides: Record<string, { enabled: boolean; rrule?: string }> = {};
      try {
        overrides = JSON.parse(await fsp.readFile(overridesPath, "utf-8"));
      } catch (err: any) {
        if (err?.code !== "ENOENT") console.error("Failed to read task schedule overrides:", err);
      }
      const result = schedulableTasks.map((t: any) => ({
        task_id: t.task_id,
        name: t.name,
        intent: t.intent,
        enabled: overrides[t.task_id]?.enabled ?? false,
        rrule: overrides[t.task_id]?.rrule ?? "FREQ=WEEKLY;BYDAY=SU;BYHOUR=3",
        proposal_only: true,
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/mus/task-schedules/:taskId", async (req: Request, res: Response) => {
    try {
      const { enabled, rrule } = req.body;
      const taskId = req.params.taskId;
      const tasks = listTasks(MUS_LIB_DIR);
      const task = tasks.find((t: any) => t.task_id === taskId);
      if (!task) return res.status(404).json({ error: `Task ${taskId} not found` });
      if (!task.schedule_allowed) return res.status(400).json({ error: `Task ${taskId} does not allow scheduling` });

      const overridesPath = path.join(MUS_DATA_DIR, "task_schedule_overrides.json");
      await fsp.mkdir(MUS_DATA_DIR, { recursive: true });
      let overrides: Record<string, { enabled: boolean; rrule?: string }> = {};
      try {
        overrides = JSON.parse(await fsp.readFile(overridesPath, "utf-8"));
      } catch (err: any) {
        if (err?.code !== "ENOENT") console.error("Failed to read task schedule overrides:", err);
      }

      const current = overrides[taskId] ?? { enabled: false, rrule: "FREQ=WEEKLY;BYDAY=SU;BYHOUR=3" };
      if (typeof enabled === "boolean") current.enabled = enabled;
      if (typeof rrule === "string") current.rrule = rrule;
      overrides[taskId] = current;

      await fsp.writeFile(overridesPath, JSON.stringify(overrides, null, 2));
      appendLedger("task_schedule_toggled", { task_id: taskId, enabled: current.enabled, rrule: current.rrule });

      res.json({ task_id: taskId, name: task.name, intent: task.intent, ...current, proposal_only: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/agents", (_req: Request, res: Response) => {
    try {
      res.json(listAgents(MUS_LIB_DIR));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/tasks", (_req: Request, res: Response) => {
    try {
      res.json(listTasks(MUS_LIB_DIR));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/task-runs", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const { task_ids, agent_ids, scope, budgets, trigger = "manual" } = req.body;

      if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
        return res.status(400).json({ error: "task_ids must be a non-empty array" });
      }

      const allTasks = listTasks(MUS_LIB_DIR);
      const unknownTasks = task_ids.filter((id: string) => !allTasks.some(t => t.task_id === id));
      if (unknownTasks.length > 0) {
        return res.status(400).json({ error: `Unknown task(s): ${unknownTasks.join(", ")}` });
      }

      const taskRun = createTaskRun(MUS_LIB_DIR, store, { task_ids, agent_ids, scope, budgets, trigger });
      res.json(taskRun);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/mus/task-runs/:runId/start", async (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const taskRun = store.getTaskRun(req.params.runId);
      if (!taskRun) return res.status(404).json({ error: `Task run ${req.params.runId} not found` });
      if (taskRun.status !== "created") {
        return res.status(400).json({ error: `Task run is in state '${taskRun.status}', expected 'created'` });
      }

      const result = await startTaskRun(MUS_LIB_DIR, store, taskRun);
      res.json({
        taskRun: result.taskRun,
        findings_count: result.findings.length,
        insights_count: result.insights.length,
        bottlenecks_count: result.bottlenecks.length,
        recommendations_count: result.recommendations.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/task-runs", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const runs = store.listTaskRuns().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/task-runs/:runId", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const taskRun = store.getTaskRun(req.params.runId);
      if (!taskRun) return res.status(404).json({ error: `Task run ${req.params.runId} not found` });
      res.json(taskRun);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/task-runs/:runId/outputs", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const taskRun = store.getTaskRun(req.params.runId);
      if (!taskRun) return res.status(404).json({ error: `Task run ${req.params.runId} not found` });

      res.json({
        findings: store.getTaskRunFindings(req.params.runId),
        insights: store.getRunInsights(req.params.runId),
        bottlenecks: store.getRunBottlenecks(req.params.runId),
        recommendations: store.getRunRecommendations(req.params.runId),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/recommendations", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const recs = store.listRecommendations().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      res.json(recs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mus/recommendations/:id/convert", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const rec = store.getRecommendation(req.params.id);
      if (!rec) return res.status(404).json({ error: `Recommendation ${req.params.id} not found` });
      if (rec.convertible_to_changeset === false) return res.status(400).json({ error: `Recommendation ${req.params.id} is not convertible to a changeset` });

      const patchId = store.generateId("PATCH");
      const patch: any = {
        patch_id: patchId,
        patch_type_id: "recommendation-conversion",
        target_file: rec.suggested_task_ids?.length ? rec.suggested_task_ids.join(", ") : "manual-review",
        description: rec.description,
        current_value: undefined,
        proposed_value: rec.title,
        diff_summary: `${rec.title}: ${rec.description} (Impact: ${rec.estimated_impact})`,
      };

      const cs: MusChangeSet = {
        changeset_id: store.generateId("CS"),
        source_proposal_pack_id: `REC:${rec.recommendation_id}`,
        selected_patch_ids: [patchId],
        patches: [patch],
        summary: `ChangeSet from recommendation: ${rec.title} [${rec.priority}] — ${rec.estimated_impact}`,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.saveChangeSet(cs);
      appendLedger("changeset_created_from_recommendation", {
        changeset_id: cs.changeset_id,
        recommendation_id: rec.recommendation_id,
        priority: rec.priority,
      });
      res.json(cs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/mus/insights", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const insights = store.listInsights().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      res.json(insights);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mus/bottlenecks", (_req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const reports = store.listBottlenecks().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
