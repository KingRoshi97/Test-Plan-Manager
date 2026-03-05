import { type Express, type Request, type Response } from "express";
import { storage } from "./storage.js";
import { insertAssemblySchema } from "../shared/schema.js";
import { startPipelineRun } from "./pipeline-runner.js";
import { generateAutofillSuggestions } from "./openai.js";
import { getStageOrder, getStageGates, getGatesRequired, getStageNames } from "../Axion/src/core/orchestration/loader.js";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import multer from "multer";
import crypto from "crypto";

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

    let sysDocCount = 0;
    let sysSchemaCount = 0;
    let sysRegistryCount = 0;
    const sysLibDir = path.join(AXION_ROOT, "libraries", "system");
    try {
      if (fs.existsSync(sysLibDir)) {
        sysDocCount = fs.readdirSync(sysLibDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
      }
      const schemDir = path.join(sysLibDir, "schemas");
      if (fs.existsSync(schemDir)) {
        sysSchemaCount = fs.readdirSync(schemDir).filter((f) => f.endsWith(".json")).length;
      }
      const regDir = path.join(sysLibDir, "registries");
      if (fs.existsSync(regDir)) {
        sysRegistryCount = fs.readdirSync(regDir).filter((f) => f.endsWith(".json")).length;
      }
    } catch {}

    let orcDocCount = 0;
    let orcSchemaCount = 0;
    let orcRegistryCount = 0;
    let orcStageCount = 0;
    const orcLibDir = path.join(AXION_ROOT, "libraries", "orchestration");
    try {
      if (fs.existsSync(orcLibDir)) {
        orcDocCount = fs.readdirSync(orcLibDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("ORC-"))).length;
      }
      const orcSchemDir = path.join(orcLibDir, "schemas");
      if (fs.existsSync(orcSchemDir)) {
        orcSchemaCount = fs.readdirSync(orcSchemDir).filter((f) => f.endsWith(".json")).length;
      }
      const orcRegDir = path.join(orcLibDir, "registries");
      if (fs.existsSync(orcRegDir)) {
        orcRegistryCount = fs.readdirSync(orcRegDir).filter((f) => f.endsWith(".json")).length;
      }
      const pipelinePath = path.join(orcRegDir, "pipeline_definition.axion.v1.json");
      if (fs.existsSync(pipelinePath)) {
        const pd = JSON.parse(fs.readFileSync(pipelinePath, "utf-8"));
        orcStageCount = pd.stage_order?.length ?? 0;
      }
    } catch {}

    let gatesDocCount = 0;
    let gatesSchemaCount = 0;
    let gatesRegistryCount = 0;
    let gatesDefinitionCount = 0;
    const gatesLibDir = path.join(AXION_ROOT, "libraries", "gates");
    try {
      if (fs.existsSync(gatesLibDir)) {
        gatesDocCount = fs.readdirSync(gatesLibDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
      }
      const gatesSchemDir = path.join(gatesLibDir, "schemas");
      if (fs.existsSync(gatesSchemDir)) {
        gatesSchemaCount = fs.readdirSync(gatesSchemDir).filter((f) => f.endsWith(".json")).length;
      }
      const gatesRegDir = path.join(gatesLibDir, "registries");
      if (fs.existsSync(gatesRegDir)) {
        gatesRegistryCount = fs.readdirSync(gatesRegDir).filter((f) => f.endsWith(".json")).length;
      }
      const gateRegPath = path.join(gatesRegDir, "gate_registry.axion.v1.json");
      if (fs.existsSync(gateRegPath)) {
        const gr = JSON.parse(fs.readFileSync(gateRegPath, "utf-8"));
        gatesDefinitionCount = gr.gates?.length ?? 0;
      }
    } catch {}

    let polDocCount = 0;
    let polSchemaCount = 0;
    let polRegistryCount = 0;
    let polRiskClassCount = 0;
    let polPolicySetCount = 0;
    const polLibDir = path.join(AXION_ROOT, "libraries", "policy");
    try {
      if (fs.existsSync(polLibDir)) {
        polDocCount = fs.readdirSync(polLibDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
      }
      const polSchemDir = path.join(polLibDir, "schemas");
      if (fs.existsSync(polSchemDir)) {
        polSchemaCount = fs.readdirSync(polSchemDir).filter((f) => f.endsWith(".json")).length;
      }
      const polRegDir = path.join(polLibDir, "registries");
      if (fs.existsSync(polRegDir)) {
        polRegistryCount = fs.readdirSync(polRegDir).filter((f) => f.endsWith(".json")).length;
      }
      const rcPath = path.join(polRegDir, "risk_classes.v1.json");
      if (fs.existsSync(rcPath)) {
        const rc = JSON.parse(fs.readFileSync(rcPath, "utf-8"));
        polRiskClassCount = rc.classes?.length ?? 0;
      }
      const psPath = path.join(polRegDir, "policy_sets.v1.json");
      if (fs.existsSync(psPath)) {
        const ps = JSON.parse(fs.readFileSync(psPath, "utf-8"));
        polPolicySetCount = ps.policy_sets?.length ?? 0;
      }
    } catch {}

    let intDocCount = 0;
    let intSchemaCount = 0;
    let intRegistryCount = 0;
    let intEnumCount = 0;
    const intLibDir = path.join(AXION_ROOT, "libraries", "intake");
    try {
      if (fs.existsSync(intLibDir)) {
        intDocCount = fs.readdirSync(intLibDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
      }
      const intSchemDir = path.join(intLibDir, "schemas");
      if (fs.existsSync(intSchemDir)) {
        intSchemaCount = fs.readdirSync(intSchemDir).filter((f) => f.endsWith(".json")).length;
      }
      const intRegDir = path.join(intLibDir, "registries");
      if (fs.existsSync(intRegDir)) {
        intRegistryCount = fs.readdirSync(intRegDir).filter((f) => f.endsWith(".json")).length;
      }
      const intEnumPath = path.join(intRegDir, "intake_enums.v1.json");
      if (fs.existsSync(intEnumPath)) {
        const en = JSON.parse(fs.readFileSync(intEnumPath, "utf-8"));
        intEnumCount = en.enums?.length ?? 0;
      }
    } catch {}

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
      canonical: (() => {
        let canDocCount = 0, canSchemaCount = 0, canRegistryCount = 0, canEntityTypes = 0, canRelTypes = 0;
        try {
          const canDir = path.join(AXION_ROOT, "libraries", "canonical");
          if (fs.existsSync(canDir)) canDocCount = fs.readdirSync(canDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const canSchDir = path.join(canDir, "schemas");
          if (fs.existsSync(canSchDir)) canSchemaCount = fs.readdirSync(canSchDir).filter((f) => f.endsWith(".json")).length;
          const canRegDir = path.join(canDir, "registries");
          if (fs.existsSync(canRegDir)) canRegistryCount = fs.readdirSync(canRegDir).filter((f) => f.endsWith(".json")).length;
          const rcPath = path.join(canRegDir, "relationship_constraints.v1.json");
          if (fs.existsSync(rcPath)) { const rc = JSON.parse(fs.readFileSync(rcPath, "utf-8")); canRelTypes = rc.constraints?.length ?? 0; }
          const idPath = path.join(canRegDir, "id_rules.v1.json");
          if (fs.existsSync(idPath)) { const id = JSON.parse(fs.readFileSync(idPath, "utf-8")); canEntityTypes = Object.keys(id.canonical_key_templates ?? {}).length; }
        } catch {}
        return { docs: canDocCount, schemas: canSchemaCount, registries: canRegistryCount, entityTypes: canEntityTypes, relationshipTypes: canRelTypes };
      })(),
      recentRuns,
    });
  });

  app.get("/api/config", (_req: Request, res: Response) => {
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

  app.post("/api/uploads", (req: Request, res: Response) => {
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
  });

  app.get("/api/uploads/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    if (!/^[a-f0-9]{16}$/.test(id)) return res.status(400).json({ error: "Invalid file ID" });
    const files = fs.readdirSync(UPLOADS_DIR);
    const match = files.find((f) => path.basename(f, path.extname(f)) === id);
    if (!match) return res.status(404).json({ error: "File not found" });

    const fullPath = path.join(UPLOADS_DIR, match);
    res.download(fullPath, match);
  });

  app.delete("/api/uploads/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    if (!/^[a-f0-9]{16}$/.test(id)) return res.status(400).json({ error: "Invalid file ID" });
    const files = fs.readdirSync(UPLOADS_DIR);
    const match = files.find((f) => path.basename(f, path.extname(f)) === id);
    if (!match) return res.status(404).json({ error: "File not found" });

    const fullPath = path.join(UPLOADS_DIR, match);
    fs.unlinkSync(fullPath);
    res.json({ ok: true });
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
      } catch {}

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
      } catch {}

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
      } catch {}

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
      } catch {}

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
        } catch {}
      }

      const idPath = path.join(registriesDir, "id_rules.v1.json");
      if (fs.existsSync(idPath)) {
        try {
          const id = JSON.parse(fs.readFileSync(idPath, "utf-8"));
          entityTypes = Object.keys(id.canonical_key_templates ?? {}).length;
        } catch {}
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
