import { type Express, type Request, type Response } from "express";
import { storage } from "./storage.js";
import { insertAssemblySchema } from "../shared/schema.js";
import { startPipelineRun } from "./pipeline-runner.js";
import { generateAutofillSuggestions } from "./openai.js";
import fs from "fs";
import path from "path";
import archiver from "archiver";

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
    const enriched = await Promise.all(
      rows.map(async (a) => {
        if (!a.runId) return a;
        const run = await storage.getPipelineRunByRunId(a.runId);
        return { ...a, latestStages: run?.stages || null };
      })
    );
    res.json(enriched);
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

  app.patch("/api/assemblies/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const assembly = await storage.getAssembly(id);
    if (!assembly) return res.status(404).json({ error: "Not found" });
    if (assembly.status === "running") return res.status(409).json({ error: "Cannot update while running" });

    const allowedFields = ["projectName", "idea", "preset", "intakePayload", "config"];
    const update: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (Object.keys(update).length === 0) return res.status(400).json({ error: "No valid fields to update" });

    const updated = await storage.updateAssembly(id, update);
    res.json(updated);
  });

  app.get("/api/assemblies/:id/kit", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const assembly = await storage.getAssembly(id);
    if (!assembly) return res.status(404).json({ error: "Not found" });
    if (!assembly.runId) return res.status(404).json({ error: "No completed run" });

    const kitDir = path.join(AXION_RUNS, assembly.runId, "kit", "bundle", "agent_kit");
    const altKitDir = path.join(AXION_RUNS, assembly.runId, "kit");
    const targetDir = fs.existsSync(kitDir) ? kitDir : fs.existsSync(altKitDir) ? altKitDir : null;
    if (!targetDir) return res.status(404).json({ error: "Kit not found" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${assembly.projectName.replace(/[^a-zA-Z0-9_-]/g, "_")}_kit.zip"`);
    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", () => { if (!res.headersSent) res.status(500).end(); else res.end(); });
    archive.pipe(res);
    archive.directory(targetDir, "agent_kit");
    archive.finalize();
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
        } catch {}
      }

      res.json({ ...registry, specs: specFiles, reverse_dependencies: reverseDeps });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
