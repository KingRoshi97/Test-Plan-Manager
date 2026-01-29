import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertRunSchema, createHandoffRequestSchema, type RunBundle } from "@shared/schema";
import { generateSignedUrl, validateSignature, computeSha256 } from "./signing";
import { processHandoff } from "./adapters";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

function getBaseUrl(req: Request): string {
  const protocol = req.protocol;
  const host = req.get("host") || "localhost:5000";
  return `${protocol}://${host}`;
}

function apiError(res: Response, status: number, code: string, message: string, details?: object) {
  return res.status(status).json({
    error: { code, message, details, reasonCode: `ROSHI_${code}` }
  });
}

export function registerV1Routes(app: Express) {
  
  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/v1/runs", async (req: Request, res: Response) => {
    const parseResult = insertRunSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message, {
        field: parseResult.error.errors[0].path.join(".")
      });
    }
    
    const run = await storage.createRun(parseResult.data);
    
    executePipeline(run.id, run.idea, run.context || "", run.projectName || undefined);
    
    res.status(202).json({
      runId: run.id,
      state: run.state,
      statusUrl: `/v1/runs/${run.id}`
    });
  });

  app.get("/v1/runs/:runId", async (req: Request<{ runId: string }>, res: Response) => {
    const run = await storage.getRun(req.params.runId);
    if (!run) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    res.json({
      run: {
        runId: run.id,
        state: run.state,
        step: run.step,
        createdAt: run.createdAt.toISOString(),
        updatedAt: run.updatedAt.toISOString(),
        projectName: run.projectName,
        preset: run.preset,
        domains: run.domains,
        errors: run.errors || [],
        progress: run.progress || { percent: 0 },
        bundle: run.bundle || {
          available: false,
          zipBytes: 0,
          zipSha256: null,
          manifestSha256: null,
          agentPromptSha256: null,
        }
      },
      logsTail: run.logsTail || ""
    });
  });

  app.get("/v1/runs/:runId/bundle", async (req: Request<{ runId: string }>, res: Response) => {
    const run = await storage.getRun(req.params.runId);
    if (!run) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    if (run.state !== "completed") {
      return res.json({
        runId: run.id,
        bundle: {
          available: false,
          message: `Run is ${run.state}, not completed yet`
        }
      });
    }
    
    const bundlePath = run.bundlePath || "dist/roshi_bundle.zip";
    const manifestPath = "dist/roshi_bundle/manifest.json";
    const promptPath = "dist/roshi_bundle/agent_prompt.md";
    
    let manifest = null;
    let checksums = { zipSha256: null as string | null, manifestSha256: null as string | null, agentPromptSha256: null as string | null };
    let sizes = { zipBytes: 0 };
    
    if (fs.existsSync(bundlePath)) {
      const zipBuffer = fs.readFileSync(bundlePath);
      checksums.zipSha256 = computeSha256(zipBuffer);
      sizes.zipBytes = zipBuffer.length;
    }
    
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(manifestContent);
      checksums.manifestSha256 = computeSha256(manifestContent);
    }
    
    if (fs.existsSync(promptPath)) {
      const promptContent = fs.readFileSync(promptPath, "utf-8");
      checksums.agentPromptSha256 = computeSha256(promptContent);
    }
    
    const baseUrl = getBaseUrl(req);
    const signed = generateSignedUrl(
      `${baseUrl}/v1/runs/${run.id}/bundle.zip`,
      { runId: run.id, expiresInSeconds: 3600 }
    );
    
    res.json({
      runId: run.id,
      bundle: {
        bundleVersion: manifest?.bundleVersion || "0.1.0",
        createdAt: run.updatedAt.toISOString(),
        entryDocs: manifest?.entryDocs || [],
        commandsToRun: manifest?.commandsToRun || [],
        doNotTouch: manifest?.doNotTouch || [],
        openQuestions: manifest?.openQuestions || { count: 0, paths: [] },
        implementationPlan: manifest?.implementationPlan || [],
        checksums,
        sizes,
        download: {
          zipUrl: signed.url,
          expiresAt: signed.expiresAt
        }
      }
    });
  });

  app.get("/v1/runs/:runId/bundle.zip", async (req: Request<{ runId: string }>, res: Response) => {
    const { runId } = req.params;
    const { exp, sig } = req.query;
    
    if (exp && sig) {
      const validation = validateSignature(runId, exp as string, sig as string);
      if (!validation.valid) {
        return apiError(res, 401, "INVALID_SIGNATURE", validation.error || "Invalid signature");
      }
    }
    
    const run = await storage.getRun(runId);
    if (!run) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    if (run.state !== "completed" || !run.bundlePath) {
      return apiError(res, 404, "BUNDLE_NOT_READY", "Bundle not ready");
    }
    
    const bundlePath = path.resolve(run.bundlePath);
    if (!fs.existsSync(bundlePath)) {
      return apiError(res, 404, "FILE_NOT_FOUND", "Bundle file not found");
    }
    
    res.download(bundlePath, `roshi_bundle_${run.id}.zip`);
  });

  app.post("/v1/runs/:runId/handoffs", async (req: Request<{ runId: string }>, res: Response) => {
    const run = await storage.getRun(req.params.runId);
    if (!run) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    const parseResult = createHandoffRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message);
    }
    
    const handoff = await storage.createHandoff({
      runId: run.id,
      type: parseResult.data.type,
      label: parseResult.data.label,
      config: parseResult.data.config,
    });
    
    const baseUrl = getBaseUrl(req);
    const processed = await processHandoff(handoff.id, baseUrl);
    
    const updatedHandoff = processed.handoff || handoff;
    
    res.status(201).json({
      handoff: {
        handoffId: updatedHandoff.id,
        runId: updatedHandoff.runId,
        type: updatedHandoff.type,
        label: updatedHandoff.label,
        state: updatedHandoff.state,
        attempts: updatedHandoff.attempts,
        maxAttempts: updatedHandoff.maxAttempts,
        lastAttemptAt: updatedHandoff.lastAttemptAt?.toISOString() || null,
        result: updatedHandoff.result,
        lastError: updatedHandoff.lastError,
        createdAt: updatedHandoff.createdAt.toISOString(),
        updatedAt: updatedHandoff.updatedAt.toISOString(),
      }
    });
  });

  app.get("/v1/runs/:runId/handoffs", async (req: Request<{ runId: string }>, res: Response) => {
    const run = await storage.getRun(req.params.runId);
    if (!run) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    const handoffs = await storage.getHandoffsByRunId(run.id);
    
    res.json({
      runId: run.id,
      handoffs: handoffs.map(h => ({
        handoffId: h.id,
        runId: h.runId,
        type: h.type,
        label: h.label,
        state: h.state,
        attempts: h.attempts,
        maxAttempts: h.maxAttempts,
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
      }))
    });
  });

  app.get("/v1/handoffs/:handoffId", async (req: Request<{ handoffId: string }>, res: Response) => {
    const handoff = await storage.getHandoff(req.params.handoffId);
    if (!handoff) {
      return apiError(res, 404, "NOT_FOUND", "Handoff not found");
    }
    
    res.json({
      handoff: {
        handoffId: handoff.id,
        runId: handoff.runId,
        type: handoff.type,
        label: handoff.label,
        state: handoff.state,
        attempts: handoff.attempts,
        maxAttempts: handoff.maxAttempts,
        lastAttemptAt: handoff.lastAttemptAt?.toISOString() || null,
        result: handoff.result,
        lastError: handoff.lastError,
        createdAt: handoff.createdAt.toISOString(),
        updatedAt: handoff.updatedAt.toISOString(),
      },
      attemptHistory: handoff.attemptHistory || []
    });
  });

  app.post("/v1/handoffs/:handoffId/retry", async (req: Request<{ handoffId: string }>, res: Response) => {
    const handoff = await storage.getHandoff(req.params.handoffId);
    if (!handoff) {
      return apiError(res, 404, "NOT_FOUND", "Handoff not found");
    }
    
    if (handoff.state === "completed") {
      return apiError(res, 409, "ALREADY_COMPLETED", "Handoff already completed");
    }
    
    if (handoff.attempts >= handoff.maxAttempts) {
      return apiError(res, 409, "MAX_ATTEMPTS_REACHED", "Maximum attempts reached");
    }
    
    const baseUrl = getBaseUrl(req);
    const processed = await processHandoff(handoff.id, baseUrl);
    
    res.json({ ok: processed.success, handoffId: handoff.id });
  });
}

const stepProgress: Record<string, number> = {
  init: 10,
  gen: 25,
  seed: 40,
  draft: 55,
  review: 70,
  verify: 80,
  lock: 90,
  package: 100,
};

async function executePipeline(runId: string, idea: string, context: string, projectName?: string) {
  const steps = [
    { name: "gen", script: "scripts/roshi-generate.mjs" },
    { name: "seed", script: "scripts/roshi-seed.mjs" },
    { name: "draft", script: "scripts/roshi-draft.mjs" },
    { name: "package", script: "scripts/roshi-package.mjs" }
  ];

  try {
    await storage.updateRun(runId, { 
      state: "running", 
      step: "init",
      progress: { percent: stepProgress["init"] }
    });
    
    for (const step of steps) {
      await storage.updateRun(runId, { 
        step: step.name as any,
        progress: { percent: stepProgress[step.name] || 50 }
      });
      
      await new Promise<void>((resolve, reject) => {
        const proc = spawn("node", [step.script], {
          env: { ...process.env, ROSHI_IDEA: idea, ROSHI_CONTEXT: context },
          cwd: process.cwd()
        });
        
        let stderr = "";
        let stdout = "";
        
        proc.stdout.on("data", (data) => {
          stdout += data.toString();
        });
        
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
    const manifestPath = "dist/roshi_bundle/manifest.json";
    const promptPath = "dist/roshi_bundle/agent_prompt.md";
    
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
      progress: { percent: 100 },
      bundle,
      bundlePath,
    });
  } catch (error) {
    await storage.updateRun(runId, { 
      state: "failed",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    });
  }
}
