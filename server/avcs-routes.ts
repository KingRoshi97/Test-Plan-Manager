import { type Express, type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import { AVCSStore } from "../Axion/src/core/avcs/store.js";
import { planRun, executeRun, getAVCSStatus } from "../Axion/src/core/avcs/engine.js";
import { remediateFromReport, rollbackRemediation } from "../Axion/src/core/build/runner.js";
import type { CertificationRunType, AVCSTestDomain } from "../Axion/src/core/avcs/types.js";
import { TEST_CATALOG, getTestById, getTestsByDomain, getMVPTests } from "../Axion/src/core/avcs/test-catalog.js";
import { TOOL_REGISTRY } from "../Axion/src/core/avcs/tool-registry.js";
import { buildTestPlan } from "../Axion/src/core/avcs/test-plan-builder.js";
import { getAdapterStatus } from "../Axion/src/core/avcs/tool-adapters.js";

const AXION_ROOT = path.resolve(process.cwd(), "Axion");
const AVCS_DATA_DIR = path.join(AXION_ROOT, "avcs_data");
const AXION_RUNS = path.join(AXION_ROOT, ".axion", "runs");

interface RemediationTracker {
  status: "running" | "complete" | "failed";
  runId: string;
  startedAt: string;
  completedAt?: string;
  filesFixed: number;
  filesFailed: number;
  filesUnchanged: number;
  errors: string[];
}

const remediationStatus = new Map<string, RemediationTracker>();

function ensureStore(): AVCSStore {
  return new AVCSStore(AVCS_DATA_DIR);
}

const VALID_RUN_TYPES: CertificationRunType[] = [
  "smoke", "functional", "security", "performance", "full_certification", "pre_deployment",
];

const RUN_ID_RE = /^RUN-[A-Z0-9]{6,}$/;

function safeRunPath(runId: string): string | null {
  if (!RUN_ID_RE.test(runId)) return null;
  const resolved = path.resolve(AXION_RUNS, runId);
  if (!resolved.startsWith(AXION_RUNS)) return null;
  return resolved;
}

export function registerAVCSRoutes(app: Express): void {
  app.post("/api/avcs/runs", async (req: Request, res: Response) => {
    try {
      const { assemblyId, runId, runType } = req.body;
      if (!assemblyId || !runId || !runType) {
        return res.status(400).json({ error: "assemblyId, runId, and runType are required" });
      }
      if (!VALID_RUN_TYPES.includes(runType)) {
        return res.status(400).json({ error: `Invalid runType. Must be one of: ${VALID_RUN_TYPES.join(", ")}` });
      }

      const runDir = safeRunPath(runId);
      if (!runDir) {
        return res.status(400).json({ error: "Invalid runId format" });
      }
      if (!fs.existsSync(runDir)) {
        return res.status(404).json({ error: `Build run directory not found: ${runId}` });
      }

      const certRun = await planRun(assemblyId, runId, runType as CertificationRunType);
      res.status(201).json(certRun);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/avcs/runs/:certRunId/start", async (req: Request, res: Response) => {
    try {
      const { certRunId } = req.params;
      const store = ensureStore();
      const run = store.getRun(certRunId);
      if (!run) {
        return res.status(404).json({ error: "Certification run not found" });
      }
      if (run.status !== "planned") {
        return res.status(400).json({ error: `Run is in '${run.status}' state, must be 'planned' to start` });
      }

      res.json({ ...run, status: "running" });

      setImmediate(() => {
        executeRun(certRunId).catch((err: any) => {
          console.error(`[AVCS] Run ${certRunId} failed:`, err.message);
        });
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/runs", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const { assemblyId } = req.query;
      let runs;
      if (assemblyId) {
        runs = store.listRunsForAssembly(String(assemblyId));
      } else {
        runs = store.listRuns();
      }
      runs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/runs/:certRunId", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const run = store.getRun(req.params.certRunId);
      if (!run) {
        return res.status(404).json({ error: "Certification run not found" });
      }
      res.json(run);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/runs/:certRunId/report", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const report = store.getReport(req.params.certRunId);
      if (!report) {
        return res.status(404).json({ error: "Report not found for this run" });
      }
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/runs/:certRunId/findings", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      let findings = store.getFindings(req.params.certRunId);
      const { severity, domain } = req.query;
      if (severity) {
        findings = findings.filter(f => f.severity === String(severity));
      }
      if (domain) {
        findings = findings.filter(f => f.domain === String(domain));
      }
      res.json(findings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/runs/:certRunId/evidence", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const evidence = store.getEvidence(req.params.certRunId);
      res.json(evidence);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/runs/:certRunId/coverage", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const report = store.getReport(req.params.certRunId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report.coverage_summary || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/avcs/findings/:findingId", (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const { findingId } = req.params;
      const { status } = req.body;
      if (!status || !["open", "acknowledged", "resolved", "suppressed"].includes(status)) {
        return res.status(400).json({ error: "status must be one of: open, acknowledged, resolved, suppressed" });
      }

      const allRuns = store.listRuns();
      let updated = false;
      for (const run of allRuns) {
        const findings = store.getFindings(run.id);
        const finding = findings.find(f => f.id === findingId);
        if (finding) {
          finding.status = status;
          const findingPath = path.join(AVCS_DATA_DIR, "findings", `${findingId}.json`);
          fs.writeFileSync(findingPath, JSON.stringify(finding, null, 2), "utf-8");
          updated = true;
          res.json(finding);
          return;
        }
      }
      if (!updated) {
        return res.status(404).json({ error: "Finding not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/avcs/runs/:certRunId/remediate", async (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const run = store.getRun(req.params.certRunId);
      if (!run) {
        return res.status(404).json({ error: "Certification run not found" });
      }
      if (run.status !== "completed") {
        return res.status(400).json({ error: "Run must be completed before remediation" });
      }

      const reportPath = path.join(AVCS_DATA_DIR, "reports", `${run.id}.json`);
      if (!fs.existsSync(reportPath)) {
        return res.status(404).json({ error: "Report not found for this run" });
      }

      const buildRunId = run.run_id;
      for (const [, tracker] of remediationStatus) {
        if (tracker.status === "running" && tracker.runId === buildRunId) {
          return res.status(409).json({ error: "Remediation already in progress for this build" });
        }
      }

      const certRunId = run.id;
      remediationStatus.set(certRunId, {
        status: "running",
        runId: buildRunId,
        startedAt: new Date().toISOString(),
        filesFixed: 0,
        filesFailed: 0,
        filesUnchanged: 0,
        errors: [],
      });

      res.json({ status: "remediation_started", certRunId, runId: run.run_id });

      remediateFromReport(run.run_id, reportPath).then(result => {
        const tracker = remediationStatus.get(certRunId)!;
        tracker.completedAt = new Date().toISOString();
        tracker.filesFixed = result.remediationLog.filesFixed.length;
        tracker.filesFailed = result.remediationLog.filesFailed.length;
        tracker.filesUnchanged = result.remediationLog.filesUnchanged.length;
        tracker.errors = result.errors;
        const hasCriticalFailure = !result.success || (result.filesRegenerated === 0 && result.filesFailed > 0);
        tracker.status = hasCriticalFailure ? "failed" : "complete";
        console.log(`[AVCS] Remediation ${tracker.status} for ${certRunId}: ${result.filesRegenerated} fixed, ${result.filesFailed} failed`);
      }).catch(err => {
        const tracker = remediationStatus.get(certRunId);
        if (tracker) {
          tracker.status = "failed";
          tracker.completedAt = new Date().toISOString();
          tracker.errors = [err.message];
        }
        console.error(`[AVCS] Remediation failed for ${certRunId}:`, err.message);
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/runs/:certRunId/remediation-status", (req: Request, res: Response) => {
    try {
      const { certRunId } = req.params;
      const tracker = remediationStatus.get(certRunId);
      if (!tracker) {
        return res.status(404).json({ error: "No remediation found for this run" });
      }
      res.json({
        certRunId,
        status: tracker.status,
        startedAt: tracker.startedAt,
        completedAt: tracker.completedAt ?? null,
        filesFixed: tracker.filesFixed,
        filesFailed: tracker.filesFailed,
        filesUnchanged: tracker.filesUnchanged,
        errors: tracker.errors,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/avcs/runs/:certRunId/rollback", async (req: Request, res: Response) => {
    try {
      const store = ensureStore();
      const run = store.getRun(req.params.certRunId);
      if (!run) {
        return res.status(404).json({ error: "Certification run not found" });
      }

      for (const [, t] of remediationStatus) {
        if (t.status === "running" && t.runId === run.run_id) {
          return res.status(409).json({ error: "Cannot rollback while remediation is in progress for this build" });
        }
      }

      console.log(`[AVCS] Rolling back remediation for cert run ${run.id}, build run ${run.run_id}`);
      const result = await rollbackRemediation(run.run_id);

      if (result.success) {
        const tracker = remediationStatus.get(run.id);
        if (tracker) {
          tracker.status = "rolled_back" as any;
          tracker.completedAt = new Date().toISOString();
        }
        console.log(`[AVCS] Rollback complete: ${result.filesRestored} files restored`);
        res.json({ status: "rolled_back", filesRestored: result.filesRestored });
      } else {
        res.status(500).json({ error: result.error || "Rollback failed" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/status", (_req: Request, res: Response) => {
    try {
      const status = getAVCSStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/catalog", (req: Request, res: Response) => {
    try {
      const { domain, mvpOnly } = req.query;
      let tests = [...TEST_CATALOG];
      if (domain) {
        tests = getTestsByDomain(String(domain).toUpperCase() as AVCSTestDomain);
      }
      if (mvpOnly === "true") {
        const mvpIds = new Set(getMVPTests().map(t => t.id));
        tests = tests.filter(t => mvpIds.has(t.id));
      }
      res.json({ total: tests.length, tests });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/catalog/:testId", (req: Request, res: Response) => {
    try {
      const test = getTestById(req.params.testId.toUpperCase());
      if (!test) {
        return res.status(404).json({ error: `Test ${req.params.testId} not found in catalog` });
      }
      res.json(test);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/tools", async (req: Request, res: Response) => {
    try {
      const adapterStatuses = await getAdapterStatus();
      const tools = TOOL_REGISTRY.map(tool => {
        const adapterInfo = adapterStatuses.find(s => s.toolId === tool.id);
        return {
          ...tool,
          adapterStatus: adapterInfo?.status ?? "not_available",
          adapterMessage: adapterInfo?.message,
        };
      });
      res.json({ total: tools.length, tools });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/avcs/tools/status", async (_req: Request, res: Response) => {
    try {
      const statuses = await getAdapterStatus();
      const available = statuses.filter(s => s.status === "available").length;
      const total = statuses.length;
      res.json({
        summary: { available, total, stubbed: total - available },
        tools: statuses,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/avcs/plan", (req: Request, res: Response) => {
    try {
      const { runType, mvpOnly, includeDomains, excludeTests } = req.body;
      if (!runType || !VALID_RUN_TYPES.includes(runType)) {
        return res.status(400).json({ error: `runType required and must be one of: ${VALID_RUN_TYPES.join(", ")}` });
      }
      const plan = buildTestPlan(runType as CertificationRunType, {
        mvpOnly: mvpOnly !== false,
        includeDomains: includeDomains as AVCSTestDomain[] | undefined,
        excludeTests: excludeTests as string[] | undefined,
      });
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
