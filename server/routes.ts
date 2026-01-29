import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssemblySchema, type Kit } from "@shared/schema";
import { computeSha256 } from "./signing";
import { registerV1Routes } from "./v1-routes";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { createWorkspace, populateWorkspaceWithAI, getWorkspacePath, type WorkspaceConfig } from "./workspace-manager";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerV1Routes(app);
  
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
      domains: assembly.domains || ["platform", "api", "web"],
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
  } catch (error) {
    console.error(`[Pipeline] Assembly ${assemblyId} failed:`, error);
    await storage.updateAssembly(assemblyId, { 
      state: "failed",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    });
  }
}
