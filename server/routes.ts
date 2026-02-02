import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssemblySchema, type Kit, type AssemblyCategory, type AssemblyMode } from "@shared/schema";
import { computeSha256 } from "./signing";
import { registerV1Routes } from "./v1-routes";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { createWorkspace, populateWorkspaceWithAI, getWorkspacePath, type WorkspaceConfig } from "./workspace-manager";
import { processDelivery } from "./adapters";
import { getPresets, getPresetById, getPresetsByCategory, getPresetsByCategoryAndMode, categoryLabels, modeLabels } from "./presets";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication (must be BEFORE other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  registerV1Routes(app);
  
  // === Presets API ===
  app.get("/api/presets", async (req: Request, res: Response) => {
    const { category, mode } = req.query;
    
    let presets;
    if (category && mode) {
      presets = getPresetsByCategoryAndMode(category as AssemblyCategory, mode as AssemblyMode);
    } else if (category) {
      presets = getPresetsByCategory(category as AssemblyCategory);
    } else {
      presets = getPresets();
    }
    
    res.json({
      presets,
      categories: categoryLabels,
      modes: modeLabels
    });
  });
  
  app.get("/api/presets/:id", async (req: Request<{ id: string }>, res: Response) => {
    const preset = getPresetById(req.params.id);
    if (!preset) {
      return res.status(404).json({ 
        error: "Preset not found",
        code: "NOT_FOUND"
      });
    }
    res.json(preset);
  });
  
  // === Legacy API routes with backward compatibility ===
  
  // New: /api/assemblies
  app.get("/api/assemblies", async (req: Request, res: Response) => {
    const assemblies = await storage.getAssemblies();
    res.json(assemblies);
  });

  app.post("/api/assemblies", async (req: Request, res: Response) => {
    const parseResult = insertAssemblySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: parseResult.error.errors[0].message,
        code: "VALIDATION_ERROR"
      });
    }
    
    const assembly = await storage.createAssembly(parseResult.data);
    res.status(201).json(assembly);
  });

  app.get("/api/assemblies/:id", async (req: Request<{ id: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Assembly not found",
        code: "NOT_FOUND"
      });
    }
    res.json(assembly);
  });

  app.post("/api/assemblies/:id/execute", async (req: Request<{ id: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Assembly not found",
        code: "NOT_FOUND"
      });
    }

    if (assembly.state === "running") {
      return res.status(409).json({ 
        error: "Pipeline is already running",
        code: "ALREADY_RUNNING"
      });
    }

    if (assembly.state === "completed") {
      return res.json(assembly);
    }

    await storage.updateAssembly(assembly.id, { state: "running", step: "init" });
    
    executePipeline(assembly.id, assembly.idea, assembly.context || "");
    
    const updatedAssembly = await storage.getAssembly(assembly.id);
    res.json(updatedAssembly);
  });

  app.get("/api/assemblies/:id/kit.zip", async (req: Request<{ id: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Assembly not found",
        code: "NOT_FOUND"
      });
    }

    if (assembly.state !== "completed" || !assembly.kitPath) {
      return res.status(404).json({ 
        error: "Kit not ready",
        code: "KIT_NOT_READY"
      });
    }

    const kitPath = path.resolve(assembly.kitPath);
    if (!fs.existsSync(kitPath)) {
      return res.status(404).json({ 
        error: "Kit file not found",
        code: "FILE_NOT_FOUND"
      });
    }

    res.download(kitPath, `axiom_kit_${assembly.id.substring(0, 8)}.zip`);
  });

  app.delete("/api/assemblies/:id", async (req: Request<{ id: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Assembly not found",
        code: "NOT_FOUND"
      });
    }

    await storage.deleteAssembly(req.params.id);
    res.status(204).send();
  });

  // Backward compatibility: /api/runs -> /api/assemblies
  app.get("/api/runs", async (req: Request, res: Response) => {
    res.set("Deprecation", "true");
    res.set("Sunset", "2026-03-01");
    const assemblies = await storage.getAssemblies();
    res.json(assemblies);
  });

  app.post("/api/runs", async (req: Request, res: Response) => {
    res.set("Deprecation", "true");
    res.set("Sunset", "2026-03-01");
    const parseResult = insertAssemblySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: parseResult.error.errors[0].message,
        code: "VALIDATION_ERROR"
      });
    }
    
    const assembly = await storage.createAssembly(parseResult.data);
    res.status(201).json(assembly);
  });

  app.get("/api/runs/:id", async (req: Request<{ id: string }>, res: Response) => {
    res.set("Deprecation", "true");
    res.set("Sunset", "2026-03-01");
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }
    res.json(assembly);
  });

  app.post("/api/runs/:id/execute", async (req: Request<{ id: string }>, res: Response) => {
    res.set("Deprecation", "true");
    res.set("Sunset", "2026-03-01");
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }

    if (assembly.state === "running") {
      return res.status(409).json({ 
        error: "Pipeline is already running",
        code: "ALREADY_RUNNING"
      });
    }

    if (assembly.state === "completed") {
      return res.json(assembly);
    }

    await storage.updateAssembly(assembly.id, { state: "running", step: "init" });
    
    executePipeline(assembly.id, assembly.idea, assembly.context || "");
    
    const updatedAssembly = await storage.getAssembly(assembly.id);
    res.json(updatedAssembly);
  });

  app.get("/api/runs/:id/download", async (req: Request<{ id: string }>, res: Response) => {
    res.set("Deprecation", "true");
    res.set("Sunset", "2026-03-01");
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }

    if (assembly.state !== "completed" || !assembly.kitPath) {
      return res.status(404).json({ 
        error: "Bundle not ready",
        code: "BUNDLE_NOT_READY"
      });
    }

    const kitPath = path.resolve(assembly.kitPath);
    if (!fs.existsSync(kitPath)) {
      return res.status(404).json({ 
        error: "Bundle file not found",
        code: "FILE_NOT_FOUND"
      });
    }

    res.download(kitPath, `axiom_kit_${assembly.id.substring(0, 8)}.zip`);
  });

  app.delete("/api/runs/:id", async (req: Request<{ id: string }>, res: Response) => {
    res.set("Deprecation", "true");
    res.set("Sunset", "2026-03-01");
    const assembly = await storage.getAssembly(req.params.id);
    if (!assembly) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }

    await storage.deleteAssembly(req.params.id);
    res.status(204).send();
  });

  return httpServer;
}

async function executePipeline(assemblyId: string, idea: string | null, context: string) {
  try {
    const assembly = await storage.getAssembly(assemblyId);
    if (!assembly) throw new Error("Assembly not found");
    
    await storage.updateAssembly(assemblyId, { step: "init" });
    
    const workspaceConfig: WorkspaceConfig = {
      assemblyId,
      projectName: assembly.projectName || "Untitled Project",
      idea: idea || "",
      context: context || undefined,
      domains: assembly.domains || ["platform", "api", "web", "uxui"],
    };
    
    console.log(`[Pipeline] Creating workspace for assembly ${assemblyId}`);
    const workspacePath = await createWorkspace(workspaceConfig);
    
    await storage.updateAssembly(assemblyId, { step: "gen" });
    console.log(`[Pipeline] Generating AI documentation...`);
    await populateWorkspaceWithAI(workspaceConfig, workspacePath);
    
    await storage.updateAssembly(assemblyId, { step: "package" });
    console.log(`[Pipeline] Packaging kit...`);
    
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("node", ["scripts/assembler-package-workspace.mjs", "--workspace", workspacePath], {
        env: { ...process.env, ASSEMBLER_WORKSPACE: workspacePath },
        cwd: process.cwd()
      });
      
      let stderr = "";
      let stdout = "";
      proc.stdout.on("data", (data) => {
        stdout += data.toString();
        console.log(data.toString());
      });
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Package step failed: ${stderr || stdout}`));
        }
      });
      
      proc.on("error", reject);
    });

    const kitPath = path.join(workspacePath, "dist/axiom_kit.zip");
    const manifestPath = path.join(workspacePath, "dist/axiom_kit/assembly_manifest.json");
    const promptPath = path.join(workspacePath, "dist/axiom_kit/agent_prompt.md");
    
    let kit: Kit = {
      available: true,
      zipBytes: 0,
      zipSha256: null,
      manifestSha256: null,
      agentPromptSha256: null,
    };
    
    if (fs.existsSync(kitPath)) {
      const zipBuffer = fs.readFileSync(kitPath);
      kit.zipBytes = zipBuffer.length;
      kit.zipSha256 = computeSha256(zipBuffer);
    }
    
    if (fs.existsSync(manifestPath)) {
      kit.manifestSha256 = computeSha256(fs.readFileSync(manifestPath));
    }
    
    if (fs.existsSync(promptPath)) {
      kit.agentPromptSha256 = computeSha256(fs.readFileSync(promptPath));
    }
    
    await storage.updateAssembly(assemblyId, { 
      state: "completed", 
      step: "package",
      kit,
      kitPath 
    });
    
    console.log(`[Pipeline] Assembly ${assemblyId} completed successfully`);
    
    // Auto-trigger any queued deliveries for this assembly
    triggerQueuedDeliveries(assemblyId).catch(err => {
      console.error(`[Pipeline] Failed to trigger queued deliveries:`, err);
    });
  } catch (error) {
    console.error(`[Pipeline] Assembly ${assemblyId} failed:`, error);
    await storage.updateAssembly(assemblyId, { 
      state: "failed",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    });
  }
}

// Trigger all queued deliveries for a completed assembly
async function triggerQueuedDeliveries(assemblyId: string): Promise<void> {
  const assembly = await storage.getAssembly(assemblyId);
  if (!assembly) return;

  // Auto-create delivery from wizard config if enabled
  const deliveryConfig = assembly.input?.delivery;
  if (deliveryConfig?.enabled && deliveryConfig.type) {
    try {
      console.log(`[Pipeline] Auto-creating ${deliveryConfig.type} delivery from wizard config`);
      let config: Record<string, unknown> = {};
      
      if (deliveryConfig.type === "pull") {
        config = {
          expiresInSeconds: 3600,
          includeInlineManifest: true,
          includeInlinePrompt: true,
        };
      } else if (deliveryConfig.type === "webhook") {
        config = {
          url: deliveryConfig.webhookUrl,
          secret: deliveryConfig.webhookSecret,
        };
      }
      
      await storage.createDelivery({
        assemblyId,
        type: deliveryConfig.type,
        config: config as any,
      });
    } catch (error) {
      console.error(`[Pipeline] Failed to auto-create delivery:`, error);
    }
  }

  const deliveries = await storage.getDeliveriesByAssemblyId(assemblyId);
  const queuedDeliveries = deliveries.filter((d: { state: string }) => d.state === "queued");
  
  if (queuedDeliveries.length === 0) {
    return;
  }
  
  console.log(`[Pipeline] Triggering ${queuedDeliveries.length} queued deliveries for assembly ${assemblyId}`);
  
  // Determine base URL - use REPLIT_DEV_DOMAIN in Replit, otherwise localhost
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:5000";
  
  for (const delivery of queuedDeliveries) {
    try {
      console.log(`[Pipeline] Processing delivery ${delivery.id} (${delivery.type})`);
      await processDelivery(delivery.id, baseUrl);
    } catch (error) {
      console.error(`[Pipeline] Failed to process delivery ${delivery.id}:`, error);
    }
  }
}
