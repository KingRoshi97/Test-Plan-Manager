import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRunSchema, type RunBundle } from "@shared/schema";
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
  
  app.get("/api/runs", async (req: Request, res: Response) => {
    const runs = await storage.getRuns();
    res.json(runs);
  });

  app.post("/api/runs", async (req: Request, res: Response) => {
    const parseResult = insertRunSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: parseResult.error.errors[0].message,
        code: "VALIDATION_ERROR"
      });
    }
    
    const run = await storage.createRun(parseResult.data);
    res.status(201).json(run);
  });

  app.get("/api/runs/:id", async (req: Request<{ id: string }>, res: Response) => {
    const run = await storage.getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }
    res.json(run);
  });

  app.post("/api/runs/:id/execute", async (req: Request<{ id: string }>, res: Response) => {
    const run = await storage.getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }

    if (run.state === "running") {
      return res.status(409).json({ 
        error: "Pipeline is already running",
        code: "ALREADY_RUNNING"
      });
    }

    if (run.state === "completed") {
      return res.json(run);
    }

    await storage.updateRun(run.id, { state: "running", step: "init" });
    
    executePipeline(run.id, run.idea, run.context || "");
    
    const updatedRun = await storage.getRun(run.id);
    res.json(updatedRun);
  });

  app.get("/api/runs/:id/download", async (req: Request<{ id: string }>, res: Response) => {
    const run = await storage.getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }

    if (run.state !== "completed" || !run.bundlePath) {
      return res.status(404).json({ 
        error: "Bundle not ready",
        code: "BUNDLE_NOT_READY"
      });
    }

    const bundlePath = path.resolve(run.bundlePath);
    if (!fs.existsSync(bundlePath)) {
      return res.status(404).json({ 
        error: "Bundle file not found",
        code: "FILE_NOT_FOUND"
      });
    }

    res.download(bundlePath, `roshi_bundle_${run.id.substring(0, 8)}.zip`);
  });

  app.delete("/api/runs/:id", async (req: Request<{ id: string }>, res: Response) => {
    const run = await storage.getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ 
        error: "Run not found",
        code: "NOT_FOUND"
      });
    }

    await storage.deleteRun(req.params.id);
    res.status(204).send();
  });

  return httpServer;
}

async function executePipeline(runId: string, idea: string, context: string) {
  try {
    const run = await storage.getRun(runId);
    if (!run) throw new Error("Run not found");
    
    await storage.updateRun(runId, { step: "init" });
    
    const workspaceConfig: WorkspaceConfig = {
      runId,
      projectName: run.projectName || "Untitled Project",
      idea,
      context: context || undefined,
      domains: run.domains || ["platform", "api", "web"],
    };
    
    console.log(`[Pipeline] Creating workspace for run ${runId}`);
    const workspacePath = await createWorkspace(workspaceConfig);
    
    await storage.updateRun(runId, { step: "gen" });
    console.log(`[Pipeline] Generating AI documentation...`);
    await populateWorkspaceWithAI(workspaceConfig, workspacePath);
    
    await storage.updateRun(runId, { step: "package" });
    console.log(`[Pipeline] Packaging bundle...`);
    
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("node", ["scripts/roshi-package-workspace.mjs", "--workspace", workspacePath], {
        env: { ...process.env, ROSHI_WORKSPACE: workspacePath },
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

    const bundlePath = path.join(workspacePath, "dist/roshi_bundle.zip");
    const manifestPath = path.join(workspacePath, "dist/roshi_bundle/manifest.json");
    const promptPath = path.join(workspacePath, "dist/roshi_bundle/agent_prompt.md");
    
    let bundle: RunBundle = {
      available: true,
      zipBytes: 0,
      zipSha256: null,
      manifestSha256: null,
      agentPromptSha256: null,
    };
    
    if (fs.existsSync(bundlePath)) {
      const zipBuffer = fs.readFileSync(bundlePath);
      bundle.zipBytes = zipBuffer.length;
      bundle.zipSha256 = computeSha256(zipBuffer);
    }
    
    if (fs.existsSync(manifestPath)) {
      bundle.manifestSha256 = computeSha256(fs.readFileSync(manifestPath));
    }
    
    if (fs.existsSync(promptPath)) {
      bundle.agentPromptSha256 = computeSha256(fs.readFileSync(promptPath));
    }
    
    await storage.updateRun(runId, { 
      state: "completed", 
      step: "package",
      bundle,
      bundlePath 
    });
    
    console.log(`[Pipeline] Run ${runId} completed successfully`);
  } catch (error) {
    console.error(`[Pipeline] Run ${runId} failed:`, error);
    await storage.updateRun(runId, { 
      state: "failed",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    });
  }
}
