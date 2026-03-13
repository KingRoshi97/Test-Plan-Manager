import { type Express, type Request, type Response } from "express";
import { storage } from "./storage.js";
import { insertAssemblySchema } from "../shared/schema.js";
import { startPipelineRun, killPipeline, getPipelineStatus } from "./pipeline-runner.js";
import { generateAutofillSuggestions } from "./openai.js";
import { getStageOrder, getStageGates, getGatesRequired, getStageNames } from "../Axion/src/core/orchestration/loader.js";
import { registerMusRoutes } from "./mus-routes.js";
import { registerAVCSRoutes } from "./avcs-routes.js";
import { registerAnalyticsRoutes } from "./analytics/analytics-routes.js";
import { registerUpgradeRoutes } from "./upgrade-routes.js";
import { startCompilation, getCompilationStatus } from "./preview-compiler.js";
import { generateProjectOverview } from "./preview-overview.js";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import multer from "multer";
import crypto from "crypto";
import { spawn, type ChildProcess } from "child_process";

const AXION_ROOT = path.resolve(process.cwd(), "Axion");
const AXION_RUNS = path.resolve(AXION_ROOT, ".axion", "runs");
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".txt", ".zip", ".doc", ".docx", ".md", ".csv", ".json", ".xml", ".rtf", ".xlsx", ".xls",
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const uniqueId = crypto.randomBytes(8).toString("hex");
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueId}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`File type ${ext} is not allowed`));
    }
    cb(null, true);
  },
});

function safePath(userPath: string): string | null {
  const resolved = path.resolve(AXION_RUNS, userPath);
  if (!resolved.startsWith(AXION_RUNS + path.sep) && resolved !== AXION_RUNS) return null;
  return resolved;
}

async function fileExists(p: string): Promise<boolean> {
  try { await fsp.access(p); return true; } catch { return false; }
}

async function safeReadJson(filePath: string): Promise<any> {
  const raw = await fsp.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export function registerRoutes(app: Express) {
  app.get("/api/assemblies", async (_req: Request, res: Response) => {
    try {
      const rows = await storage.getAssemblies();
      const enriched = await Promise.all(
        rows.map(async (a) => {
          if (!a.runId) return a;
          const run = await storage.getPipelineRunByRunId(a.runId);
          return { ...a, latestStages: run?.stages || null };
        })
      );
      res.json(enriched);
    } catch (err: any) {
      console.error("Failed to fetch assemblies:", err);
      res.status(500).json({ error: "Failed to fetch assemblies" });
    }
  });

  app.get("/api/assemblies/:id", async (req: Request, res: Response) => {
    try {
      const assembly = await storage.getAssembly(Number(req.params.id));
      if (!assembly) return res.status(404).json({ error: "Not found" });
      const runs = await storage.getPipelineRuns(assembly.id);
      res.json({ ...assembly, runs });
    } catch (err: any) {
      console.error("Failed to fetch assembly:", err);
      res.status(500).json({ error: "Failed to fetch assembly" });
    }
  });

  app.post("/api/assemblies", async (req: Request, res: Response) => {
    try {
      const parsed = insertAssemblySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
      const assembly = await storage.createAssembly(parsed.data);
      res.status(201).json(assembly);
    } catch (err: any) {
      console.error("Failed to create assembly:", err);
      res.status(500).json({ error: "Failed to create assembly" });
    }
  });

  app.delete("/api/assemblies/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });
      await storage.deleteAssembly(id);
      res.json({ ok: true });
    } catch (err: any) {
      console.error("Failed to delete assembly:", err);
      res.status(500).json({ error: "Failed to delete assembly" });
    }
  });

  app.patch("/api/assemblies/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });
      if (assembly.status === "running") return res.status(409).json({ error: "Cannot update while running" });

      const allowedFields = ["projectName", "idea", "preset", "intakePayload", "config", "familyId", "familyName", "familyType", "lifecycleState", "ownerName", "teamName", "usageState", "parentAssemblyId", "dependencyMeta", "riskLevel", "attentionFlags", "controlPlane", "assignedAgents", "deprecationState", "deprecationTargetDate", "retirementCandidate", "requestsLast24h", "activeConsumers", "errorRatePct", "p95LatencyMs", "ecosystemRole"];
      const validRiskLevels = new Set(["low", "medium", "high", "critical", null]);
      const validLifecycles = new Set(["draft", "active", "in_use", "degraded", "deprecated", "archived"]);
      const validDeprecationStates = new Set(["none", "planned", "announced", "in_progress", "completed", null]);
      const validEcosystemRoles = new Set(["core", "supporting", "adapter", "integration", "edge", "experimental", null]);
      const update: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) update[key] = req.body[key];
      }
      if (update.riskLevel !== undefined && !validRiskLevels.has(update.riskLevel)) {
        return res.status(400).json({ error: "Invalid riskLevel. Must be: low, medium, high, critical, or null" });
      }
      if (update.lifecycleState !== undefined && !validLifecycles.has(update.lifecycleState)) {
        return res.status(400).json({ error: "Invalid lifecycleState" });
      }
      if (update.lifecycleState !== undefined && update.lifecycleState !== assembly.lifecycleState) {
        update.lifecycleUpdatedAt = new Date();
      }
      if (update.attentionFlags !== undefined && update.attentionFlags !== null) {
        if (!Array.isArray(update.attentionFlags) || !update.attentionFlags.every((f: any) => typeof f === "string")) {
          return res.status(400).json({ error: "attentionFlags must be an array of strings or null" });
        }
      }
      if (update.parentAssemblyId !== undefined && update.parentAssemblyId !== null && typeof update.parentAssemblyId !== "number") {
        return res.status(400).json({ error: "parentAssemblyId must be a number or null" });
      }
      if (update.dependencyMeta !== undefined && update.dependencyMeta !== null && typeof update.dependencyMeta !== "object") {
        return res.status(400).json({ error: "dependencyMeta must be an object or null" });
      }
      if (update.controlPlane !== undefined && update.controlPlane !== null && typeof update.controlPlane !== "string") {
        return res.status(400).json({ error: "controlPlane must be a string or null" });
      }
      if (update.assignedAgents !== undefined && update.assignedAgents !== null) {
        if (!Array.isArray(update.assignedAgents) || !update.assignedAgents.every((a: any) => a && typeof a === "object" && typeof a.id === "string" && typeof a.name === "string")) {
          return res.status(400).json({ error: "assignedAgents must be an array of {id, name, role?, status?} objects or null" });
        }
      }
      if (update.deprecationState !== undefined && !validDeprecationStates.has(update.deprecationState)) {
        return res.status(400).json({ error: "Invalid deprecationState. Must be: none, planned, announced, in_progress, completed, or null" });
      }
      if (update.deprecationTargetDate !== undefined && update.deprecationTargetDate !== null) {
        const d = new Date(update.deprecationTargetDate);
        if (isNaN(d.getTime())) return res.status(400).json({ error: "deprecationTargetDate must be a valid ISO date string or null" });
        update.deprecationTargetDate = d;
      }
      if (update.retirementCandidate !== undefined && update.retirementCandidate !== null && typeof update.retirementCandidate !== "boolean") {
        return res.status(400).json({ error: "retirementCandidate must be a boolean or null" });
      }
      if (update.ecosystemRole !== undefined && !validEcosystemRoles.has(update.ecosystemRole)) {
        return res.status(400).json({ error: "Invalid ecosystemRole. Must be: core, supporting, adapter, integration, edge, experimental, or null" });
      }
      const numericFields = ["requestsLast24h", "activeConsumers", "errorRatePct", "p95LatencyMs"];
      for (const nf of numericFields) {
        if (update[nf] !== undefined && update[nf] !== null && typeof update[nf] !== "number") {
          return res.status(400).json({ error: `${nf} must be a number or null` });
        }
      }
      if (Object.keys(update).length === 0) return res.status(400).json({ error: "No valid fields to update" });

      const updated = await storage.updateAssembly(id, update);
      res.json(updated);
    } catch (err: any) {
      console.error("Failed to update assembly:", err);
      res.status(500).json({ error: "Failed to update assembly" });
    }
  });

  app.get("/api/assemblies/:id/relationships", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      let parent: { id: number; projectName: string; status: string } | null = null;
      if (assembly.parentAssemblyId) {
        const p = await storage.getAssembly(assembly.parentAssemblyId);
        if (p) parent = { id: p.id, projectName: p.projectName, status: p.status };
      }

      const allAssemblies = await storage.getAssemblies();
      const children = allAssemblies
        .filter((a) => a.parentAssemblyId === id)
        .map((a) => ({ id: a.id, projectName: a.projectName, status: a.status }));

      const depMeta = (assembly.dependencyMeta || {}) as Record<string, any>;
      const safeArray = (v: any) => Array.isArray(v) ? v : [];

      res.json({
        parent,
        children,
        upstreamDeps: safeArray(depMeta.upstreamDeps),
        downstreamDeps: safeArray(depMeta.downstreamDeps),
        sharedRegistries: safeArray(depMeta.sharedRegistries),
        sharedApis: safeArray(depMeta.sharedApis),
      });
    } catch (err: any) {
      console.error("Failed to fetch relationships:", err);
      res.status(500).json({ error: "Failed to fetch relationships" });
    }
  });

  app.get("/api/assemblies/:id/kit", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      const requestedRunId = req.query.runId as string | undefined;
      const runId = requestedRunId || assembly.runId;
      if (!runId) return res.status(404).json({ error: "No completed run" });

      if (requestedRunId) {
        const pipelineRun = await storage.getPipelineRunByRunId(runId);
        if (!pipelineRun || pipelineRun.assemblyId !== id) {
          return res.status(403).json({ error: "Run does not belong to this assembly" });
        }
      }

      const safeRunDir = safePath(runId);
      if (!safeRunDir) return res.status(400).json({ error: "Invalid run ID" });

      const kitDir = path.join(safeRunDir, "kit", "bundle", "agent_kit");
      const altKitDir = path.join(safeRunDir, "kit");
      const targetDir = await fileExists(kitDir) ? kitDir : await fileExists(altKitDir) ? altKitDir : null;
      if (!targetDir) return res.status(404).json({ error: "Kit not found" });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${assembly.projectName.replace(/[^a-zA-Z0-9_-]/g, "_")}_kit.zip"`);
      const archive = archiver("zip", { zlib: { level: 6 } });
      archive.on("error", () => { if (!res.headersSent) res.status(500).end(); else res.end(); });
      archive.pipe(res);
      archive.directory(targetDir, "agent_kit");
      archive.finalize();
    } catch (err: any) {
      console.error("Failed to fetch kit:", err);
      if (!res.headersSent) res.status(500).json({ error: "Failed to fetch kit" });
    }
  });

  app.post("/api/assemblies/:id/run", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });
      if (assembly.status === "running") return res.status(409).json({ error: "Already running" });

      const pipelineRun = await startPipelineRun(assembly);
      res.json(pipelineRun);
    } catch (err: any) {
      console.error("Failed to start pipeline run:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:id/kill", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });
      if (assembly.status !== "running") return res.status(409).json({ error: "Pipeline is not running" });

      const result = await killPipeline(id);
      if (!result.killed) {
        await storage.updateAssembly(id, {
          status: "failed",
          currentStep: "killed",
          error: "Pipeline killed by user (stale process)",
        });
        const runs = await storage.getPipelineRuns(id);
        const activeRun = runs.find((r: any) => r.status === "running");
        if (activeRun) {
          const stages = (activeRun.stages || {}) as Record<string, any>;
          for (const key of Object.keys(stages)) {
            if (stages[key].status === "pending" || stages[key].status === "running") {
              stages[key].status = "cancelled";
            }
          }
          await storage.updatePipelineRun(activeRun.id, {
            status: "failed",
            completedAt: new Date(),
            error: "Pipeline killed by user (stale process)",
            stages,
          });
        }
        res.json({ killed: true, message: "Stale pipeline state cleaned up" });
      } else {
        res.json(result);
      }
    } catch (err: any) {
      console.error("Failed to kill pipeline:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/pipeline/status", (_req: Request, res: Response) => {
    try {
      const raw = getPipelineStatus();
      const activeRuns = raw.map((r) => ({
        assemblyId: r.assemblyId,
        runId: r.runId,
        currentStage: r.currentStage,
        startTime: new Date(r.startTime).toISOString(),
        lastActivityAt: new Date(r.lastActivityAt).toISOString(),
        elapsedMs: r.elapsedMs,
        stalledMs: r.inactiveMs,
        stallTimeoutMs: r.stallTimeoutMs,
      }));
      res.json({ activeRuns });
    } catch (err: any) {
      console.error("Failed to fetch pipeline status:", err);
      res.status(500).json({ error: "Failed to fetch pipeline status" });
    }
  });

  app.get("/api/assemblies/:id/runs", async (req: Request, res: Response) => {
    try {
      const runs = await storage.getPipelineRuns(Number(req.params.id));
      res.json(runs);
    } catch (err: any) {
      console.error("Failed to fetch pipeline runs:", err);
      res.status(500).json({ error: "Failed to fetch pipeline runs" });
    }
  });

  app.get("/api/assemblies/:id/runs/buildable", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      const pipelineRunsList = await storage.getPipelineRuns(id);
      const buildableRuns: Array<{
        runId: string;
        status: string;
        completedAt: string | null;
        startedAt: string;
        hasKit: boolean;
        hasBuild: boolean;
        buildStatus: string | null;
        kitVersion: string | null;
        systemVersion: string | null;
        kitFileCount: number | null;
        sha: string | null;
      }> = [];

      for (const run of pipelineRunsList) {
        if (!run.runId || run.status !== "completed") continue;
        const runDir = path.join(AXION_RUNS, run.runId);
        const kitDir = path.join(runDir, "kit");
        const hasKit = await fileExists(kitDir);
        if (!hasKit) continue;

        const buildDir = path.join(runDir, "build");
        const buildZipPath = path.join(buildDir, "project_repo.zip");
        const hasBuild = await fileExists(buildZipPath);
        let buildStatus: string | null = null;
        const buildManifestPath = path.join(buildDir, "build_manifest.json");
        if (hasBuild && await fileExists(buildManifestPath)) {
          try {
            const manifest = await safeReadJson(buildManifestPath);
            buildStatus = manifest.status || null;
          } catch (parseErr) {
            console.error(`Failed to parse build manifest at ${buildManifestPath}:`, parseErr);
          }
        }

        let kitVersion: string | null = null;
        let systemVersion: string | null = null;
        let kitFileCount: number | null = null;
        let sha: string | null = null;

        const manifestPath = path.join(kitDir, "bundle", "agent_kit", "kit_manifest.json");
        const altManifestPath = path.join(kitDir, "kit_manifest.json");
        const mPath = fs.existsSync(manifestPath) ? manifestPath : fs.existsSync(altManifestPath) ? altManifestPath : null;
        if (mPath) {
          try {
            const km = JSON.parse(fs.readFileSync(mPath, "utf-8"));
            kitVersion = km.version || km.kit_version || null;
            kitFileCount = km.file_count ?? (km.files ? km.files.length : null);
          } catch {}
        }

        const stampPath = path.join(kitDir, "bundle", "agent_kit", "version_stamp.json");
        const altStampPath = path.join(kitDir, "version_stamp.json");
        const sPath = fs.existsSync(stampPath) ? stampPath : fs.existsSync(altStampPath) ? altStampPath : null;
        if (sPath) {
          try {
            const vs = JSON.parse(fs.readFileSync(sPath, "utf-8"));
            systemVersion = vs.system_version || vs.axion_version || null;
            sha = vs.sha || vs.integrity || vs.git_sha || null;
          } catch {}
        }

        if (!kitFileCount) {
          try {
            const kitRoot = fs.existsSync(path.join(kitDir, "bundle", "agent_kit")) ? path.join(kitDir, "bundle", "agent_kit") : kitDir;
            const entries = fs.readdirSync(kitRoot);
            kitFileCount = entries.filter(e => !fs.statSync(path.join(kitRoot, e)).isDirectory()).length;
          } catch {}
        }

        buildableRuns.push({
          runId: run.runId,
          status: run.status,
          completedAt: run.completedAt?.toISOString() ?? null,
          startedAt: run.startedAt.toISOString(),
          hasKit,
          hasBuild,
          buildStatus,
          kitVersion,
          systemVersion,
          kitFileCount,
          sha,
        });
      }

      res.json({ runs: buildableRuns });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:id/runs/:runId", async (req: Request, res: Response) => {
    try {
      const run = await storage.getPipelineRunByRunId(req.params.runId);
      if (!run || run.assemblyId !== Number(req.params.id)) return res.status(404).json({ error: "Not found" });
      res.json(run);
    } catch (err: any) {
      console.error("Failed to fetch pipeline run:", err);
      res.status(500).json({ error: "Failed to fetch pipeline run" });
    }
  });

  app.get("/api/assemblies/:id/stages/:stageKey", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const stageKey = req.params.stageKey;
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Assembly not found" });
      if (!assembly.runId) return res.status(404).json({ error: "No run available" });

      const reportPath = path.join(AXION_RUNS, assembly.runId, "stage_reports", `${stageKey}.json`);
      if (await fileExists(reportPath)) {
        try {
          const content = await safeReadJson(reportPath);
          return res.json(content);
        } catch (err) {
          console.error(`Failed to parse stage report at ${reportPath}:`, err);
          return res.status(500).json({ error: "Malformed stage report file" });
        }
      }

      const run = await storage.getPipelineRunByRunId(assembly.runId);
      if (!run) return res.status(404).json({ error: "Run not found" });
      const stages = (run.stages || {}) as Record<string, any>;
      if (stages[stageKey]) {
        const s = stages[stageKey];
        return res.json({
          stage_id: stageKey,
          run_id: assembly.runId,
          status: s.status,
          started_at: s.startedAt || s.started_at || null,
          finished_at: s.completedAt || s.finished_at || null,
          consumed: s.consumed || [],
          produced: s.produced || [],
          notes: s.notes || [],
          gate_reports: s.gate_reports || [],
        });
      }

      return res.status(404).json({ error: "Stage not found" });
    } catch (err: any) {
      console.error("Failed to fetch stage:", err);
      res.status(500).json({ error: "Failed to fetch stage" });
    }
  });

  app.get("/api/assemblies/:id/gates/:gateId", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const gateId = req.params.gateId;
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Assembly not found" });
      if (!assembly.runId) return res.status(404).json({ error: "No run available" });

      const reportPath = path.join(AXION_RUNS, assembly.runId, "gates", `${gateId}.gate_report.json`);
      if (await fileExists(reportPath)) {
        try {
          const content = await safeReadJson(reportPath);
          return res.json(content);
        } catch (err) {
          console.error(`Failed to parse gate report at ${reportPath}:`, err);
          return res.status(500).json({ error: "Malformed gate report file" });
        }
      }

      const rpts = await storage.getReports(id);
      const gateReport = rpts.find(
        (r) => r.reportType === "gate_result" && (r.content as any)?.gate === gateId
      );
      if (gateReport) {
        return res.json(gateReport.content);
      }

      return res.status(404).json({ error: "Gate report not found" });
    } catch (err: any) {
      console.error("Failed to fetch gate report:", err);
      res.status(500).json({ error: "Failed to fetch gate report" });
    }
  });

  app.get("/api/artifacts/:runId", async (req: Request, res: Response) => {
    try {
      const runId = req.params.runId;
      const runDir = safePath(runId);
      if (!runDir) return res.status(400).json({ error: "Invalid run ID" });
      const indexPath = path.join(runDir, "artifact_index.json");
      if (!await fileExists(indexPath)) return res.status(404).json({ error: "Artifact index not found" });
      const content = await safeReadJson(indexPath);
      return res.json(content);
    } catch (err) {
      console.error(`Failed to read artifact index:`, err);
      return res.status(500).json({ error: "Malformed artifact index" });
    }
  });

  app.get("/api/artifacts/:runId/manifest", async (req: Request, res: Response) => {
    try {
      const runId = req.params.runId;
      const runDir = safePath(runId);
      if (!runDir) return res.status(400).json({ error: "Invalid run ID" });
      const manifestPath = path.join(runDir, "run_manifest.json");
      if (!await fileExists(manifestPath)) return res.status(404).json({ error: "Run manifest not found" });
      const content = await safeReadJson(manifestPath);
      return res.json(content);
    } catch (err) {
      console.error(`Failed to read run manifest:`, err);
      return res.status(500).json({ error: "Malformed run manifest" });
    }
  });

  app.get("/api/artifacts/:runId/tree", async (req: Request, res: Response) => {
    try {
      const runId = req.params.runId;
      const runDir = safePath(runId);
      if (!runDir) return res.status(400).json({ error: "Invalid run ID" });
      if (!await fileExists(runDir)) return res.status(404).json({ error: "Run directory not found" });

      async function buildTree(dirPath: string, relativeTo: string): Promise<any[]> {
        const entries = await fsp.readdir(dirPath, { withFileTypes: true });
        const result: any[] = [];
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relPath = path.relative(AXION_RUNS, fullPath);
          if (entry.isDirectory()) {
            result.push({
              name: entry.name,
              type: "directory",
              path: relPath,
              children: await buildTree(fullPath, relativeTo),
            });
          } else {
            const stat = await fsp.stat(fullPath);
            result.push({
              name: entry.name,
              type: "file",
              path: relPath,
              size: stat.size,
            });
          }
        }
        result.sort((a, b) => {
          if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        return result;
      }

      const tree = await buildTree(runDir, runDir);
      return res.json(tree);
    } catch (err) {
      console.error(`Failed to build tree:`, err);
      return res.status(500).json({ error: "Failed to build directory tree" });
    }
  });

  app.get("/api/reports/:assemblyId", async (req: Request, res: Response) => {
    try {
      const rpts = await storage.getReports(Number(req.params.assemblyId));
      res.json(rpts);
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/files", async (req: Request, res: Response) => {
    try {
      const dir = (req.query.dir as string) || "";
      const base = safePath(dir);
      if (!base || !await fileExists(base)) return res.json([]);
      const entries = await fsp.readdir(base, { withFileTypes: true });
      res.json(entries.map((e) => ({
        name: e.name,
        type: e.isDirectory() ? "directory" : "file",
        path: path.join(dir, e.name),
      })));
    } catch (err: any) {
      console.error("Failed to list files:", err);
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  app.get("/api/files/{*filePath}", async (req: Request, res: Response) => {
    try {
      const rawPath = (req.params as any).filePath;
      const filePath = Array.isArray(rawPath) ? rawPath.join("/") : String(rawPath || "");
      const full = safePath(filePath);
      if (!full) return res.status(403).json({ error: "Forbidden" });
      if (!await fileExists(full)) return res.status(404).json({ error: "File not found" });
      const stat = await fsp.stat(full);
      if (stat.isDirectory()) {
        const entries = await fsp.readdir(full, { withFileTypes: true });
        return res.json(entries.map((e) => ({
          name: e.name,
          type: e.isDirectory() ? "directory" : "file",
          path: path.join(filePath, e.name),
        })));
      }
      const content = await fsp.readFile(full, "utf-8");
      res.json({ path: filePath, content });
    } catch (err: any) {
      console.error("Failed to read file:", err);
      res.status(500).json({ error: "Failed to read file" });
    }
  });

  app.get("/api/health", async (_req: Request, res: Response) => {
    try {
      async function countDir(dir: string, filter: (f: string) => boolean): Promise<number> {
        if (!(await fileExists(dir))) return 0;
        return (await fsp.readdir(dir)).filter(filter).length;
      }
      async function readJson(fp: string, extract: (d: any) => number): Promise<number> {
        if (!(await fileExists(fp))) return 0;
        try { return extract(JSON.parse(await fsp.readFile(fp, "utf-8"))); }
        catch (err) { console.error(`Health check: failed to parse ${fp}:`, err); return 0; }
      }
      const isDoc = (f: string) => f.endsWith(".md") || f.endsWith(".txt");
      const isJson = (f: string) => f.endsWith(".json");

      let gateCount = 0, kidCount = 0;
      try { gateCount = (JSON.parse(await fsp.readFile(path.join(AXION_ROOT, "registries", "GATE_REGISTRY.json"), "utf-8"))).gates?.length || 0; }
      catch (err) { console.error("Health check: failed to read gate registry:", err); }
      try { const kl = JSON.parse(await fsp.readFile(path.join(AXION_ROOT, "libraries", "knowledge", "SYSTEM", "registries", "knowledge.index.json"), "utf-8")); kidCount = Array.isArray(kl) ? kl.length : (kl.total_items || 0); }
      catch (err) { console.error("Health check: failed to read knowledge index:", err); }

      let recentRuns: string[] = [];
      if (await fileExists(AXION_RUNS)) {
        recentRuns = (await fsp.readdir(AXION_RUNS)).filter((d) => d.startsWith("RUN-")).sort().reverse().slice(0, 5);
      }

      const sysLibDir = path.join(AXION_ROOT, "libraries", "system");
      let sysDocCount = 0, sysSchemaCount = 0, sysRegistryCount = 0;
      try { sysDocCount = await countDir(sysLibDir, isDoc); sysSchemaCount = await countDir(path.join(sysLibDir, "schemas"), isJson); sysRegistryCount = await countDir(path.join(sysLibDir, "registries"), isJson); }
      catch (err) { console.error("Health check: failed to read system library:", err); }

      const orcLibDir = path.join(AXION_ROOT, "libraries", "orchestration");
      let orcDocCount = 0, orcSchemaCount = 0, orcRegistryCount = 0, orcStageCount = 0;
      try { orcDocCount = await countDir(orcLibDir, (f) => isDoc(f) || (isJson(f) && f.startsWith("ORC-"))); orcSchemaCount = await countDir(path.join(orcLibDir, "schemas"), isJson); const orcRegDir = path.join(orcLibDir, "registries"); orcRegistryCount = await countDir(orcRegDir, isJson); orcStageCount = await readJson(path.join(orcRegDir, "pipeline_definition.axion.v1.json"), (d) => d.stage_order?.length ?? 0); }
      catch (err) { console.error("Health check: failed to read orchestration library:", err); }

      const gatesLibDir = path.join(AXION_ROOT, "libraries", "gates");
      let gatesDocCount = 0, gatesSchemaCount = 0, gatesRegistryCount = 0, gatesDefinitionCount = 0;
      try { gatesDocCount = await countDir(gatesLibDir, isDoc); gatesSchemaCount = await countDir(path.join(gatesLibDir, "schemas"), isJson); const gatesRegDir = path.join(gatesLibDir, "registries"); gatesRegistryCount = await countDir(gatesRegDir, isJson); gatesDefinitionCount = await readJson(path.join(gatesRegDir, "gate_registry.axion.v1.json"), (d) => d.gates?.length ?? 0); }
      catch (err) { console.error("Health check: failed to read gates library:", err); }

      const polLibDir = path.join(AXION_ROOT, "libraries", "policy");
      let polDocCount = 0, polSchemaCount = 0, polRegistryCount = 0, polRiskClassCount = 0, polPolicySetCount = 0;
      try { polDocCount = await countDir(polLibDir, isDoc); polSchemaCount = await countDir(path.join(polLibDir, "schemas"), isJson); const polRegDir = path.join(polLibDir, "registries"); polRegistryCount = await countDir(polRegDir, isJson); polRiskClassCount = await readJson(path.join(polRegDir, "risk_classes.v1.json"), (d) => d.classes?.length ?? 0); polPolicySetCount = await readJson(path.join(polRegDir, "policy_sets.v1.json"), (d) => d.policy_sets?.length ?? 0); }
      catch (err) { console.error("Health check: failed to read policy library:", err); }

      const intLibDir = path.join(AXION_ROOT, "libraries", "intake");
      let intDocCount = 0, intSchemaCount = 0, intRegistryCount = 0, intEnumCount = 0;
      try { intDocCount = await countDir(intLibDir, isDoc); intSchemaCount = await countDir(path.join(intLibDir, "schemas"), isJson); const intRegDir = path.join(intLibDir, "registries"); intRegistryCount = await countDir(intRegDir, isJson); intEnumCount = await readJson(path.join(intRegDir, "intake_enums.v1.json"), (d) => d.enums?.length ?? 0); }
      catch (err) { console.error("Health check: failed to read intake library:", err); }

      const canonical = await (async () => { let d = 0, s = 0, r = 0, e = 0, rl = 0; try { const dir = path.join(AXION_ROOT, "libraries", "canonical"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "schemas"), isJson); const rDir = path.join(dir, "registries"); r = await countDir(rDir, isJson); rl = await readJson(path.join(rDir, "relationship_constraints.v1.json"), (x) => x.constraints?.length ?? 0); e = await readJson(path.join(rDir, "id_rules.v1.json"), (x) => Object.keys(x.canonical_key_templates ?? {}).length); } catch (err) { console.error("Health check: failed to read canonical library:", err); } return { docs: d, schemas: s, registries: r, entityTypes: e, relationshipTypes: rl }; })();
      const standards = await (async () => { let d = 0, s = 0, r = 0, p = 0, ru = 0; try { const dir = path.join(AXION_ROOT, "libraries", "standards"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "schemas"), isJson); r = await countDir(path.join(dir, "registries"), isJson); const pDir = path.join(dir, "packs"); if (await fileExists(pDir)) { const pf = (await fsp.readdir(pDir)).filter(isJson); p = pf.length; for (const f of pf) { try { ru += (JSON.parse(await fsp.readFile(path.join(pDir, f), "utf-8"))).rules?.length ?? 0; } catch (e2) { console.error(`Health check: failed to parse pack ${f}:`, e2); } } } } catch (err) { console.error("Health check: failed to read standards library:", err); } return { docs: d, schemas: s, registries: r, packs: p, rules: ru }; })();
      const templates_library = await (async () => { let d = 0, s = 0, r = 0, c = 0; try { const dir = path.join(AXION_ROOT, "libraries", "templates"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "schemas"), isJson); const rDir = path.join(dir, "registries"); r = await countDir(rDir, isJson); c = await readJson(path.join(rDir, "template_category_order.v1.json"), (x) => x.order?.length ?? 0); } catch (err) { console.error("Health check: failed to read templates library:", err); } return { docs: d, schemas: s, registries: r, categories: c }; })();
      const planning_library = await (async () => { let d = 0, s = 0, r = 0, c = 0; try { const dir = path.join(AXION_ROOT, "libraries", "planning"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "schemas"), isJson); const rDir = path.join(dir, "registries"); r = await countDir(rDir, isJson); c = await readJson(path.join(rDir, "plan_coverage_rules.v1.json"), (x) => x.rules?.length ?? 0); } catch (err) { console.error("Health check: failed to read planning library:", err); } return { docs: d, schemas: s, registries: r, coverageRules: c }; })();
      const verification_library = await (async () => { let d = 0, s = 0, r = 0, p = 0; try { const dir = path.join(AXION_ROOT, "libraries", "verification"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "schemas"), isJson); const rDir = path.join(dir, "registries"); r = await countDir(rDir, isJson); p = await readJson(path.join(rDir, "proof_types.v1.json"), (x) => x.types?.length ?? 0); } catch (err) { console.error("Health check: failed to read verification library:", err); } return { docs: d, schemas: s, registries: r, proofTypes: p }; })();
      const kit_library = await (async () => { let d = 0, s = 0, r = 0, g = 0; try { const dir = path.join(AXION_ROOT, "libraries", "kit"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "schemas"), isJson); r = await countDir(path.join(dir, "registries"), isJson); g = await readJson(path.join(dir, "KIT-5_kit_gates.spec.json"), (x) => x.gates?.length ?? 0); } catch (err) { console.error("Health check: failed to read kit library:", err); } return { docs: d, schemas: s, registries: r, gates: g }; })();
      const telemetry_library = await (async () => { let d = 0, s = 0, r = 0, g = 0, e = 0; try { const dir = path.join(AXION_ROOT, "libraries", "telemetry"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "schemas"), isJson); const rDir = path.join(dir, "registries"); r = await countDir(rDir, isJson); g = await readJson(path.join(dir, "TEL-5_telemetry_gates.spec.json"), (x) => x.gates?.length ?? 0); e = await readJson(path.join(rDir, "telemetry_event_types.v1.json"), (x) => x.types?.length ?? 0); } catch (err) { console.error("Health check: failed to read telemetry library:", err); } return { docs: d, schemas: s, registries: r, gates: g, eventTypes: e }; })();
      const audit_library = await (async () => { let d = 0, s = 0, r = 0, g = 0, a = 0; try { const dir = path.join(AXION_ROOT, "libraries", "audit"); d = await countDir(dir, isDoc); const sDir = path.join(dir, "schemas"); s = await countDir(sDir, isJson); const rDir = path.join(dir, "registries"); r = await countDir(rDir, isJson); g = await readJson(path.join(dir, "AUD-5_audit_gates.spec.json"), (x) => x.gates?.length ?? 0); a = await readJson(path.join(sDir, "audit_action.v1.schema.json"), (x) => x.properties?.action_type?.enum?.length ?? 0); } catch (err) { console.error("Health check: failed to read audit library:", err); } return { docs: d, schemas: s, registries: r, gates: g, actionTypes: a }; })();
      const maintenance_library = await (async () => { let d = 0, s = 0, r = 0, g = 0, m = 0; try { const dir = path.join(AXION_ROOT, "libraries", "maintenance"); d = await countDir(dir, isDoc); s = await countDir(path.join(dir, "contracts"), (f) => isJson(f) && f !== "contract.meta.json"); const rDir = path.join(dir, "registries"); r = await countDir(rDir, isJson); g = await readJson(path.join(rDir, "REG-GATES-MUS.json"), (x) => x.items?.length ?? 0); m = await readJson(path.join(rDir, "REG-MAINTENANCE-MODES.json"), (x) => x.items?.length ?? 0); } catch (err) { console.error("Health check: failed to read maintenance library:", err); } return { docs: d, schemas: s, registries: r, gates: g, modes: m }; })();

      let engineVersion = "0.0.0";
      try { engineVersion = (JSON.parse(await fsp.readFile(path.join(AXION_ROOT, "package.json"), "utf-8"))).version || "0.0.0"; } catch (err) { console.error("Health check: failed to read engine version:", err); }
      let totalRuns = 0;
      try { totalRuns = ((JSON.parse(await fsp.readFile(path.join(AXION_ROOT, ".axion", "run_counter.json"), "utf-8"))).next ?? 1) - 1; } catch (err) { console.error("Health check: failed to read run counter:", err); }
      let auditEntries = 0;
      try { const ap = path.join(AXION_ROOT, ".axion", "audit.jsonl"); if (await fileExists(ap)) { auditEntries = (await fsp.readFile(ap, "utf-8")).split("\n").filter(Boolean).length; } } catch (err) { console.error("Health check: failed to read audit log:", err); }

      res.json({
        status: "ok",
        pipeline: { stages: 10, gates: gateCount },
        knowledge: { kids: kidCount },
        templates: 177,
        system: { docs: sysDocCount, schemas: sysSchemaCount, registries: sysRegistryCount },
        orchestration: { docs: orcDocCount, schemas: orcSchemaCount, registries: orcRegistryCount, stages: orcStageCount },
        gates: { docs: gatesDocCount, schemas: gatesSchemaCount, registries: gatesRegistryCount, definitions: gatesDefinitionCount },
        policy: { docs: polDocCount, schemas: polSchemaCount, registries: polRegistryCount, riskClasses: polRiskClassCount, policySets: polPolicySetCount },
        intake: { docs: intDocCount, schemas: intSchemaCount, registries: intRegistryCount, enums: intEnumCount },
        canonical, standards, templates_library, planning_library, verification_library,
        kit_library, telemetry_library, audit_library, maintenance_library,
        recentRuns, engineVersion, totalRuns, auditEntries,
      });
    } catch (err: any) {
      console.error("Health check failed:", err);
      res.status(500).json({ error: "Health check failed" });
    }
  });

  app.get("/api/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/audit-log", (_req: Request, res: Response) => {
    try {
      const auditPath = path.join(AXION_ROOT, ".axion", "audit.jsonl");
      if (!fs.existsSync(auditPath)) return res.json([]);
      const lines = fs.readFileSync(auditPath, "utf-8").split("\n").filter(Boolean);
      let entries = lines.map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);

      const runId = _req.query.run_id as string | undefined;
      if (runId) entries = entries.filter((e: any) => e.run_id === runId);

      const action = _req.query.action as string | undefined;
      if (action) entries = entries.filter((e: any) => e.action === action);

      entries.reverse();

      const limit = parseInt(_req.query.limit as string) || 100;
      entries = entries.slice(0, limit);

      return res.json(entries);
    } catch (err) {
      console.error("Failed to read audit log:", err);
      return res.status(500).json({ error: "Failed to read audit log" });
    }
  });

  app.get("/api/config", (_req: Request, res: Response) => {
    try {
      const repoRoot = process.cwd();
      const stageOrder = getStageOrder(repoRoot);
      const stageGates = getStageGates(repoRoot);
      const gatesRequired = getGatesRequired(repoRoot);
      const stageNames = getStageNames(repoRoot);

      if (stageOrder.length === 0) {
        return res.json({
          stageOrder: [
            "S1_INGEST_NORMALIZE", "S2_VALIDATE_INTAKE", "S3_BUILD_CANONICAL",
            "S4_VALIDATE_CANONICAL", "S5_RESOLVE_STANDARDS", "S6_SELECT_TEMPLATES",
            "S7_RENDER_DOCS", "S8_BUILD_PLAN", "S9_VERIFY_PROOF", "S10_PACKAGE",
          ],
          stageGates: {
            S2_VALIDATE_INTAKE: "G1_INTAKE_VALIDITY",
            S4_VALIDATE_CANONICAL: "G2_CANONICAL_INTEGRITY",
            S5_RESOLVE_STANDARDS: "G3_STANDARDS_RESOLVED",
            S6_SELECT_TEMPLATES: "G4_TEMPLATE_SELECTION",
            S7_RENDER_DOCS: "G5_TEMPLATE_COMPLETENESS",
            S8_BUILD_PLAN: "G6_PLAN_COVERAGE",
            S10_PACKAGE: "G8_PACKAGE_INTEGRITY",
          },
          source: "fallback",
        });
      }

      res.json({
        stageOrder,
        stageGates,
        gatesRequired,
        stageNames,
        pipeline_id: "PIPE-AXION",
        pipeline_version: "1.0.0",
        source: "orchestration_library",
      });
    } catch (err: any) {
      console.error("Failed to fetch config:", err);
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  app.get("/api/status", async (_req: Request, res: Response) => {
    try {
      const allAssemblies = await storage.getAssemblies();
      const running = allAssemblies.filter((a) => a.status === "running").length;
      const completed = allAssemblies.filter((a) => a.status === "completed").length;
      const failed = allAssemblies.filter((a) => a.status === "failed").length;
      const queued = allAssemblies.filter((a) => a.status === "queued").length;
      res.json({ total: allAssemblies.length, running, completed, failed, queued });
    } catch (err: any) {
      console.error("Failed to fetch status:", err);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  const FEATURES_DIR = path.join(AXION_ROOT, "features");

  app.get("/api/features", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(FEATURES_DIR)) return res.json([]);
      const dirs = fs.readdirSync(FEATURES_DIR).filter((d) => d.startsWith("FEAT-")).sort();
      const features = dirs.map((dir) => {
        const registryPath = path.join(FEATURES_DIR, dir, "00_registry.json");
        try {
          return JSON.parse(fs.readFileSync(registryPath, "utf-8"));
        } catch {
          return null;
        }
      }).filter(Boolean);
      res.json(features);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/features/:id", (req: Request, res: Response) => {
    try {
      const featureId = req.params.id.toUpperCase();
      const dirs = fs.readdirSync(FEATURES_DIR).filter((d) => d.toUpperCase().startsWith(featureId));
      if (dirs.length === 0) return res.status(404).json({ error: "Feature not found" });
      const featureDir = path.join(FEATURES_DIR, dirs[0]);
      const registryPath = path.join(featureDir, "00_registry.json");
      if (!fs.existsSync(registryPath)) return res.status(404).json({ error: "Registry not found" });

      const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

      const specFiles: Record<string, string> = {};
      const specMap: Record<string, string> = {
        "01_contract.md": "contract",
        "02_errors.md": "errors",
        "03_security.md": "security",
        "04_gates_and_proofs.md": "gates_and_proofs",
        "05_tests.md": "tests",
        "06_observability.md": "observability",
        "07_docs.md": "docs",
        "08_api.md": "api",
      };

      for (const [file, key] of Object.entries(specMap)) {
        const filePath = path.join(featureDir, file);
        try {
          specFiles[key] = fs.readFileSync(filePath, "utf-8");
        } catch {
          specFiles[key] = "";
        }
      }

      const allDirs = fs.readdirSync(FEATURES_DIR).filter((d) => d.startsWith("FEAT-"));
      const reverseDeps: string[] = [];
      for (const d of allDirs) {
        try {
          const r = JSON.parse(fs.readFileSync(path.join(FEATURES_DIR, d, "00_registry.json"), "utf-8"));
          if (r.dependencies?.includes(registry.feature_id) && r.feature_id !== registry.feature_id) {
            reverseDeps.push(r.feature_id);
          }
        } catch (err) { console.error(err); }
      }

      res.json({ ...registry, specs: specFiles, reverse_dependencies: reverseDeps });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/uploads", (req: Request, res: Response) => {
    try {
      upload.array("files", 10)(req, res, (err: any) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large (max 50MB)" });
            if (err.code === "LIMIT_FILE_COUNT") return res.status(400).json({ error: "Too many files (max 10)" });
            return res.status(400).json({ error: err.message });
          }
          return res.status(400).json({ error: err.message || "Upload failed" });
        }
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) return res.status(400).json({ error: "No files provided" });

        const result = files.map((f) => ({
          id: path.basename(f.filename, path.extname(f.filename)),
          filename: f.filename,
          originalName: f.originalname,
          size: f.size,
          mimeType: f.mimetype,
        }));
        res.json(result);
      });
    } catch (err: any) {
      console.error("Failed to handle upload:", err);
      res.status(500).json({ error: "Failed to handle upload" });
    }
  });

  app.get("/api/uploads/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!/^[a-f0-9]{16}$/.test(id)) return res.status(400).json({ error: "Invalid file ID" });
      const files = await fsp.readdir(UPLOADS_DIR);
      const match = files.find((f) => path.basename(f, path.extname(f)) === id);
      if (!match) return res.status(404).json({ error: "File not found" });

      const fullPath = path.join(UPLOADS_DIR, match);
      res.download(fullPath, match);
    } catch (err: any) {
      console.error("Failed to fetch upload:", err);
      res.status(500).json({ error: "Failed to fetch upload" });
    }
  });

  app.delete("/api/uploads/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!/^[a-f0-9]{16}$/.test(id)) return res.status(400).json({ error: "Invalid file ID" });
      const files = await fsp.readdir(UPLOADS_DIR);
      const match = files.find((f) => path.basename(f, path.extname(f)) === id);
      if (!match) return res.status(404).json({ error: "File not found" });

      const fullPath = path.join(UPLOADS_DIR, match);
      await fsp.unlink(fullPath);
      res.json({ ok: true });
    } catch (err: any) {
      console.error("Failed to delete upload:", err);
      res.status(500).json({ error: "Failed to delete upload" });
    }
  });

  const SYSTEM_LIB_DIR = path.join(AXION_ROOT, "libraries", "system");

  app.get("/api/system", (_req: Request, res: Response) => {
    try {
      const docs: string[] = [];
      const schemaFiles: string[] = [];
      const registryFiles: string[] = [];

      if (fs.existsSync(SYSTEM_LIB_DIR)) {
        for (const f of fs.readdirSync(SYSTEM_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt")) docs.push(f);
        }
      }
      const schemasDir = path.join(SYSTEM_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemaFiles.push(f);
        }
      }
      const registriesDir = path.join(SYSTEM_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registryFiles.push(f);
        }
      }

      const groups: Record<string, string[]> = {};
      for (const d of docs.sort()) {
        const prefix = d.match(/^(SYS-\d)/)?.[1] ?? "other";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(d);
      }

      res.json({
        groups,
        schemas: schemaFiles.sort(),
        registries: registryFiles.sort(),
        counts: { docs: docs.length, schemas: schemaFiles.length, registries: registryFiles.length },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/system/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(SYSTEM_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const schemas = fs.readdirSync(schemasDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
        }));
      res.json(schemas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/system/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(SYSTEM_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const registries = fs.readdirSync(registriesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
        }));
      res.json(registries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/system/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const registriesDir = path.join(SYSTEM_LIB_DIR, "registries");
      const candidates = [name, `${name}.json`, `${name}.v1.json`];
      let filePath: string | null = null;
      for (const c of candidates) {
        const p = path.join(registriesDir, c);
        if (fs.existsSync(p) && p.startsWith(registriesDir)) {
          filePath = p;
          break;
        }
      }
      if (!filePath) return res.status(404).json({ error: `Registry '${name}' not found` });
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json({ filename: path.basename(filePath), content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/system/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(SYSTEM_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(SYSTEM_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const docs = files.map((filename) => {
        const raw = fs.readFileSync(path.join(SYSTEM_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/system/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(SYSTEM_LIB_DIR, filename);
      if (!filePath.startsWith(SYSTEM_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const ORC_LIB_DIR = path.join(AXION_ROOT, "libraries", "orchestration");

  app.get("/api/orchestration", (_req: Request, res: Response) => {
    try {
      const docs: string[] = [];
      const schemaFiles: string[] = [];
      const registryFiles: string[] = [];

      if (fs.existsSync(ORC_LIB_DIR)) {
        for (const f of fs.readdirSync(ORC_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("ORC-"))) docs.push(f);
        }
      }
      const schemasDir = path.join(ORC_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemaFiles.push(f);
        }
      }
      const registriesDir = path.join(ORC_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registryFiles.push(f);
        }
      }

      const groups: Record<string, string[]> = {};
      for (const d of docs.sort()) {
        const prefix = d.match(/^(ORC-\d)/)?.[1] ?? "other";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(d);
      }

      let stageCount = 0;
      try {
        const pdPath = path.join(registriesDir, "pipeline_definition.axion.v1.json");
        if (fs.existsSync(pdPath)) {
          const pd = JSON.parse(fs.readFileSync(pdPath, "utf-8"));
          stageCount = pd.stage_order?.length ?? 0;
        }
      } catch (err) { console.error(err); }

      res.json({
        groups,
        schemas: schemaFiles.sort(),
        registries: registryFiles.sort(),
        counts: { docs: docs.length, schemas: schemaFiles.length, registries: registryFiles.length, stages: stageCount },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orchestration/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(ORC_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const schemas = fs.readdirSync(schemasDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
        }));
      res.json(schemas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orchestration/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(ORC_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const registries = fs.readdirSync(registriesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
        }));
      res.json(registries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orchestration/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const registriesDir = path.join(ORC_LIB_DIR, "registries");
      const candidates = [name, `${name}.json`, `${name}.v1.json`];
      let filePath: string | null = null;
      for (const c of candidates) {
        const p = path.join(registriesDir, c);
        if (fs.existsSync(p) && p.startsWith(registriesDir)) {
          filePath = p;
          break;
        }
      }
      if (!filePath) return res.status(404).json({ error: `Registry '${name}' not found` });
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json({ filename: path.basename(filePath), content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orchestration/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(ORC_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(ORC_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("ORC-")))
        .sort();
      const docs = files.map((filename) => {
        const raw = fs.readFileSync(path.join(ORC_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orchestration/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt") && !(filename.endsWith(".json") && filename.startsWith("ORC-"))) {
        return res.status(400).json({ error: "Only .md, .txt, and ORC-*.json files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(ORC_LIB_DIR, filename);
      if (!filePath.startsWith(ORC_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const GATES_LIB_DIR = path.join(AXION_ROOT, "libraries", "gates");

  app.get("/api/gates", (_req: Request, res: Response) => {
    try {
      const docs: string[] = [];
      const schemaFiles: string[] = [];
      const registryFiles: string[] = [];

      if (fs.existsSync(GATES_LIB_DIR)) {
        for (const f of fs.readdirSync(GATES_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt")) docs.push(f);
        }
      }
      const schemasDir = path.join(GATES_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemaFiles.push(f);
        }
      }
      const registriesDir = path.join(GATES_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registryFiles.push(f);
        }
      }

      const groups: Record<string, string[]> = {};
      for (const d of docs.sort()) {
        const prefix = d.match(/^(GATE-\d)/)?.[1] ?? "other";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(d);
      }

      let gateDefinitions = 0;
      try {
        const regPath = path.join(registriesDir, "gate_registry.axion.v1.json");
        if (fs.existsSync(regPath)) {
          const gr = JSON.parse(fs.readFileSync(regPath, "utf-8"));
          gateDefinitions = gr.gates?.length ?? 0;
        }
      } catch (err) { console.error(err); }

      res.json({
        groups,
        schemas: schemaFiles.sort(),
        registries: registryFiles.sort(),
        counts: { docs: docs.length, schemas: schemaFiles.length, registries: registryFiles.length, definitions: gateDefinitions },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gates/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(GATES_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const schemas = fs.readdirSync(schemasDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
        }));
      res.json(schemas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gates/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(GATES_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const registries = fs.readdirSync(registriesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
        }));
      res.json(registries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gates/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const registriesDir = path.join(GATES_LIB_DIR, "registries");
      const candidates = [name, `${name}.json`, `${name}.v1.json`];
      let filePath: string | null = null;
      for (const c of candidates) {
        const p = path.join(registriesDir, c);
        if (fs.existsSync(p) && p.startsWith(registriesDir)) {
          filePath = p;
          break;
        }
      }
      if (!filePath) return res.status(404).json({ error: `Registry '${name}' not found` });
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json({ filename: path.basename(filePath), content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gates/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(GATES_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(GATES_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const docs = files.map((filename) => {
        const raw = fs.readFileSync(path.join(GATES_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gates/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(GATES_LIB_DIR, filename);
      if (!filePath.startsWith(GATES_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const POLICY_LIB_DIR = path.join(AXION_ROOT, "libraries", "policy");

  app.get("/api/policy", (_req: Request, res: Response) => {
    try {
      const docs: string[] = [];
      const schemaFiles: string[] = [];
      const registryFiles: string[] = [];

      if (fs.existsSync(POLICY_LIB_DIR)) {
        for (const f of fs.readdirSync(POLICY_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt")) docs.push(f);
        }
      }
      const schemasDir = path.join(POLICY_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemaFiles.push(f);
        }
      }
      const registriesDir = path.join(POLICY_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registryFiles.push(f);
        }
      }

      const groups: Record<string, string[]> = {};
      for (const d of docs.sort()) {
        const prefix = d.match(/^(POL-\d)/)?.[1] ?? "other";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(d);
      }

      let riskClassCount = 0;
      let policySetCount = 0;
      try {
        const rcPath = path.join(registriesDir, "risk_classes.v1.json");
        if (fs.existsSync(rcPath)) {
          const rc = JSON.parse(fs.readFileSync(rcPath, "utf-8"));
          riskClassCount = rc.classes?.length ?? 0;
        }
        const psPath = path.join(registriesDir, "policy_sets.v1.json");
        if (fs.existsSync(psPath)) {
          const ps = JSON.parse(fs.readFileSync(psPath, "utf-8"));
          policySetCount = ps.policy_sets?.length ?? 0;
        }
      } catch (err) { console.error(err); }

      res.json({
        groups,
        schemas: schemaFiles.sort(),
        registries: registryFiles.sort(),
        counts: { docs: docs.length, schemas: schemaFiles.length, registries: registryFiles.length, riskClasses: riskClassCount, policySets: policySetCount },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/policy/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(POLICY_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const schemas = fs.readdirSync(schemasDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
        }));
      res.json(schemas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/policy/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(POLICY_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const registries = fs.readdirSync(registriesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
        }));
      res.json(registries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/policy/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const registriesDir = path.join(POLICY_LIB_DIR, "registries");
      const candidates = [name, `${name}.json`, `${name}.v1.json`];
      let filePath: string | null = null;
      for (const c of candidates) {
        const p = path.join(registriesDir, c);
        if (fs.existsSync(p) && p.startsWith(registriesDir)) {
          filePath = p;
          break;
        }
      }
      if (!filePath) return res.status(404).json({ error: `Registry '${name}' not found` });
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json({ filename: path.basename(filePath), content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/policy/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(POLICY_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(POLICY_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const docs = files.map((filename) => {
        const raw = fs.readFileSync(path.join(POLICY_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/policy/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(POLICY_LIB_DIR, filename);
      if (!filePath.startsWith(POLICY_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const INTAKE_LIB_DIR = path.join(AXION_ROOT, "libraries", "intake");

  app.get("/api/intake-library", (_req: Request, res: Response) => {
    try {
      const docs: string[] = [];
      const schemaFiles: string[] = [];
      const registryFiles: string[] = [];

      if (fs.existsSync(INTAKE_LIB_DIR)) {
        for (const f of fs.readdirSync(INTAKE_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt")) docs.push(f);
        }
      }
      const schemasDir = path.join(INTAKE_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemaFiles.push(f);
        }
      }
      const registriesDir = path.join(INTAKE_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registryFiles.push(f);
        }
      }

      const groups: Record<string, string[]> = {};
      for (const d of docs.sort()) {
        const prefix = d.match(/^(INT-\d)/)?.[1] ?? "other";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(d);
      }

      let enumCount = 0;
      let crossFieldRuleCount = 0;
      let normRuleCount = 0;
      try {
        const enumPath = path.join(registriesDir, "intake_enums.v1.json");
        if (fs.existsSync(enumPath)) {
          const en = JSON.parse(fs.readFileSync(enumPath, "utf-8"));
          enumCount = en.enums?.length ?? 0;
        }
        const cfPath = path.join(registriesDir, "intake_cross_field_rules.v1.json");
        if (fs.existsSync(cfPath)) {
          const cf = JSON.parse(fs.readFileSync(cfPath, "utf-8"));
          crossFieldRuleCount = cf.rules?.length ?? 0;
        }
        const nrPath = path.join(registriesDir, "normalization_rules.v1.json");
        if (fs.existsSync(nrPath)) {
          const nr = JSON.parse(fs.readFileSync(nrPath, "utf-8"));
          normRuleCount = nr.rules?.length ?? 0;
        }
      } catch (err) { console.error(err); }

      res.json({
        groups,
        schemas: schemaFiles.sort(),
        registries: registryFiles.sort(),
        counts: { docs: docs.length, schemas: schemaFiles.length, registries: registryFiles.length, enums: enumCount, crossFieldRules: crossFieldRuleCount, normalizationRules: normRuleCount },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/intake-library/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(INTAKE_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const schemas = fs.readdirSync(schemasDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
        }));
      res.json(schemas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/intake-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(INTAKE_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const registries = fs.readdirSync(registriesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
        }));
      res.json(registries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/intake-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const registriesDir = path.join(INTAKE_LIB_DIR, "registries");
      const candidates = [name, `${name}.json`, `${name}.v1.json`];
      let filePath: string | null = null;
      for (const c of candidates) {
        const p = path.join(registriesDir, c);
        if (fs.existsSync(p) && p.startsWith(registriesDir)) {
          filePath = p;
          break;
        }
      }
      if (!filePath) return res.status(404).json({ error: `Registry '${name}' not found` });
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json({ filename: path.basename(filePath), content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/intake-library/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(INTAKE_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(INTAKE_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const docs = files.map((filename) => {
        const raw = fs.readFileSync(path.join(INTAKE_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/intake-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(INTAKE_LIB_DIR, filename);
      if (!filePath.startsWith(INTAKE_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Canonical Library endpoints ──────────────────────────────────────
  const CANONICAL_LIB_DIR = path.join(AXION_ROOT, "libraries", "canonical");

  app.get("/api/canonical", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      let entityTypes = 0;
      let relationshipTypes = 0;

      if (fs.existsSync(CANONICAL_LIB_DIR)) {
        for (const f of fs.readdirSync(CANONICAL_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("CAN-"))) {
            const prefix = f.match(/^(CAN-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(CANONICAL_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(CANONICAL_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }

      const rcPath = path.join(registriesDir, "relationship_constraints.v1.json");
      if (fs.existsSync(rcPath)) {
        try {
          const rc = JSON.parse(fs.readFileSync(rcPath, "utf-8"));
          relationshipTypes = rc.constraints?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const idPath = path.join(registriesDir, "id_rules.v1.json");
      if (fs.existsSync(idPath)) {
        try {
          const id = JSON.parse(fs.readFileSync(idPath, "utf-8"));
          entityTypes = Object.keys(id.canonical_key_templates ?? {}).length;
        } catch (err) { console.error(err); }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          entityTypes,
          relationshipTypes,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/canonical/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(CANONICAL_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/canonical/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(CANONICAL_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/canonical/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(CANONICAL_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/canonical/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(CANONICAL_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(CANONICAL_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(CANONICAL_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/canonical/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(CANONICAL_LIB_DIR, filename);
      if (!filePath.startsWith(CANONICAL_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const STANDARDS_LIB_DIR = path.join(AXION_ROOT, "libraries", "standards");

  app.get("/api/standards", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      const packs: string[] = [];
      let totalRules = 0;
      let gateCount = 0;

      if (fs.existsSync(STANDARDS_LIB_DIR)) {
        for (const f of fs.readdirSync(STANDARDS_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("STD-"))) {
            const prefix = f.match(/^(STD-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(STANDARDS_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(STANDARDS_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }
      const packsDir = path.join(STANDARDS_LIB_DIR, "packs");
      if (fs.existsSync(packsDir)) {
        for (const f of fs.readdirSync(packsDir)) {
          if (f.endsWith(".json")) {
            packs.push(f);
            try {
              const pk = JSON.parse(fs.readFileSync(path.join(packsDir, f), "utf-8"));
              totalRules += pk.rules?.length ?? 0;
            } catch (err) { console.error(err); }
          }
        }
      }

      const gateSpecPath = path.join(STANDARDS_LIB_DIR, "STD-5_standards_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        packs,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          packs: packs.length,
          rules: totalRules,
          gates: gateCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/standards/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(STANDARDS_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/standards/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(STANDARDS_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/standards/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(STANDARDS_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/standards/packs", (_req: Request, res: Response) => {
    try {
      const packsDir = path.join(STANDARDS_LIB_DIR, "packs");
      if (!fs.existsSync(packsDir)) return res.json([]);
      const files = fs.readdirSync(packsDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(packsDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/standards/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(STANDARDS_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(STANDARDS_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(STANDARDS_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/standards/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(STANDARDS_LIB_DIR, filename);
      if (!filePath.startsWith(STANDARDS_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const TEMPLATES_LIB_DIR = path.join(AXION_ROOT, "libraries", "templates");

  function countMdFilesRecursive(dir: string): number {
    let count = 0;
    if (!fs.existsSync(dir)) return 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) count += countMdFilesRecursive(path.join(dir, entry.name));
      else if (entry.name.endsWith(".md")) count++;
    }
    return count;
  }

  function listMdFilesRecursive(dir: string, prefix = ""): string[] {
    const result: string[] = [];
    if (!fs.existsSync(dir)) return result;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) result.push(...listMdFilesRecursive(path.join(dir, entry.name), rel));
      else if (entry.name.endsWith(".md")) result.push(rel);
    }
    return result.sort();
  }

  app.get("/api/templates-library", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      let gateCount = 0;
      let categoryCount = 0;

      if (fs.existsSync(TEMPLATES_LIB_DIR)) {
        for (const f of fs.readdirSync(TEMPLATES_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("TMP-"))) {
            const prefix = f.match(/^(TMP-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(TEMPLATES_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(TEMPLATES_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }

      const gateSpecPath = path.join(TEMPLATES_LIB_DIR, "TMP-6_template_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const catOrderPath = path.join(registriesDir, "template_category_order.v1.json");
      if (fs.existsSync(catOrderPath)) {
        try {
          const co = JSON.parse(fs.readFileSync(catOrderPath, "utf-8"));
          categoryCount = co.order?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const categories: Array<{ name: string; fileCount: number }> = [];
      const catDirs = ["Product Definition", "System Architecture", "Application Build", "Data & Information", "Experience Design", "Integrations & External Services", "Security, Privacy & Compliance", "Operations & Reliability"];
      for (const dir of catDirs) {
        const catDir = path.join(TEMPLATES_LIB_DIR, dir);
        if (fs.existsSync(catDir)) {
          const count = countMdFilesRecursive(catDir);
          categories.push({ name: dir, fileCount: count });
        }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        categories,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          categoryCount,
          gates: gateCount,
          templateFiles: categories.reduce((sum, c) => sum + c.fileCount, 0),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/templates-library/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(TEMPLATES_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/templates-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(TEMPLATES_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/templates-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(TEMPLATES_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/templates-library/categories", (_req: Request, res: Response) => {
    try {
      const catDirs = ["Product Definition", "System Architecture", "Application Build", "Data & Information", "Experience Design", "Integrations & External Services", "Security, Privacy & Compliance", "Operations & Reliability"];
      const categories: Array<{ name: string; fileCount: number; files: string[] }> = [];
      for (const dir of catDirs) {
        const catDir = path.join(TEMPLATES_LIB_DIR, dir);
        if (fs.existsSync(catDir)) {
          const files = listMdFilesRecursive(catDir);
          categories.push({ name: dir, fileCount: files.length, files });
        }
      }
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/templates-library/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(TEMPLATES_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(TEMPLATES_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(TEMPLATES_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/templates-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(TEMPLATES_LIB_DIR, filename);
      if (!filePath.startsWith(TEMPLATES_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const PLANNING_LIB_DIR = path.join(AXION_ROOT, "libraries", "planning");

  app.get("/api/planning-library", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      let gateCount = 0;
      let coverageRuleCount = 0;

      if (fs.existsSync(PLANNING_LIB_DIR)) {
        for (const f of fs.readdirSync(PLANNING_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("PLAN-"))) {
            const prefix = f.match(/^(PLAN-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(PLANNING_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(PLANNING_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }

      const gateSpecPath = path.join(PLANNING_LIB_DIR, "PLAN-5_planning_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const covPath = path.join(registriesDir, "plan_coverage_rules.v1.json");
      if (fs.existsSync(covPath)) {
        try {
          const cr = JSON.parse(fs.readFileSync(covPath, "utf-8"));
          coverageRuleCount = cr.rules?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          gates: gateCount,
          coverageRules: coverageRuleCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/planning-library/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(PLANNING_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/planning-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(PLANNING_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/planning-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(PLANNING_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/planning-library/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(PLANNING_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(PLANNING_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(PLANNING_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/planning-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(PLANNING_LIB_DIR, filename);
      if (!filePath.startsWith(PLANNING_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const VERIFICATION_LIB_DIR = path.join(AXION_ROOT, "libraries", "verification");

  app.get("/api/verification-library", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      let gateCount = 0;
      let proofTypeCount = 0;

      if (fs.existsSync(VERIFICATION_LIB_DIR)) {
        for (const f of fs.readdirSync(VERIFICATION_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("VER-"))) {
            const prefix = f.match(/^(VER-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(VERIFICATION_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(VERIFICATION_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }

      const gateSpecPath = path.join(VERIFICATION_LIB_DIR, "VER-6_verification_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? gs.sub_gates?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const ptPath = path.join(registriesDir, "proof_types.v1.json");
      if (fs.existsSync(ptPath)) {
        try {
          const pt = JSON.parse(fs.readFileSync(ptPath, "utf-8"));
          proofTypeCount = pt.types?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          gates: gateCount,
          proofTypes: proofTypeCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/verification-library/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(VERIFICATION_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/verification-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(VERIFICATION_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/verification-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(VERIFICATION_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/verification-library/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(VERIFICATION_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(VERIFICATION_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(VERIFICATION_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/verification-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(VERIFICATION_LIB_DIR, filename);
      if (!filePath.startsWith(VERIFICATION_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const KIT_LIB_DIR = path.join(AXION_ROOT, "libraries", "kit");

  app.get("/api/kit-library", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      let gateCount = 0;
      let exportRuleCount = 0;

      if (fs.existsSync(KIT_LIB_DIR)) {
        for (const f of fs.readdirSync(KIT_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("KIT-"))) {
            const prefix = f.match(/^(KIT-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(KIT_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(KIT_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }

      const gateSpecPath = path.join(KIT_LIB_DIR, "KIT-5_kit_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const efPath = path.join(registriesDir, "kit_export_filter.v1.json");
      if (fs.existsSync(efPath)) {
        try {
          const ef = JSON.parse(fs.readFileSync(efPath, "utf-8"));
          exportRuleCount = ef.rules?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          gates: gateCount,
          exportRules: exportRuleCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/kit-library/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(KIT_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/kit-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(KIT_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/kit-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(KIT_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/kit-library/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(KIT_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(KIT_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(KIT_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/kit-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(KIT_LIB_DIR, filename);
      if (!filePath.startsWith(KIT_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const TELEMETRY_LIB_DIR = path.join(AXION_ROOT, "libraries", "telemetry");

  app.get("/api/telemetry-library", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      let gateCount = 0;
      let eventTypeCount = 0;
      let sinkCount = 0;

      if (fs.existsSync(TELEMETRY_LIB_DIR)) {
        for (const f of fs.readdirSync(TELEMETRY_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("TEL-"))) {
            const prefix = f.match(/^(TEL-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(TELEMETRY_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(TELEMETRY_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }

      const gateSpecPath = path.join(TELEMETRY_LIB_DIR, "TEL-5_telemetry_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const etPath = path.join(registriesDir, "telemetry_event_types.v1.json");
      if (fs.existsSync(etPath)) {
        try {
          const et = JSON.parse(fs.readFileSync(etPath, "utf-8"));
          eventTypeCount = et.types?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const spPath = path.join(registriesDir, "telemetry_sink_policy.v1.json");
      if (fs.existsSync(spPath)) {
        try {
          const sp = JSON.parse(fs.readFileSync(spPath, "utf-8"));
          sinkCount = sp.sinks?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          gates: gateCount,
          eventTypes: eventTypeCount,
          sinks: sinkCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/telemetry-library/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(TELEMETRY_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/telemetry-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(TELEMETRY_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/telemetry-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(TELEMETRY_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/telemetry-library/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(TELEMETRY_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(TELEMETRY_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(TELEMETRY_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/telemetry-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(TELEMETRY_LIB_DIR, filename);
      if (!filePath.startsWith(TELEMETRY_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const AUDIT_LIB_DIR = path.join(AXION_ROOT, "libraries", "audit");

  app.get("/api/audit-library", (_req: Request, res: Response) => {
    try {
      const groups: Record<string, string[]> = {};
      const schemas: string[] = [];
      const registries: string[] = [];
      let gateCount = 0;
      let actionTypeCount = 0;

      if (fs.existsSync(AUDIT_LIB_DIR)) {
        for (const f of fs.readdirSync(AUDIT_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("AUD-"))) {
            const prefix = f.match(/^(AUD-\d+)/)?.[1] ?? "other";
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(f);
          }
        }
      }
      const schemasDir = path.join(AUDIT_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemas.push(f);
        }
      }
      const registriesDir = path.join(AUDIT_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registries.push(f);
        }
      }

      const gateSpecPath = path.join(AUDIT_LIB_DIR, "AUD-5_audit_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const actionSchemaPath = path.join(schemasDir, "audit_action.v1.schema.json");
      if (fs.existsSync(actionSchemaPath)) {
        try {
          const as2 = JSON.parse(fs.readFileSync(actionSchemaPath, "utf-8"));
          actionTypeCount = as2.properties?.action_type?.enum?.length ?? 0;
        } catch (err) { console.error(err); }
      }

      const docCount = Object.values(groups).flat().length;

      res.json({
        groups,
        schemas,
        registries,
        counts: {
          docs: docCount,
          schemas: schemas.length,
          registries: registries.length,
          gates: gateCount,
          actionTypes: actionTypeCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/audit-library/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(AUDIT_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/audit-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const filePath = path.join(AUDIT_LIB_DIR, "registries", name.endsWith(".json") ? name : `${name}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Registry '${name}' not found` });
      res.json({ filename: path.basename(filePath), content: JSON.parse(fs.readFileSync(filePath, "utf-8")) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/audit-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(AUDIT_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const files = fs.readdirSync(registriesDir).filter((f) => f.endsWith(".json")).sort();
      const result = files.map((filename) => ({
        filename,
        content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/audit-library/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(AUDIT_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(AUDIT_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const result = files.map((filename) => {
        const raw = fs.readFileSync(path.join(AUDIT_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/audit-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(AUDIT_LIB_DIR, filename);
      if (!filePath.startsWith(AUDIT_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const OPS_LIB_DIR = path.join(AXION_ROOT, "libraries", "ops");

  app.get("/api/ops", (_req: Request, res: Response) => {
    try {
      const docs: string[] = [];
      const schemaFiles: string[] = [];
      const registryFiles: string[] = [];

      if (fs.existsSync(OPS_LIB_DIR)) {
        for (const f of fs.readdirSync(OPS_LIB_DIR)) {
          if (f.endsWith(".md") || f.endsWith(".txt")) docs.push(f);
        }
      }
      const schemasDir = path.join(OPS_LIB_DIR, "schemas");
      if (fs.existsSync(schemasDir)) {
        for (const f of fs.readdirSync(schemasDir)) {
          if (f.endsWith(".json")) schemaFiles.push(f);
        }
      }
      const registriesDir = path.join(OPS_LIB_DIR, "registries");
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registryFiles.push(f);
        }
      }

      const groups: Record<string, string[]> = {};
      for (const d of docs.sort()) {
        const prefix = d.match(/^(OPS-\d)/)?.[1] ?? "other";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(d);
      }

      let unitCount = 0;
      try {
        const regPath = path.join(registriesDir, "ops_registry.v1.json");
        if (fs.existsSync(regPath)) {
          const reg = JSON.parse(fs.readFileSync(regPath, "utf-8"));
          unitCount = reg.units?.length ?? 0;
        }
      } catch (err) { console.error(err); }

      res.json({
        groups,
        schemas: schemaFiles.sort(),
        registries: registryFiles.sort(),
        counts: { docs: docs.length, schemas: schemaFiles.length, registries: registryFiles.length, units: unitCount },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ops/schemas", (_req: Request, res: Response) => {
    try {
      const schemasDir = path.join(OPS_LIB_DIR, "schemas");
      if (!fs.existsSync(schemasDir)) return res.json([]);
      const schemas = fs.readdirSync(schemasDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(schemasDir, filename), "utf-8")),
        }));
      res.json(schemas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ops/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(OPS_LIB_DIR, "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const registries = fs.readdirSync(registriesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
        }));
      res.json(registries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ops/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const registriesDir = path.join(OPS_LIB_DIR, "registries");
      const candidates = [name, `${name}.json`, `${name}.v1.json`];
      let filePath: string | null = null;
      for (const c of candidates) {
        const p = path.join(registriesDir, c);
        if (fs.existsSync(p) && p.startsWith(registriesDir)) {
          filePath = p;
          break;
        }
      }
      if (!filePath) return res.status(404).json({ error: `Registry '${name}' not found` });
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json({ filename: path.basename(filePath), content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ops/docs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(OPS_LIB_DIR)) return res.json([]);
      const files = fs.readdirSync(OPS_LIB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const docs = files.map((filename) => {
        const raw = fs.readFileSync(path.join(OPS_LIB_DIR, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ops/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const filePath = path.join(OPS_LIB_DIR, filename);
      if (!filePath.startsWith(OPS_LIB_DIR) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const KNO_LIB_DIR = path.join(AXION_ROOT, "libraries", "knowledge");

  app.get("/api/knowledge-library", (_req: Request, res: Response) => {
    try {
      const doctrineDir = path.join(KNO_LIB_DIR, "SYSTEM", "doctrine");
      const contractsDir = path.join(KNO_LIB_DIR, "SYSTEM", "contracts");
      const registriesDir = path.join(KNO_LIB_DIR, "SYSTEM", "registries");

      const docs: string[] = [];
      const schemaFiles: string[] = [];
      const registryFiles: string[] = [];

      if (fs.existsSync(doctrineDir)) {
        for (const f of fs.readdirSync(doctrineDir)) {
          if (f.endsWith(".md") || f.endsWith(".txt")) docs.push(f);
        }
      }
      if (fs.existsSync(contractsDir)) {
        for (const f of fs.readdirSync(contractsDir)) {
          if (f.endsWith(".json")) schemaFiles.push(f);
        }
      }
      if (fs.existsSync(registriesDir)) {
        for (const f of fs.readdirSync(registriesDir)) {
          if (f.endsWith(".json")) registryFiles.push(f);
        }
      }

      const groups: Record<string, string[]> = {};
      for (const d of docs.sort()) {
        const prefix = d.match(/^(KNO-\d)/)?.[1] ?? "other";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(d);
      }

      let unitCount = 0;
      try {
        const knowledgeIndexPath = path.join(registriesDir, "knowledge.index.json");
        if (fs.existsSync(knowledgeIndexPath)) {
          const idx = JSON.parse(fs.readFileSync(knowledgeIndexPath, "utf-8"));
          unitCount = Array.isArray(idx) ? idx.length : 0;
        }
      } catch (err) { console.error(err); }

      res.json({
        groups,
        schemas: schemaFiles.sort(),
        registries: registryFiles.sort(),
        counts: { docs: docs.length, schemas: schemaFiles.length, registries: registryFiles.length, units: unitCount },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/knowledge-library/schemas", (_req: Request, res: Response) => {
    try {
      const contractsDir = path.join(KNO_LIB_DIR, "SYSTEM", "contracts");
      if (!fs.existsSync(contractsDir)) return res.json([]);
      const schemas = fs.readdirSync(contractsDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(contractsDir, filename), "utf-8")),
        }));
      res.json(schemas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/knowledge-library/registries", (_req: Request, res: Response) => {
    try {
      const registriesDir = path.join(KNO_LIB_DIR, "SYSTEM", "registries");
      if (!fs.existsSync(registriesDir)) return res.json([]);
      const registries = fs.readdirSync(registriesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((filename) => ({
          filename,
          content: JSON.parse(fs.readFileSync(path.join(registriesDir, filename), "utf-8")),
        }));
      res.json(registries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/knowledge-library/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const registriesDir = path.join(KNO_LIB_DIR, "SYSTEM", "registries");
      const candidates = [name, `${name}.json`, `${name}.v1.json`];
      let filePath: string | null = null;
      for (const c of candidates) {
        const p = path.join(registriesDir, c);
        if (fs.existsSync(p) && p.startsWith(registriesDir)) {
          filePath = p;
          break;
        }
      }
      if (!filePath) return res.status(404).json({ error: `Registry '${name}' not found` });
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json({ filename: path.basename(filePath), content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/knowledge-library/docs", (_req: Request, res: Response) => {
    try {
      const doctrineDir = path.join(KNO_LIB_DIR, "SYSTEM", "doctrine");
      if (!fs.existsSync(doctrineDir)) return res.json([]);
      const files = fs.readdirSync(doctrineDir)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .sort();
      const docs = files.map((filename) => {
        const raw = fs.readFileSync(path.join(doctrineDir, filename), "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        let frontmatter: Record<string, string> = {};
        let content = raw;
        if (fmMatch) {
          const lines = fmMatch[1].split("\n");
          for (const line of lines) {
            const idx = line.indexOf(":");
            if (idx > 0) {
              frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            }
          }
          content = fmMatch[2];
        }
        return { filename, frontmatter, content };
      });
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/knowledge-library/docs/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
        return res.status(400).json({ error: "Only .md and .txt files are accessible" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      const doctrineDir = path.join(KNO_LIB_DIR, "SYSTEM", "doctrine");
      const filePath = path.join(doctrineDir, filename);
      if (!filePath.startsWith(doctrineDir) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Document '${filename}' not found` });
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      let frontmatter: Record<string, string> = {};
      let content = raw;
      if (fmMatch) {
        const lines = fmMatch[1].split("\n");
        for (const line of lines) {
          const idx = line.indexOf(":");
          if (idx > 0) {
            frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          }
        }
        content = fmMatch[2];
      }
      res.json({ filename, frontmatter, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/knowledge-library/search", (req: Request, res: Response) => {
    try {
      const registriesDir = path.join(KNO_LIB_DIR, "SYSTEM", "registries");
      const indexPath = path.join(registriesDir, "knowledge.index.json");
      const aliasPath = path.join(registriesDir, "aliases.index.json");

      if (!fs.existsSync(indexPath)) return res.json({ results: [], total: 0 });

      const knowledgeIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as any[];
      const aliasIndex = fs.existsSync(aliasPath)
        ? (JSON.parse(fs.readFileSync(aliasPath, "utf-8")) as Record<string, string>)
        : {};

      const text = (req.query.text as string) || "";
      const contentType = req.query.content_type as string | undefined;
      const primaryDomain = req.query.primary_domain as string | undefined;
      const status = req.query.status as string | undefined;
      const authorityTier = req.query.authority_tier as string | undefined;
      const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);

      const results: any[] = [];

      for (const entry of knowledgeIndex) {
        if (contentType && entry.content_type !== contentType) continue;
        if (primaryDomain && entry.primary_domain !== primaryDomain) continue;
        if (status && entry.status !== status) continue;
        if (authorityTier && entry.authority_tier !== authorityTier) continue;

        let score = 1;
        const matchedFields: string[] = [];

        if (text) {
          const q = text.toLowerCase();
          let textScore = 0;
          if (entry.kid?.toLowerCase().includes(q)) { textScore += 10; matchedFields.push("kid"); }
          if (entry.title?.toLowerCase().includes(q)) { textScore += 8; matchedFields.push("title"); }
          if (entry.primary_domain?.toLowerCase().includes(q)) { textScore += 6; matchedFields.push("primary_domain"); }
          if (entry.tags?.some((t: string) => t.toLowerCase().includes(q))) { textScore += 5; matchedFields.push("tags"); }

          const aliasesForKid = Object.entries(aliasIndex)
            .filter(([, kid]) => kid === entry.kid)
            .map(([alias]) => alias);
          if (aliasesForKid.some((a) => a.toLowerCase().includes(q))) { textScore += 7; matchedFields.push("aliases"); }

          if (textScore === 0) continue;
          score += textScore;
        }

        results.push({ item: entry, score, matched_fields: matchedFields });
      }

      results.sort((a, b) => b.score - a.score);
      const sliced = results.slice(0, limit);

      res.json({ results: sliced, total: results.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const MUS_LIB_DIR = path.join(AXION_ROOT, "libraries", "maintenance");

  app.get("/api/maintenance", (_req: Request, res: Response) => {
    try {
      const regDir = path.join(MUS_LIB_DIR, "registries");
      const contractsDir = path.join(MUS_LIB_DIR, "contracts");
      const policiesDir = path.join(MUS_LIB_DIR, "policies");

      const modesReg = fs.existsSync(path.join(regDir, "REG-MAINTENANCE-MODES.json"))
        ? JSON.parse(fs.readFileSync(path.join(regDir, "REG-MAINTENANCE-MODES.json"), "utf-8"))
        : { items: [] };
      const gatesReg = fs.existsSync(path.join(regDir, "REG-GATES-MUS.json"))
        ? JSON.parse(fs.readFileSync(path.join(regDir, "REG-GATES-MUS.json"), "utf-8"))
        : { items: [] };
      const detectorsReg = fs.existsSync(path.join(regDir, "REG-DETECTOR-PACKS.json"))
        ? JSON.parse(fs.readFileSync(path.join(regDir, "REG-DETECTOR-PACKS.json"), "utf-8"))
        : { items: [] };
      const patchesReg = fs.existsSync(path.join(regDir, "REG-PATCH-TYPES.json"))
        ? JSON.parse(fs.readFileSync(path.join(regDir, "REG-PATCH-TYPES.json"), "utf-8"))
        : { items: [] };
      const schedulesReg = fs.existsSync(path.join(regDir, "REG-SCHEDULES.json"))
        ? JSON.parse(fs.readFileSync(path.join(regDir, "REG-SCHEDULES.json"), "utf-8"))
        : { items: [] };

      const policies: Record<string, unknown>[] = [];
      if (fs.existsSync(policiesDir)) {
        for (const f of fs.readdirSync(policiesDir).filter((f: string) => f.endsWith(".json"))) {
          try { policies.push(JSON.parse(fs.readFileSync(path.join(policiesDir, f), "utf-8"))); } catch (err) { console.error(err); }
        }
      }

      let schemaCount = 0;
      if (fs.existsSync(contractsDir)) {
        schemaCount = fs.readdirSync(contractsDir).filter((f: string) => f.endsWith(".json") && f !== "contract.meta.json").length;
      }

      let registryCount = 0;
      if (fs.existsSync(regDir)) {
        registryCount = fs.readdirSync(regDir).filter((f: string) => f.endsWith(".json")).length;
      }

      res.json({
        modes: modesReg.items,
        gates: gatesReg.items,
        detectorPacks: detectorsReg.items,
        patchTypes: patchesReg.items,
        schedules: schedulesReg.items,
        policies,
        schemaCount,
        registryCount,
        summary: {
          modes: modesReg.items.length,
          gates: gatesReg.items.length,
          detectorPacks: detectorsReg.items.length,
          patchTypes: patchesReg.items.length,
          schedules: schedulesReg.items.length,
          policies: policies.length,
          schemas: schemaCount,
          registries: registryCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/maintenance/modes", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(MUS_LIB_DIR, "registries", "REG-MAINTENANCE-MODES.json");
      if (!fs.existsSync(filePath)) return res.json([]);
      const reg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(reg.items ?? []);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/gates", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(MUS_LIB_DIR, "registries", "REG-GATES-MUS.json");
      if (!fs.existsSync(filePath)) return res.json([]);
      const reg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(reg.items ?? []);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/detectors", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(MUS_LIB_DIR, "registries", "REG-DETECTOR-PACKS.json");
      if (!fs.existsSync(filePath)) return res.json([]);
      const reg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(reg.items ?? []);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/patches", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(MUS_LIB_DIR, "registries", "REG-PATCH-TYPES.json");
      if (!fs.existsSync(filePath)) return res.json([]);
      const reg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(reg.items ?? []);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/schedules", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(MUS_LIB_DIR, "registries", "REG-SCHEDULES.json");
      if (!fs.existsSync(filePath)) return res.json([]);
      const reg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(reg.items ?? []);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/policies", (_req: Request, res: Response) => {
    try {
      const policiesDir = path.join(MUS_LIB_DIR, "policies");
      if (!fs.existsSync(policiesDir)) return res.json([]);
      const policies = fs.readdirSync(policiesDir)
        .filter((f: string) => f.endsWith(".json"))
        .map((f: string) => {
          try { return JSON.parse(fs.readFileSync(path.join(policiesDir, f), "utf-8")); } catch { return null; }
        })
        .filter(Boolean);
      res.json(policies);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/schemas", (_req: Request, res: Response) => {
    try {
      const contractsDir = path.join(MUS_LIB_DIR, "contracts");
      if (!fs.existsSync(contractsDir)) return res.json([]);
      const schemas = fs.readdirSync(contractsDir)
        .filter((f: string) => f.endsWith(".json") && f !== "contract.meta.json")
        .map((f: string) => {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(contractsDir, f), "utf-8"));
            return { filename: f, properties: Object.keys(content.properties ?? {}), required: content.required ?? [] };
          } catch { return null; }
        })
        .filter(Boolean);
      res.json(schemas);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/registries/:name", (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      if (name.includes("..") || name.includes("/")) return res.status(400).json({ error: "Invalid name" });
      const fileName = name.endsWith(".json") ? name : `${name}.json`;
      const filePath = path.join(MUS_LIB_DIR, "registries", fileName);
      if (!filePath.startsWith(path.join(MUS_LIB_DIR, "registries")) || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Registry '${name}' not found` });
      }
      res.json(JSON.parse(fs.readFileSync(filePath, "utf-8")));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/registries", (_req: Request, res: Response) => {
    try {
      const regDir = path.join(MUS_LIB_DIR, "registries");
      if (!fs.existsSync(regDir)) return res.json([]);
      const registries = fs.readdirSync(regDir)
        .filter((f: string) => f.endsWith(".json"))
        .map((f: string) => {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(regDir, f), "utf-8"));
            return { filename: f, registry_id: content.registry_id, items: content.items?.length ?? 0, version: content.registry_version };
          } catch { return null; }
        })
        .filter(Boolean);
      res.json(registries);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  const MUS_RUNS_DIR = path.join(AXION_ROOT, ".axion", "maintenance_runs");

  function ensureMusRunsDir() {
    if (!fs.existsSync(MUS_RUNS_DIR)) fs.mkdirSync(MUS_RUNS_DIR, { recursive: true });
  }

  let musRunCounter = 0;
  function allocateMusRunId(): string {
    const existing = fs.existsSync(MUS_RUNS_DIR)
      ? fs.readdirSync(MUS_RUNS_DIR).filter((d: string) => d.startsWith("MRUN-")).length
      : 0;
    musRunCounter = Math.max(musRunCounter, existing) + 1;
    return `MRUN-${String(musRunCounter).padStart(6, "0")}`;
  }

  function readMusRun(runId: string): any | null {
    const manifest = path.join(MUS_RUNS_DIR, runId, "maintenance_manifest.json");
    if (!fs.existsSync(manifest)) return null;
    return JSON.parse(fs.readFileSync(manifest, "utf-8"));
  }

  function writeMusRun(run: any) {
    const dir = path.join(MUS_RUNS_DIR, run.run_id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "maintenance_manifest.json"), JSON.stringify(run, null, 2));
  }

  const MUS_TRANSITIONS: Record<string, string[]> = {
    planned: ["applying", "cancelled"],
    applying: ["verifying", "failed", "rolling_back", "paused"],
    verifying: ["complete", "failed", "rolling_back"],
    blocked: ["applying", "cancelled", "rolling_back"],
    failed: ["planned", "rolling_back"],
    complete: [],
    paused: ["applying", "cancelled"],
    cancelled: [],
    rolling_back: ["failed", "planned"],
  };

  function loadMusModes(): any[] {
    const modePath = path.join(MUS_LIB_DIR, "registries", "REG-MAINTENANCE-MODES.json");
    if (!fs.existsSync(modePath)) return [];
    return JSON.parse(fs.readFileSync(modePath, "utf-8")).items ?? [];
  }

  app.post("/api/maintenance/runs", (req: Request, res: Response) => {
    try {
      ensureMusRunsDir();
      const { mode_id, intent_type, scope_constraints, risk_class, units, baseline_revision } = req.body;
      if (!mode_id || !intent_type || !baseline_revision) {
        return res.status(400).json({ error: "mode_id, intent_type, and baseline_revision are required" });
      }
      if (!units || !Array.isArray(units) || units.length === 0) {
        return res.status(400).json({ error: "At least one unit is required" });
      }
      for (const u of units) {
        if (!u.unit_id) return res.status(400).json({ error: "Each unit must have a unit_id" });
        if (!u.type) return res.status(400).json({ error: `Unit ${u.unit_id} must have a type` });
        if (!u.target_paths || !Array.isArray(u.target_paths) || u.target_paths.length === 0) {
          return res.status(400).json({ error: `Unit ${u.unit_id} must have at least one target_path` });
        }
      }

      const modes = loadMusModes();
      const mode = modes.find((m: any) => m.mode_id === mode_id);
      if (mode && mode.status !== "active") {
        return res.status(400).json({ error: `Mode ${mode_id} is not active (status: ${mode.status})` });
      }

      const now = new Date().toISOString();
      const run = {
        run_id: allocateMusRunId(),
        mode_id,
        intent_type,
        scope_constraints: scope_constraints ?? [],
        risk_class: risk_class ?? "low",
        status: "planned",
        units: units.map((u: any) => ({
          unit_id: u.unit_id,
          type: u.type,
          status: "not_started",
          target_paths: u.target_paths,
          verification_results: [],
        })),
        baseline_revision,
        created_at: now,
        updated_at: now,
      };
      writeMusRun(run);
      res.json(run);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/maintenance/runs", (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(MUS_RUNS_DIR)) return res.json([]);
      const entries = fs.readdirSync(MUS_RUNS_DIR, { withFileTypes: true });
      const runs: any[] = [];
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith("MRUN-")) {
          const run = readMusRun(entry.name);
          if (run) runs.push(run);
        }
      }
      runs.sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""));
      res.json(runs);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/maintenance/runs/:runId", (req: Request, res: Response) => {
    try {
      const run = readMusRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      res.json(run);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/maintenance/runs/:runId/apply", (req: Request, res: Response) => {
    try {
      const run = readMusRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      if (run.status !== "planned") return res.status(400).json({ error: `Cannot apply: run is in state '${run.status}', expected 'planned'` });

      const modes = loadMusModes();
      const mode = modes.find((m: any) => m.mode_id === run.mode_id);
      if (mode?.hard_constraints?.no_apply) {
        return res.status(400).json({ error: `Mode ${run.mode_id} has no_apply constraint` });
      }

      run.status = "applying";
      run.updated_at = new Date().toISOString();
      for (const unit of run.units) {
        if (unit.status === "not_started") unit.status = "done";
      }
      writeMusRun(run);
      res.json(run);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });

  app.post("/api/maintenance/runs/:runId/verify", (req: Request, res: Response) => {
    try {
      const run = readMusRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      if (run.status !== "applying") return res.status(400).json({ error: `Cannot verify: run is in state '${run.status}', expected 'applying'` });

      run.status = "verifying";
      run.updated_at = new Date().toISOString();
      for (const unit of run.units) {
        unit.verification_results = [
          ...(unit.verification_results || []),
          {
            check_id: `verify-${unit.unit_id}`,
            passed: unit.status === "done",
            details: unit.status === "done" ? "Verification passed" : "Unit not completed",
            timestamp: new Date().toISOString(),
          },
        ];
      }
      writeMusRun(run);
      res.json(run);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });

  app.post("/api/maintenance/runs/:runId/complete", (req: Request, res: Response) => {
    try {
      const run = readMusRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      if (run.status !== "verifying") return res.status(400).json({ error: `Cannot complete: run is in state '${run.status}', expected 'verifying'` });

      const allDone = run.units.every((u: any) => u.status === "done" || u.status === "skipped");
      if (!allDone) return res.status(400).json({ error: "Not all units are done or skipped" });

      const allVerified = run.units.every((u: any) =>
        u.verification_results?.length > 0 && u.verification_results.every((v: any) => v.passed)
      );
      if (!allVerified) return res.status(400).json({ error: "Not all units have passing verification" });

      run.status = "complete";
      run.updated_at = new Date().toISOString();
      run.completed_at = run.updated_at;
      writeMusRun(run);

      const report = {
        run_id: run.run_id,
        mode_id: run.mode_id,
        status: "complete",
        units: run.units,
        created_at: run.created_at,
        completed_at: run.completed_at,
      };
      const reportPath = path.join(MUS_RUNS_DIR, run.run_id, "maintenance_run_report.json");
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      res.json(report);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });

  app.post("/api/maintenance/runs/:runId/rollback", (req: Request, res: Response) => {
    try {
      const run = readMusRun(req.params.runId);
      if (!run) return res.status(404).json({ error: `Run ${req.params.runId} not found` });
      if (run.status === "complete" || run.status === "cancelled") {
        return res.status(400).json({ error: `Cannot rollback: run is in state '${run.status}'` });
      }
      const allowed = MUS_TRANSITIONS[run.status];
      if (!allowed || !allowed.includes("rolling_back")) {
        return res.status(400).json({ error: `Cannot rollback from state '${run.status}'` });
      }

      const previousStatus = run.status;
      run.updated_at = new Date().toISOString();

      const filesReverted: string[] = [];
      for (const unit of run.units) {
        if (unit.status === "done" || unit.status === "in_progress") {
          filesReverted.push(...(unit.target_paths || []));
          unit.status = "not_started";
          unit.verification_results = [];
        }
      }

      run.status = "planned";
      writeMusRun(run);

      const rollbackRecord = {
        run_id: run.run_id,
        rolled_back_at: run.updated_at,
        previous_status: previousStatus,
        final_status: "planned",
        reason: `Rollback from state: ${previousStatus}`,
        baseline_revision: run.baseline_revision,
        files_reverted: filesReverted,
      };
      const recordPath = path.join(MUS_RUNS_DIR, run.run_id, "rollback_record.json");
      fs.writeFileSync(recordPath, JSON.stringify(rollbackRecord, null, 2));

      res.json(rollbackRecord);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });

  app.patch("/api/maintenance/schedules/:scheduleId", (req: Request, res: Response) => {
    try {
      const { scheduleId } = req.params;
      const { status } = req.body;
      if (!status || !["enabled", "disabled"].includes(status)) {
        return res.status(400).json({ error: "status must be 'enabled' or 'disabled'" });
      }
      const regPath = path.join(MUS_LIB_DIR, "registries", "REG-SCHEDULES.json");
      if (!fs.existsSync(regPath)) return res.status(404).json({ error: "Schedules registry not found" });
      const reg = JSON.parse(fs.readFileSync(regPath, "utf-8"));
      const schedule = reg.items?.find((s: any) => s.schedule_id === scheduleId);
      if (!schedule) return res.status(404).json({ error: `Schedule ${scheduleId} not found` });
      schedule.status = status;
      reg.updated_at = new Date().toISOString();
      fs.writeFileSync(regPath, JSON.stringify(reg, null, 2));
      res.json(schedule);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/autofill", async (req: Request, res: Response) => {
    try {
      const { routing, project, targetSection } = req.body;

      if (!routing || !targetSection) {
        return res.status(400).json({ error: "routing and targetSection are required" });
      }

      const axionBaseDir = path.join(process.cwd(), "Axion");

      const projectData = (project || {}) as Record<string, unknown>;
      const attachments = (projectData.attachments as Array<{ id: string; filename: string; originalName: string }>) || [];

      const suggestions = await generateAutofillSuggestions(
        routing as Record<string, string>,
        projectData,
        targetSection as string,
        axionBaseDir,
        attachments,
      );

      res.json({ suggestions, section: targetSection });
    } catch (err: any) {
      console.error("Autofill error:", err.message || err);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  const runningBuilds = new Map<number, { child: ChildProcess; runId: string; buildState: any; startTime: number }>();

  app.post("/api/assemblies/:id/build", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      if (runningBuilds.has(id)) {
        return res.status(409).json({ error: "Build already in progress for this assembly" });
      }

      const mode = req.body?.mode;
      if (!mode || !["build_repo", "build_and_export"].includes(mode)) {
        return res.status(400).json({ error: "mode must be 'build_repo' or 'build_and_export'" });
      }

      const runId = req.body?.runId || assembly.runId;
      if (!runId) return res.status(400).json({ error: "No run specified and no completed run for this assembly" });

      if (req.body?.runId) {
        const pipelineRun = await storage.getPipelineRunByRunId(runId);
        if (!pipelineRun || pipelineRun.assemblyId !== id) {
          return res.status(403).json({ error: "Run does not belong to this assembly" });
        }
      }

      const runDir = safePath(runId);
      if (!runDir || !fs.existsSync(runDir)) {
        return res.status(400).json({ error: `Run directory not found: ${runId}` });
      }

      const buildState: any = {
        state: "requested",
        buildId: null,
        runId,
        mode,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slicesCompleted: 0,
        totalSlices: 0,
        filesGenerated: 0,
        totalFiles: 0,
        currentSlice: null,
        error: null,
        failureClass: null,
        tokenUsage: null,
      };

      const child = spawn("npx", ["tsx", "src/cli/axion.ts", "build", "--run", runId, "--mode", mode], {
        cwd: AXION_ROOT,
        env: { ...process.env },
        stdio: ["ignore", "pipe", "pipe"],
      });

      runningBuilds.set(id, { child, runId, buildState, startTime: Date.now() });

      let stdoutBuffer = "";
      let lastTokenApiCalls = 0;
      let buildUpdateQueue = Promise.resolve();

      function enqueueBuildUpdate(fn: () => Promise<void>) {
        buildUpdateQueue = buildUpdateQueue.then(fn).catch(() => {});
      }

      child.stdout.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stdoutBuffer += text;
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop() ?? "";

        for (const line of lines) {
          const progressMatch = line.match(/^BUILD_PROGRESS: (.+)$/);
          if (progressMatch) {
            try {
              const progress = JSON.parse(progressMatch[1]);
              const entry = runningBuilds.get(id);
              if (entry) {
                entry.buildState.buildId = progress.buildId || entry.buildState.buildId;
                entry.buildState.state = progress.state || entry.buildState.state;
                entry.buildState.slicesCompleted = progress.slicesCompleted ?? entry.buildState.slicesCompleted;
                entry.buildState.totalSlices = progress.totalSlices ?? entry.buildState.totalSlices;
                entry.buildState.filesGenerated = progress.filesGenerated ?? entry.buildState.filesGenerated;
                entry.buildState.totalFiles = progress.totalFiles ?? entry.buildState.totalFiles;
                entry.buildState.currentSlice = progress.currentSlice || entry.buildState.currentSlice;
                entry.buildState.updatedAt = progress.updatedAt || new Date().toISOString();
                if (progress.error) entry.buildState.error = progress.error;
                if (progress.failureClass) entry.buildState.failureClass = progress.failureClass;
              }
            } catch (err) { console.error(err); }
          }

          const tokenMatch = line.match(/^TOKEN_USAGE: (.+)$/);
          if (tokenMatch) {
            try {
              const usage = JSON.parse(tokenMatch[1]);
              const calls = usage.api_calls ?? 0;
              if (calls > lastTokenApiCalls) {
                lastTokenApiCalls = calls;
                const tokenUsage = {
                  total_prompt_tokens: usage.total_prompt_tokens ?? 0,
                  total_completion_tokens: usage.total_completion_tokens ?? 0,
                  total_tokens: usage.total_tokens ?? 0,
                  total_cost_usd: usage.total_cost_usd ?? 0,
                  api_calls: calls,
                  by_stage: usage.by_stage ?? {},
                };
                const entry = runningBuilds.get(id);
                if (entry) {
                  entry.buildState.tokenUsage = tokenUsage;
                }
                enqueueBuildUpdate(async () => {
                  await storage.updateAssembly(id, { buildTokenUsage: tokenUsage } as any);
                });
              }
            } catch (err: any) {
              console.error(`[build] Malformed TOKEN_USAGE line: ${err.message}`);
            }
          }
        }
      });

      child.stderr.on("data", () => {});

      child.on("close", (code) => {
        const entry = runningBuilds.get(id);
        if (entry) {
          if (code !== 0 && entry.buildState.state !== "failed") {
            entry.buildState.state = "failed";
            entry.buildState.error = entry.buildState.error || `Build process exited with code ${code}`;
          }
          entry.buildState.updatedAt = new Date().toISOString();
          if (entry.buildState.tokenUsage) {
            enqueueBuildUpdate(async () => {
              await storage.updateAssembly(id, { buildTokenUsage: entry.buildState.tokenUsage } as any);
            });
          }
          setTimeout(() => {
            runningBuilds.delete(id);
          }, 30000);
        }
      });

      res.json({ status: "started", runId, mode, message: "Build started" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:id/build", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      const requestedRunId = req.query.runId as string | undefined;
      const runId = requestedRunId || assembly.runId;
      if (!runId) return res.status(404).json({ error: "No completed run" });

      if (requestedRunId) {
        const pipelineRun = await storage.getPipelineRunByRunId(runId);
        if (!pipelineRun || pipelineRun.assemblyId !== id) {
          return res.status(403).json({ error: "Run does not belong to this assembly" });
        }
      }

      const safeRunDir = safePath(runId);
      if (!safeRunDir) return res.status(400).json({ error: "Invalid run ID" });
      const buildDir = path.join(safeRunDir, "build");

      const runningEntry = runningBuilds.get(id);
      if (runningEntry && runningEntry.runId === runId) {
        const bs = runningEntry.buildState;
        const result: any = {
          state: bs.state,
          buildId: bs.buildId,
          runId: bs.runId,
          progress: {
            currentSlice: bs.currentSlice,
            slicesCompleted: bs.slicesCompleted,
            totalSlices: bs.totalSlices,
            filesGenerated: bs.filesGenerated,
            totalFiles: bs.totalFiles,
            tokenUsage: bs.tokenUsage,
            startedAt: bs.startedAt,
            updatedAt: bs.updatedAt,
          },
          errors: bs.error ? [bs.error] : [],
        };
        const manifestPath = path.join(buildDir, "build_manifest.json");
        if (fs.existsSync(manifestPath)) {
          try { result.manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")); } catch (err) { console.error(err); }
        }
        const verificationPath = path.join(buildDir, "verification_report.json");
        if (fs.existsSync(verificationPath)) {
          try { result.verification = JSON.parse(fs.readFileSync(verificationPath, "utf-8")); } catch (err) { console.error(err); }
        }
        const planPath = path.join(buildDir, "build_plan.json");
        if (fs.existsSync(planPath)) {
          try { result.plan = JSON.parse(fs.readFileSync(planPath, "utf-8")); } catch (err) { console.error(err); }
        }
        return res.json(result);
      }

      if (!fs.existsSync(buildDir)) {
        return res.json({ state: "not_requested", runId });
      }

      const result: any = { runId };

      const manifestPath = path.join(buildDir, "build_manifest.json");
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          result.buildId = manifest.buildId;
          result.state = manifest.status;
          result.manifest = manifest;
        } catch (err) { console.error(err); }
      }

      const verificationPath = path.join(buildDir, "verification_report.json");
      if (fs.existsSync(verificationPath)) {
        try { result.verification = JSON.parse(fs.readFileSync(verificationPath, "utf-8")); } catch (err) { console.error(err); }
      }

      const repoManifestPath = path.join(buildDir, "repo_manifest.json");
      if (fs.existsSync(repoManifestPath)) {
        try { result.repoManifest = JSON.parse(fs.readFileSync(repoManifestPath, "utf-8")); } catch (err) { console.error(err); }
      }

      const buildPlanPath = path.join(buildDir, "build_plan.json");
      if (fs.existsSync(buildPlanPath)) {
        try { result.plan = JSON.parse(fs.readFileSync(buildPlanPath, "utf-8")); } catch (err) { console.error(err); }
      }

      const zipPath = path.join(buildDir, "project_repo.zip");
      result.hasExportZip = fs.existsSync(zipPath);

      if (!result.state) {
        result.state = result.hasExportZip ? "exported" : fs.existsSync(path.join(buildDir, "repo")) ? "passed" : "not_requested";
      }

      if (!result.manifest?.tokenUsage && assembly.buildTokenUsage) {
        if (!result.manifest) result.manifest = {};
        result.manifest.tokenUsage = assembly.buildTokenUsage;
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:id/build/download", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      const requestedRunId = req.query.runId as string | undefined;
      const runId = requestedRunId || assembly.runId;
      if (!runId) return res.status(404).json({ error: "No completed run" });

      if (requestedRunId) {
        const pipelineRun = await storage.getPipelineRunByRunId(runId);
        if (!pipelineRun || pipelineRun.assemblyId !== id) {
          return res.status(403).json({ error: "Run does not belong to this assembly" });
        }
      }

      const safeRunDir = safePath(runId);
      if (!safeRunDir) return res.status(400).json({ error: "Invalid run ID" });
      const zipPath = path.join(safeRunDir, "build", "project_repo.zip");

      if (!fs.existsSync(zipPath)) {
        return res.status(404).json({ error: "Export zip not found. Build with mode 'build_and_export' first." });
      }

      const stat = fs.statSync(zipPath);
      const projectName = assembly.projectName?.replace(/[^a-zA-Z0-9_-]/g, "_") || "project";

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${projectName}_build.zip"`);
      res.setHeader("Content-Length", stat.size.toString());

      const stream = fs.createReadStream(zipPath);
      stream.pipe(res);
      stream.on("error", () => {
        if (!res.headersSent) res.status(500).json({ error: "Failed to stream zip" });
        else res.end();
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:id/preview", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      const now = new Date().toISOString();

      let runId = assembly.runId;
      if (!runId) {
        const runs = await storage.getPipelineRuns(id);
        const completedRun = runs.find((r: any) => r.status === "completed" && r.runId);
        if (!completedRun) {
          return res.json({
            status: "none",
            runId: null,
            buildStatus: null,
            previewUrl: null,
            entryUrl: null,
            updatedAt: assembly.updatedAt,
            generatedAt: now,
            embeddable: false,
            environment: null,
            error: null,
          });
        }
        runId = completedRun.runId;
      }

      if (assembly.status === "running") {
        return res.json({
          status: "building",
          runId,
          buildStatus: "running",
          previewUrl: null,
          entryUrl: null,
          updatedAt: assembly.updatedAt,
          generatedAt: now,
          embeddable: false,
          environment: null,
          error: null,
        });
      }

      let effectiveRunId = runId;
      let buildDir = path.join(AXION_RUNS, runId, "build");
      let manifestPath = path.join(buildDir, "build_manifest.json");

      if (!fs.existsSync(manifestPath)) {
        const runs = await storage.getPipelineRuns(id);
        const previousBuild = runs
          .filter((r: any) => r.status === "completed" && r.runId && r.runId !== runId)
          .sort((a: any, b: any) => (b.runId || "").localeCompare(a.runId || ""))
          .find((r: any) => {
            const prevManifest = path.join(AXION_RUNS, r.runId, "build", "build_manifest.json");
            return fs.existsSync(prevManifest);
          });

        if (previousBuild) {
          effectiveRunId = previousBuild.runId;
          buildDir = path.join(AXION_RUNS, effectiveRunId, "build");
          manifestPath = path.join(buildDir, "build_manifest.json");
        } else {
          return res.json({
            status: "none",
            runId,
            buildStatus: null,
            previewUrl: null,
            entryUrl: null,
            updatedAt: assembly.updatedAt,
            generatedAt: now,
            embeddable: false,
            environment: null,
            error: null,
          });
        }
      }

      let manifest: any = {};
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      } catch {
        return res.json({
          status: "failed",
          runId,
          buildStatus: "error",
          previewUrl: null,
          entryUrl: null,
          updatedAt: assembly.updatedAt,
          generatedAt: now,
          embeddable: false,
          environment: null,
          error: "Failed to parse build manifest",
        });
      }

      const buildStatus = manifest.status || null;

      if (buildStatus === "building" || buildStatus === "requested" || buildStatus === "approved") {
        return res.json({
          status: "building",
          runId: effectiveRunId,
          buildStatus,
          previewUrl: null,
          entryUrl: null,
          updatedAt: assembly.updatedAt,
          generatedAt: now,
          embeddable: false,
          environment: null,
          error: null,
        });
      }

      if (buildStatus === "failed" || buildStatus === "error") {
        return res.json({
          status: "failed",
          runId: effectiveRunId,
          buildStatus,
          previewUrl: null,
          entryUrl: null,
          updatedAt: assembly.updatedAt,
          generatedAt: now,
          embeddable: false,
          environment: null,
          error: manifest.error || "Build failed",
        });
      }

      if (buildStatus === "passed" || buildStatus === "exported" || buildStatus === "completed") {
        const repoDir = path.join(buildDir, "repo");
        const distDir = path.join(repoDir, "dist");

        if (fs.existsSync(distDir)) {
          const distIndex = path.join(distDir, "index.html");
          if (fs.existsSync(distIndex)) {
            const previewUrl = `/api/preview/${effectiveRunId}/dist/index.html`;
            return res.json({
              status: "ready",
              runId: effectiveRunId,
              buildStatus,
              previewUrl,
              entryUrl: previewUrl,
              updatedAt: assembly.updatedAt,
              generatedAt: now,
              embeddable: true,
              environment: manifest.environment || "production",
              error: null,
            });
          }
        }

        const compilationStatus = getCompilationStatus(effectiveRunId);
        if (compilationStatus.status === "installing" || compilationStatus.status === "compiling") {
          return res.json({
            status: "compiling",
            runId: effectiveRunId,
            buildStatus,
            previewUrl: null,
            entryUrl: null,
            updatedAt: assembly.updatedAt,
            generatedAt: now,
            embeddable: false,
            environment: manifest.environment || "production",
            error: null,
            compileProgress: compilationStatus.progress,
          });
        }

        if (compilationStatus.status === "failed") {
          return res.json({
            status: "uncompiled",
            runId: effectiveRunId,
            buildStatus,
            previewUrl: `/api/preview/${effectiveRunId}/_overview`,
            entryUrl: null,
            updatedAt: assembly.updatedAt,
            generatedAt: now,
            embeddable: true,
            environment: manifest.environment || "production",
            error: null,
            compileError: compilationStatus.error,
          });
        }

        const indexPath = path.join(repoDir, "index.html");
        if (fs.existsSync(indexPath)) {
          const indexContent = fs.readFileSync(indexPath, "utf-8");
          const hasRawSource = /src=["']\/src\/.*\.(tsx|ts|jsx)["']/i.test(indexContent);
          if (hasRawSource) {
            return res.json({
              status: "uncompiled",
              runId: effectiveRunId,
              buildStatus,
              previewUrl: `/api/preview/${effectiveRunId}/_overview`,
              entryUrl: null,
              updatedAt: assembly.updatedAt,
              generatedAt: now,
              embeddable: true,
              environment: manifest.environment || "production",
              error: null,
            });
          }
          const hasScriptTag = /<script\b/i.test(indexContent);
          if (hasScriptTag) {
            const previewUrl = `/api/preview/${effectiveRunId}/index.html`;
            return res.json({
              status: "ready",
              runId: effectiveRunId,
              buildStatus,
              previewUrl,
              entryUrl: previewUrl,
              updatedAt: assembly.updatedAt,
              generatedAt: now,
              embeddable: true,
              environment: manifest.environment || "production",
              error: null,
            });
          }
        }

        if (fs.existsSync(repoDir) && fs.existsSync(path.join(repoDir, "package.json"))) {
          return res.json({
            status: "uncompiled",
            runId: effectiveRunId,
            buildStatus,
            previewUrl: `/api/preview/${effectiveRunId}/_overview`,
            entryUrl: null,
            updatedAt: assembly.updatedAt,
            generatedAt: now,
            embeddable: true,
            environment: manifest.environment || "production",
            error: null,
          });
        }

        return res.json({
          status: "none",
          runId: effectiveRunId,
          buildStatus,
          previewUrl: null,
          entryUrl: null,
          updatedAt: assembly.updatedAt,
          generatedAt: now,
          embeddable: false,
          environment: manifest.environment || "production",
          error: "No previewable files found in build output",
        });
      }

      return res.json({
        status: "none",
        runId: effectiveRunId,
        buildStatus,
        previewUrl: null,
        entryUrl: null,
        updatedAt: assembly.updatedAt,
        generatedAt: now,
        embeddable: false,
        environment: null,
        error: null,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:id/preview/refresh", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      const now = new Date().toISOString();
      const runId = assembly.runId;

      if (!runId) {
        return res.json({ status: "none", runId: null, buildStatus: null, previewUrl: null, entryUrl: null, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: false, environment: null, error: null });
      }

      if (assembly.status === "running") {
        return res.json({ status: "building", runId, buildStatus: "running", previewUrl: null, entryUrl: null, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: false, environment: null, error: null });
      }

      let effectiveRunId = runId;
      let buildDir = path.join(AXION_RUNS, runId, "build");
      let manifestPath = path.join(buildDir, "build_manifest.json");
      if (!fs.existsSync(manifestPath)) {
        const runs = await storage.getPipelineRuns(id);
        const previousBuild = runs
          .filter((r: any) => r.status === "completed" && r.runId && r.runId !== runId)
          .sort((a: any, b: any) => (b.runId || "").localeCompare(a.runId || ""))
          .find((r: any) => {
            const prevManifest = path.join(AXION_RUNS, r.runId, "build", "build_manifest.json");
            return fs.existsSync(prevManifest);
          });

        if (previousBuild) {
          effectiveRunId = previousBuild.runId;
          buildDir = path.join(AXION_RUNS, effectiveRunId, "build");
          manifestPath = path.join(buildDir, "build_manifest.json");
        } else {
          return res.json({ status: "none", runId, buildStatus: null, previewUrl: null, entryUrl: null, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: false, environment: null, error: null });
        }
      }

      let manifest: any = {};
      try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")); } catch {
        return res.json({ status: "failed", runId: effectiveRunId, buildStatus: "error", previewUrl: null, entryUrl: null, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: false, environment: null, error: "Failed to parse build manifest" });
      }

      const buildStatus = manifest.status || null;
      if (buildStatus === "passed" || buildStatus === "exported" || buildStatus === "completed") {
        const repoDir = path.join(buildDir, "repo");
        const distDir = path.join(repoDir, "dist");
        if (fs.existsSync(distDir) && fs.existsSync(path.join(distDir, "index.html"))) {
          const previewUrl = `/api/preview/${effectiveRunId}/dist/index.html`;
          return res.json({ status: "ready", runId: effectiveRunId, buildStatus, previewUrl, entryUrl: previewUrl, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: true, environment: manifest.environment || "production", error: null });
        }

        const indexPath = path.join(repoDir, "index.html");
        if (fs.existsSync(indexPath)) {
          const indexContent = fs.readFileSync(indexPath, "utf-8");
          const hasRawSource = /src=["']\/src\/.*\.(tsx|ts|jsx)["']/i.test(indexContent);
          if (hasRawSource) {
            return res.json({ status: "uncompiled", runId: effectiveRunId, buildStatus, previewUrl: `/api/preview/${effectiveRunId}/_overview`, entryUrl: null, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: true, environment: manifest.environment || "production", error: null });
          }
          const previewUrl = `/api/preview/${effectiveRunId}/index.html`;
          return res.json({ status: "ready", runId: effectiveRunId, buildStatus, previewUrl, entryUrl: previewUrl, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: true, environment: manifest.environment || "production", error: null });
        }

        if (fs.existsSync(repoDir) && fs.existsSync(path.join(repoDir, "package.json"))) {
          return res.json({ status: "uncompiled", runId: effectiveRunId, buildStatus, previewUrl: `/api/preview/${effectiveRunId}/_overview`, entryUrl: null, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: true, environment: manifest.environment || "production", error: null });
        }
      }

      return res.json({ status: "none", runId: effectiveRunId, buildStatus, previewUrl: null, entryUrl: null, updatedAt: assembly.updatedAt, generatedAt: now, embeddable: false, environment: null, error: null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:id/preview/compile", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const assembly = await storage.getAssembly(id);
      if (!assembly) return res.status(404).json({ error: "Not found" });

      let runId = assembly.runId;
      if (!runId) return res.status(400).json({ error: "No completed run" });

      let repoDir = path.join(AXION_RUNS, runId, "build", "repo");
      if (!fs.existsSync(repoDir)) {
        const runs = await storage.getPipelineRuns(id);
        const previousBuild = runs
          .filter((r: any) => r.status === "completed" && r.runId && r.runId !== runId)
          .sort((a: any, b: any) => (b.runId || "").localeCompare(a.runId || ""))
          .find((r: any) => fs.existsSync(path.join(AXION_RUNS, r.runId, "build", "repo")));

        if (previousBuild) {
          runId = previousBuild.runId;
          repoDir = path.join(AXION_RUNS, runId, "build", "repo");
        } else {
          return res.status(400).json({ error: "No build repo found" });
        }
      }

      const status = startCompilation(runId, repoDir);
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/preview/:runId/_overview", (req: Request, res: Response) => {
    try {
      const runId = String(req.params.runId);
      if (/[^a-zA-Z0-9_\-]/.test(runId)) {
        return res.status(400).json({ error: "Invalid run ID" });
      }
      const repoDir = path.resolve(AXION_RUNS, runId, "build", "repo");
      const buildDir = path.resolve(AXION_RUNS, runId, "build");
      if (!fs.existsSync(repoDir)) {
        return res.status(404).json({ error: "Repository not found" });
      }
      const html = generateProjectOverview(runId, repoDir, buildDir);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/preview/:runId/{*filePath}", (req: Request, res: Response) => {
    try {
      const runId = String(req.params.runId);
      if (/[^a-zA-Z0-9_\-]/.test(runId)) {
        return res.status(400).json({ error: "Invalid run ID" });
      }
      const rawPath = (req.params as any).filePath;
      const filePath: string = Array.isArray(rawPath) ? rawPath.join("/") : String(rawPath || "index.html");

      const repoDir = path.resolve(AXION_RUNS, runId, "build", "repo");
      const fullPath = path.resolve(repoDir, filePath);
      const rel = path.relative(repoDir, fullPath);
      if (rel.startsWith("..") || path.isAbsolute(rel)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const stat = fs.lstatSync(fullPath);
      if (stat.isSymbolicLink()) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (stat.isDirectory()) {
        const indexRel = path.join(rel, "index.html");
        const indexFull = path.join(fullPath, "index.html");
        if (fs.existsSync(indexFull) && !fs.lstatSync(indexFull).isSymbolicLink()) {
          return res.sendFile(indexRel, { root: repoDir }, (err) => {
            if (err && !res.headersSent) res.status(404).json({ error: "File not found" });
          });
        }
        return res.status(404).json({ error: "File not found" });
      }

      return res.sendFile(rel, { root: repoDir }, (err) => {
        if (err && !res.headersSent) res.status(404).json({ error: "File not found" });
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/baq/runs", async (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(AXION_RUNS)) return res.json({ runs: [] });
      const entries = await fsp.readdir(AXION_RUNS);
      const runs: Array<{ runId: string; hasBAQ: boolean; artifacts: string[]; assemblyId: number | null; assemblyName: string | null }> = [];
      for (const entry of entries) {
        if (!entry.startsWith("RUN-")) continue;
        const runDir = path.join(AXION_RUNS, entry);
        const stat = await fsp.stat(runDir).catch(() => null);
        if (!stat?.isDirectory()) continue;
        const baqFiles = [
          "kit_extraction.json",
          "derived_build_inputs.json",
          "repo_inventory.json",
          "requirement_trace_map.json",
          "build_quality_report.json",
          "generation_failure_report.json",
          "sufficiency_evaluation.json",
        ];
        const found: string[] = [];
        for (const f of baqFiles) {
          if (await fileExists(path.join(runDir, f))) found.push(f);
        }
        let assemblyId: number | null = null;
        let assemblyName: string | null = null;
        try {
          const pipelineRun = await storage.getPipelineRunByRunId(entry);
          if (pipelineRun) {
            assemblyId = pipelineRun.assemblyId;
            const assembly = await storage.getAssembly(pipelineRun.assemblyId);
            if (assembly) assemblyName = assembly.projectName;
          }
        } catch {}
        runs.push({ runId: entry, hasBAQ: found.length > 0, artifacts: found, assemblyId, assemblyName });
      }
      runs.sort((a, b) => b.runId.localeCompare(a.runId));
      res.json({ runs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/baq/runs/:runId", async (req: Request, res: Response) => {
    try {
      const runDir = safePath(req.params.runId);
      if (!runDir) return res.status(400).json({ error: "Invalid run ID" });
      if (!await fileExists(runDir)) return res.status(404).json({ error: "Run not found" });

      const artifactMap: Record<string, string> = {
        extraction: "kit_extraction.json",
        derivedInputs: "derived_build_inputs.json",
        inventory: "repo_inventory.json",
        traceMap: "requirement_trace_map.json",
        qualityReport: "build_quality_report.json",
        failureReport: "generation_failure_report.json",
        sufficiency: "sufficiency_evaluation.json",
      };

      const result: Record<string, any> = {};
      const available: string[] = [];
      const missing: string[] = [];
      const invalid: string[] = [];

      for (const [key, filename] of Object.entries(artifactMap)) {
        const filePath = path.join(runDir, filename);
        if (await fileExists(filePath)) {
          try {
            result[key] = await safeReadJson(filePath);
            available.push(key);
          } catch {
            result[key] = null;
            invalid.push(key);
          }
        } else {
          result[key] = null;
          missing.push(key);
        }
      }

      const pkgDecisionPath = path.join(runDir, "kit", "packaging_decision.json");
      if (await fileExists(pkgDecisionPath)) {
        try {
          result.packagingDecision = await safeReadJson(pkgDecisionPath);
          available.push("packagingDecision");
        } catch {
          result.packagingDecision = null;
        }
      } else {
        result.packagingDecision = null;
      }

      res.json({ runId: req.params.runId, available, missing, invalid, ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/baq/runs/:runId/artifact/:artifact", async (req: Request, res: Response) => {
    try {
      const runDir = safePath(req.params.runId);
      if (!runDir) return res.status(400).json({ error: "Invalid run ID" });

      const allowed: Record<string, string> = {
        extraction: "kit_extraction.json",
        derivedInputs: "derived_build_inputs.json",
        "derived-inputs": "derived_build_inputs.json",
        inventory: "repo_inventory.json",
        traceMap: "requirement_trace_map.json",
        "trace-map": "requirement_trace_map.json",
        qualityReport: "build_quality_report.json",
        "quality-report": "build_quality_report.json",
        failureReport: "generation_failure_report.json",
        "failure-report": "generation_failure_report.json",
        sufficiency: "sufficiency_evaluation.json",
        packagingDecision: "kit/packaging_decision.json",
        "packaging-decision": "kit/packaging_decision.json",
      };

      const filename = allowed[req.params.artifact];
      if (!filename) return res.status(400).json({ error: "Unknown artifact" });

      const filePath = path.join(runDir, filename);
      if (!await fileExists(filePath)) return res.status(404).json({ error: "Artifact not found" });

      const data = await safeReadJson(filePath);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  registerMusRoutes(app);
  registerAVCSRoutes(app);
  registerAnalyticsRoutes(app);
  registerUpgradeRoutes(app);
}
