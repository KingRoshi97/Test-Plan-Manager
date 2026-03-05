import { type Express, type Request, type Response } from "express";
import { storage } from "./storage.js";
import { insertAssemblySchema } from "../shared/schema.js";
import { startPipelineRun } from "./pipeline-runner.js";
import { generateAutofillSuggestions } from "./openai.js";
import fs from "fs";
import path from "path";

const AXION_ROOT = path.resolve(process.cwd(), "Axion");
const AXION_RUNS = path.resolve(AXION_ROOT, ".axion", "runs");

function safePath(userPath: string): string | null {
  const resolved = path.resolve(AXION_RUNS, userPath);
  if (!resolved.startsWith(AXION_RUNS)) return null;
  return resolved;
}

export function registerRoutes(app: Express) {
  app.get("/api/assemblies", async (_req: Request, res: Response) => {
    const rows = await storage.getAssemblies();
    res.json(rows);
  });

  app.get("/api/assemblies/:id", async (req: Request, res: Response) => {
    const assembly = await storage.getAssembly(Number(req.params.id));
    if (!assembly) return res.status(404).json({ error: "Not found" });
    const runs = await storage.getPipelineRuns(assembly.id);
    res.json({ ...assembly, runs });
  });

  app.post("/api/assemblies", async (req: Request, res: Response) => {
    const parsed = insertAssemblySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
    const assembly = await storage.createAssembly(parsed.data);
    res.status(201).json(assembly);
  });

  app.delete("/api/assemblies/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const assembly = await storage.getAssembly(id);
    if (!assembly) return res.status(404).json({ error: "Not found" });
    await storage.deleteAssembly(id);
    res.json({ ok: true });
  });

  app.post("/api/assemblies/:id/run", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const assembly = await storage.getAssembly(id);
    if (!assembly) return res.status(404).json({ error: "Not found" });
    if (assembly.status === "running") return res.status(409).json({ error: "Already running" });

    try {
      const pipelineRun = await startPipelineRun(assembly);
      res.json(pipelineRun);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:id/runs", async (req: Request, res: Response) => {
    const runs = await storage.getPipelineRuns(Number(req.params.id));
    res.json(runs);
  });

  app.get("/api/assemblies/:id/runs/:runId", async (req: Request, res: Response) => {
    const run = await storage.getPipelineRunByRunId(req.params.runId);
    if (!run || run.assemblyId !== Number(req.params.id)) return res.status(404).json({ error: "Not found" });
    res.json(run);
  });

  app.get("/api/reports/:assemblyId", async (req: Request, res: Response) => {
    const rpts = await storage.getReports(Number(req.params.assemblyId));
    res.json(rpts);
  });

  app.get("/api/files", (req: Request, res: Response) => {
    const dir = (req.query.dir as string) || "";
    const base = safePath(dir);
    if (!base || !fs.existsSync(base)) return res.json([]);
    const entries = fs.readdirSync(base, { withFileTypes: true }).map((e) => ({
      name: e.name,
      type: e.isDirectory() ? "directory" : "file",
      path: path.join(dir, e.name),
    }));
    res.json(entries);
  });

  app.get("/api/files/{*filePath}", (req: Request, res: Response) => {
    const filePath = (req.params as any).filePath;
    const full = safePath(filePath);
    if (!full) return res.status(403).json({ error: "Forbidden" });
    if (!fs.existsSync(full)) return res.status(404).json({ error: "File not found" });
    if (fs.statSync(full).isDirectory()) {
      const entries = fs.readdirSync(full, { withFileTypes: true }).map((e) => ({
        name: e.name,
        type: e.isDirectory() ? "directory" : "file",
        path: path.join(filePath, e.name),
      }));
      return res.json(entries);
    }
    const content = fs.readFileSync(full, "utf-8");
    res.json({ path: filePath, content });
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    const gateRegistryPath = path.join(AXION_ROOT, "registries", "GATE_REGISTRY.json");
    const knowledgeIndexPath = path.join(AXION_ROOT, "libraries", "knowledge", "INDEX", "knowledge.index.json");
    let gateCount = 0;
    let kidCount = 0;
    try {
      const gates = JSON.parse(fs.readFileSync(gateRegistryPath, "utf-8"));
      gateCount = gates.gates?.length || 0;
    } catch {}
    try {
      const kl = JSON.parse(fs.readFileSync(knowledgeIndexPath, "utf-8"));
      kidCount = kl.total_items || 0;
    } catch {}

    const runsDir = AXION_RUNS;
    let recentRuns: string[] = [];
    if (fs.existsSync(runsDir)) {
      recentRuns = fs.readdirSync(runsDir).filter((d) => d.startsWith("RUN-")).sort().reverse().slice(0, 5);
    }

    res.json({
      status: "ok",
      pipeline: { stages: 10, gates: gateCount },
      knowledge: { kids: kidCount },
      templates: 177,
      recentRuns,
    });
  });

  app.get("/api/config", (_req: Request, res: Response) => {
    const stageOrder = [
      "S1_INGEST_NORMALIZE", "S2_VALIDATE_INTAKE", "S3_BUILD_CANONICAL",
      "S4_VALIDATE_CANONICAL", "S5_RESOLVE_STANDARDS", "S6_SELECT_TEMPLATES",
      "S7_RENDER_DOCS", "S8_BUILD_PLAN", "S9_VERIFY_PROOF", "S10_PACKAGE",
    ];
    const stageGates: Record<string, string> = {
      S2_VALIDATE_INTAKE: "G1_INTAKE_VALIDITY",
      S4_VALIDATE_CANONICAL: "G2_CANONICAL_INTEGRITY",
      S5_RESOLVE_STANDARDS: "G3_STANDARDS_RESOLVED",
      S6_SELECT_TEMPLATES: "G4_TEMPLATE_SELECTION",
      S7_RENDER_DOCS: "G5_TEMPLATE_COMPLETENESS",
      S8_BUILD_PLAN: "G6_PLAN_COVERAGE",
      S10_PACKAGE: "G8_PACKAGE_INTEGRITY",
    };
    res.json({ stageOrder, stageGates });
  });

  app.get("/api/status", async (_req: Request, res: Response) => {
    const allAssemblies = await storage.getAssemblies();
    const running = allAssemblies.filter((a) => a.status === "running").length;
    const completed = allAssemblies.filter((a) => a.status === "completed").length;
    const failed = allAssemblies.filter((a) => a.status === "failed").length;
    const queued = allAssemblies.filter((a) => a.status === "queued").length;
    res.json({ total: allAssemblies.length, running, completed, failed, queued });
  });

  app.post("/api/autofill", async (req: Request, res: Response) => {
    try {
      const { routing, project, targetSection } = req.body;

      if (!routing || !targetSection) {
        return res.status(400).json({ error: "routing and targetSection are required" });
      }

      const axionBaseDir = path.join(process.cwd(), "Axion");

      const suggestions = await generateAutofillSuggestions(
        routing as Record<string, string>,
        (project || {}) as Record<string, unknown>,
        targetSection as string,
        axionBaseDir,
      );

      res.json({ suggestions, section: targetSection });
    } catch (err: any) {
      console.error("Autofill error:", err.message || err);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });
}
