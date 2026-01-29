import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRunSchema } from "@shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

    if (run.status === "running") {
      return res.status(409).json({ 
        error: "Pipeline is already running",
        code: "ALREADY_RUNNING"
      });
    }

    if (run.status === "bundled") {
      return res.json(run);
    }

    await storage.updateRun(run.id, { status: "running", currentStep: "init" });
    
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

    if (run.status !== "bundled" || !run.bundlePath) {
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
  const steps = [
    { name: "gen", script: "scripts/roshi-generate.mjs" },
    { name: "seed", script: "scripts/roshi-seed.mjs" },
    { name: "draft", script: "scripts/roshi-draft.mjs" },
    { name: "package", script: "scripts/roshi-package.mjs" }
  ];

  try {
    for (const step of steps) {
      await storage.updateRun(runId, { currentStep: step.name });
      
      await new Promise<void>((resolve, reject) => {
        const proc = spawn("node", [step.script], {
          env: { ...process.env, ROSHI_IDEA: idea, ROSHI_CONTEXT: context },
          cwd: process.cwd()
        });
        
        let stderr = "";
        proc.stderr.on("data", (data) => {
          stderr += data.toString();
        });
        
        proc.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Step ${step.name} failed: ${stderr}`));
          }
        });
        
        proc.on("error", reject);
      });
    }

    const bundlePath = "dist/roshi_bundle.zip";
    await storage.updateRun(runId, { 
      status: "bundled", 
      currentStep: "complete",
      bundlePath 
    });
  } catch (error) {
    await storage.updateRun(runId, { 
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
