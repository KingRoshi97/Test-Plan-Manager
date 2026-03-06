import { type Express, type Request, type Response } from "express";
import { storage } from "./storage.js";
import { insertAssemblySchema } from "../shared/schema.js";
import { startPipelineRun, killPipeline } from "./pipeline-runner.js";
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

  app.post("/api/assemblies/:id/kill", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const assembly = await storage.getAssembly(id);
    if (!assembly) return res.status(404).json({ error: "Not found" });
    if (assembly.status !== "running") return res.status(409).json({ error: "Pipeline is not running" });

    try {
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
      standards: (() => {
        let stdDocCount = 0, stdSchemaCount = 0, stdRegistryCount = 0, stdPackCount = 0, stdRuleCount = 0;
        try {
          const stdDir = path.join(AXION_ROOT, "libraries", "standards");
          if (fs.existsSync(stdDir)) stdDocCount = fs.readdirSync(stdDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const stdSchDir = path.join(stdDir, "schemas");
          if (fs.existsSync(stdSchDir)) stdSchemaCount = fs.readdirSync(stdSchDir).filter((f) => f.endsWith(".json")).length;
          const stdRegDir = path.join(stdDir, "registries");
          if (fs.existsSync(stdRegDir)) stdRegistryCount = fs.readdirSync(stdRegDir).filter((f) => f.endsWith(".json")).length;
          const stdPackDir = path.join(stdDir, "packs");
          if (fs.existsSync(stdPackDir)) {
            const packFiles = fs.readdirSync(stdPackDir).filter((f) => f.endsWith(".json"));
            stdPackCount = packFiles.length;
            for (const pf of packFiles) {
              try { const pk = JSON.parse(fs.readFileSync(path.join(stdPackDir, pf), "utf-8")); stdRuleCount += pk.rules?.length ?? 0; } catch {}
            }
          }
        } catch {}
        return { docs: stdDocCount, schemas: stdSchemaCount, registries: stdRegistryCount, packs: stdPackCount, rules: stdRuleCount };
      })(),
      templates_library: (() => {
        let tmpDocCount = 0, tmpSchemaCount = 0, tmpRegistryCount = 0, tmpCategoryCount = 0;
        try {
          const tmpDir = path.join(AXION_ROOT, "libraries", "templates");
          if (fs.existsSync(tmpDir)) tmpDocCount = fs.readdirSync(tmpDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const tmpSchDir = path.join(tmpDir, "schemas");
          if (fs.existsSync(tmpSchDir)) tmpSchemaCount = fs.readdirSync(tmpSchDir).filter((f) => f.endsWith(".json")).length;
          const tmpRegDir = path.join(tmpDir, "registries");
          if (fs.existsSync(tmpRegDir)) tmpRegistryCount = fs.readdirSync(tmpRegDir).filter((f) => f.endsWith(".json")).length;
          const catOrderPath = path.join(tmpRegDir, "template_category_order.v1.json");
          if (fs.existsSync(catOrderPath)) {
            const co = JSON.parse(fs.readFileSync(catOrderPath, "utf-8"));
            tmpCategoryCount = co.order?.length ?? 0;
          }
        } catch {}
        return { docs: tmpDocCount, schemas: tmpSchemaCount, registries: tmpRegistryCount, categories: tmpCategoryCount };
      })(),
      planning_library: (() => {
        let planDocCount = 0, planSchemaCount = 0, planRegistryCount = 0, planCoverageRuleCount = 0;
        try {
          const planDir = path.join(AXION_ROOT, "libraries", "planning");
          if (fs.existsSync(planDir)) planDocCount = fs.readdirSync(planDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const planSchDir = path.join(planDir, "schemas");
          if (fs.existsSync(planSchDir)) planSchemaCount = fs.readdirSync(planSchDir).filter((f) => f.endsWith(".json")).length;
          const planRegDir = path.join(planDir, "registries");
          if (fs.existsSync(planRegDir)) planRegistryCount = fs.readdirSync(planRegDir).filter((f) => f.endsWith(".json")).length;
          const covPath = path.join(planRegDir, "plan_coverage_rules.v1.json");
          if (fs.existsSync(covPath)) {
            const cr = JSON.parse(fs.readFileSync(covPath, "utf-8"));
            planCoverageRuleCount = cr.rules?.length ?? 0;
          }
        } catch {}
        return { docs: planDocCount, schemas: planSchemaCount, registries: planRegistryCount, coverageRules: planCoverageRuleCount };
      })(),
      verification_library: (() => {
        let verDocCount = 0, verSchemaCount = 0, verRegistryCount = 0, verProofTypeCount = 0;
        try {
          const verDir = path.join(AXION_ROOT, "libraries", "verification");
          if (fs.existsSync(verDir)) verDocCount = fs.readdirSync(verDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const verSchDir = path.join(verDir, "schemas");
          if (fs.existsSync(verSchDir)) verSchemaCount = fs.readdirSync(verSchDir).filter((f) => f.endsWith(".json")).length;
          const verRegDir = path.join(verDir, "registries");
          if (fs.existsSync(verRegDir)) verRegistryCount = fs.readdirSync(verRegDir).filter((f) => f.endsWith(".json")).length;
          const ptPath = path.join(verRegDir, "proof_types.v1.json");
          if (fs.existsSync(ptPath)) {
            const pt = JSON.parse(fs.readFileSync(ptPath, "utf-8"));
            verProofTypeCount = pt.types?.length ?? 0;
          }
        } catch {}
        return { docs: verDocCount, schemas: verSchemaCount, registries: verRegistryCount, proofTypes: verProofTypeCount };
      })(),
      kit_library: (() => {
        let kitDocCount = 0, kitSchemaCount = 0, kitRegistryCount = 0, kitGateCount = 0;
        try {
          const kitDir = path.join(AXION_ROOT, "libraries", "kit");
          if (fs.existsSync(kitDir)) kitDocCount = fs.readdirSync(kitDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const kitSchDir = path.join(kitDir, "schemas");
          if (fs.existsSync(kitSchDir)) kitSchemaCount = fs.readdirSync(kitSchDir).filter((f) => f.endsWith(".json")).length;
          const kitRegDir = path.join(kitDir, "registries");
          if (fs.existsSync(kitRegDir)) kitRegistryCount = fs.readdirSync(kitRegDir).filter((f) => f.endsWith(".json")).length;
          const gsPath = path.join(kitDir, "KIT-5_kit_gates.spec.json");
          if (fs.existsSync(gsPath)) {
            const gs = JSON.parse(fs.readFileSync(gsPath, "utf-8"));
            kitGateCount = gs.gates?.length ?? 0;
          }
        } catch {}
        return { docs: kitDocCount, schemas: kitSchemaCount, registries: kitRegistryCount, gates: kitGateCount };
      })(),
      telemetry_library: (() => {
        let telDocCount = 0, telSchemaCount = 0, telRegistryCount = 0, telGateCount = 0, telEventTypeCount = 0;
        try {
          const telDir = path.join(AXION_ROOT, "libraries", "telemetry");
          if (fs.existsSync(telDir)) telDocCount = fs.readdirSync(telDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const telSchDir = path.join(telDir, "schemas");
          if (fs.existsSync(telSchDir)) telSchemaCount = fs.readdirSync(telSchDir).filter((f) => f.endsWith(".json")).length;
          const telRegDir = path.join(telDir, "registries");
          if (fs.existsSync(telRegDir)) telRegistryCount = fs.readdirSync(telRegDir).filter((f) => f.endsWith(".json")).length;
          const gsPath = path.join(telDir, "TEL-5_telemetry_gates.spec.json");
          if (fs.existsSync(gsPath)) {
            const gs = JSON.parse(fs.readFileSync(gsPath, "utf-8"));
            telGateCount = gs.gates?.length ?? 0;
          }
          const etPath = path.join(telRegDir, "telemetry_event_types.v1.json");
          if (fs.existsSync(etPath)) {
            const et = JSON.parse(fs.readFileSync(etPath, "utf-8"));
            telEventTypeCount = et.types?.length ?? 0;
          }
        } catch {}
        return { docs: telDocCount, schemas: telSchemaCount, registries: telRegistryCount, gates: telGateCount, eventTypes: telEventTypeCount };
      })(),
      audit_library: (() => {
        let audDocCount = 0, audSchemaCount = 0, audRegistryCount = 0, audGateCount = 0, audActionTypeCount = 0;
        try {
          const audDir = path.join(AXION_ROOT, "libraries", "audit");
          if (fs.existsSync(audDir)) audDocCount = fs.readdirSync(audDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const audSchDir = path.join(audDir, "schemas");
          if (fs.existsSync(audSchDir)) audSchemaCount = fs.readdirSync(audSchDir).filter((f) => f.endsWith(".json")).length;
          const audRegDir = path.join(audDir, "registries");
          if (fs.existsSync(audRegDir)) audRegistryCount = fs.readdirSync(audRegDir).filter((f) => f.endsWith(".json")).length;
          const gsPath = path.join(audDir, "AUD-5_audit_gates.spec.json");
          if (fs.existsSync(gsPath)) {
            const gs = JSON.parse(fs.readFileSync(gsPath, "utf-8"));
            audGateCount = gs.gates?.length ?? 0;
          }
          const actionSchemaPath = path.join(audSchDir, "audit_action.v1.schema.json");
          if (fs.existsSync(actionSchemaPath)) {
            const as2 = JSON.parse(fs.readFileSync(actionSchemaPath, "utf-8"));
            audActionTypeCount = as2.properties?.action_type?.enum?.length ?? 0;
          }
        } catch {}
        return { docs: audDocCount, schemas: audSchemaCount, registries: audRegistryCount, gates: audGateCount, actionTypes: audActionTypeCount };
      })(),
      maintenance_library: (() => {
        let musDocCount = 0, musSchemaCount = 0, musRegistryCount = 0, musGateCount = 0, musModeCount = 0;
        try {
          const musDir = path.join(AXION_ROOT, "libraries", "maintenance");
          if (fs.existsSync(musDir)) musDocCount = fs.readdirSync(musDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).length;
          const musContractsDir = path.join(musDir, "contracts");
          if (fs.existsSync(musContractsDir)) musSchemaCount = fs.readdirSync(musContractsDir).filter((f) => f.endsWith(".json") && f !== "contract.meta.json").length;
          const musRegDir = path.join(musDir, "registries");
          if (fs.existsSync(musRegDir)) musRegistryCount = fs.readdirSync(musRegDir).filter((f) => f.endsWith(".json")).length;
          const gatesPath = path.join(musRegDir, "REG-GATES-MUS.json");
          if (fs.existsSync(gatesPath)) {
            const g = JSON.parse(fs.readFileSync(gatesPath, "utf-8"));
            musGateCount = g.items?.length ?? 0;
          }
          const modesPath = path.join(musRegDir, "REG-MAINTENANCE-MODES.json");
          if (fs.existsSync(modesPath)) {
            const m = JSON.parse(fs.readFileSync(modesPath, "utf-8"));
            musModeCount = m.items?.length ?? 0;
          }
        } catch {}
        return { docs: musDocCount, schemas: musSchemaCount, registries: musRegistryCount, gates: musGateCount, modes: musModeCount };
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
            } catch {}
          }
        }
      }

      const gateSpecPath = path.join(STANDARDS_LIB_DIR, "STD-5_standards_gates.spec.json");
      if (fs.existsSync(gateSpecPath)) {
        try {
          const gs = JSON.parse(fs.readFileSync(gateSpecPath, "utf-8"));
          gateCount = gs.gates?.length ?? 0;
        } catch {}
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
        } catch {}
      }

      const catOrderPath = path.join(registriesDir, "template_category_order.v1.json");
      if (fs.existsSync(catOrderPath)) {
        try {
          const co = JSON.parse(fs.readFileSync(catOrderPath, "utf-8"));
          categoryCount = co.order?.length ?? 0;
        } catch {}
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
        } catch {}
      }

      const covPath = path.join(registriesDir, "plan_coverage_rules.v1.json");
      if (fs.existsSync(covPath)) {
        try {
          const cr = JSON.parse(fs.readFileSync(covPath, "utf-8"));
          coverageRuleCount = cr.rules?.length ?? 0;
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
        } catch {}
      }

      const ptPath = path.join(registriesDir, "proof_types.v1.json");
      if (fs.existsSync(ptPath)) {
        try {
          const pt = JSON.parse(fs.readFileSync(ptPath, "utf-8"));
          proofTypeCount = pt.types?.length ?? 0;
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
        } catch {}
      }

      const efPath = path.join(registriesDir, "kit_export_filter.v1.json");
      if (fs.existsSync(efPath)) {
        try {
          const ef = JSON.parse(fs.readFileSync(efPath, "utf-8"));
          exportRuleCount = ef.rules?.length ?? 0;
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
        } catch {}
      }

      const etPath = path.join(registriesDir, "telemetry_event_types.v1.json");
      if (fs.existsSync(etPath)) {
        try {
          const et = JSON.parse(fs.readFileSync(etPath, "utf-8"));
          eventTypeCount = et.types?.length ?? 0;
        } catch {}
      }

      const spPath = path.join(registriesDir, "telemetry_sink_policy.v1.json");
      if (fs.existsSync(spPath)) {
        try {
          const sp = JSON.parse(fs.readFileSync(spPath, "utf-8"));
          sinkCount = sp.sinks?.length ?? 0;
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
        } catch {}
      }

      const actionSchemaPath = path.join(schemasDir, "audit_action.v1.schema.json");
      if (fs.existsSync(actionSchemaPath)) {
        try {
          const as2 = JSON.parse(fs.readFileSync(actionSchemaPath, "utf-8"));
          actionTypeCount = as2.properties?.action_type?.enum?.length ?? 0;
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
          try { policies.push(JSON.parse(fs.readFileSync(path.join(policiesDir, f), "utf-8"))); } catch {}
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
