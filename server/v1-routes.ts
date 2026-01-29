import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { createRunRequestSchema, createHandoffRequestSchema, type RunBundle, type RunInput, type CreateRunRequest, type UploadedFile } from "@shared/schema";
import { generateSignedUrl, validateSignature, computeSha256 } from "./signing";
import { processHandoff } from "./adapters";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { createWorkspace, populateWorkspaceWithAI, getWorkspacePath, type WorkspaceConfig } from "./workspace-manager";
import { upload, processUploadedFiles, combineExtractedText } from "./file-upload";

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

  app.post("/v1/upload", (req: Request, res: Response, next) => {
    upload.array("files", 5)(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return apiError(res, 400, "FILE_TOO_LARGE", "File size exceeds 10MB limit");
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return apiError(res, 400, "TOO_MANY_FILES", "Maximum 5 files allowed");
        }
        if (err.message?.includes("Unsupported file type")) {
          return apiError(res, 400, "INVALID_FILE_TYPE", err.message);
        }
        return apiError(res, 400, "UPLOAD_ERROR", err.message || "Upload failed");
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return apiError(res, 400, "NO_FILES", "No files uploaded");
      }
      
      const uploadedFiles = await processUploadedFiles(files);
      const combinedContext = combineExtractedText(uploadedFiles);
      
      res.json({
        files: uploadedFiles,
        combinedContext,
        totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0),
        totalExtractedLength: combinedContext.length,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return apiError(res, 500, "UPLOAD_ERROR", error instanceof Error ? error.message : "Upload failed");
    }
  });

  app.post("/v1/runs", async (req: Request, res: Response) => {
    const parseResult = createRunRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message, {
        field: parseResult.error.errors[0].path.join(".")
      });
    }
    
    const data = parseResult.data;
    
    const runInput = buildRunInput(data);
    
    const run = await storage.createRun({
      projectName: runInput.projectName,
      idea: runInput.legacy?.idea || runInput.description,
      context: data.context,
      preset: data.preset,
      domains: data.domains,
      input: runInput,
    });
    
    executePipelineV1(run.id, runInput);
    
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
        input: run.input || null,
        errors: run.errors || [],
        progress: run.progress || { percent: 0 },
        bundle: run.bundle || {
          available: false,
          generationMode: null,
          zipBytes: 0,
          zipSha256: null,
          manifestSha256: null,
          agentPromptSha256: null,
          inputSha256: null,
          aiContextSha256: null,
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
    let checksums = { 
      zipSha256: null as string | null, 
      manifestSha256: null as string | null, 
      agentPromptSha256: null as string | null,
      inputSha256: null as string | null,
      aiContextSha256: null as string | null,
    };
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
    
    const workspacePath = run.bundlePath?.replace("/dist/roshi_bundle.zip", "") || "";
    const inputPath = path.join(workspacePath, "handoff/input.json");
    const aiContextPath = path.join(workspacePath, "handoff/ai_context.json");
    
    if (fs.existsSync(inputPath)) {
      checksums.inputSha256 = computeSha256(fs.readFileSync(inputPath));
    }
    
    if (fs.existsSync(aiContextPath)) {
      checksums.aiContextSha256 = computeSha256(fs.readFileSync(aiContextPath));
    }
    
    const baseUrl = getBaseUrl(req);
    const signed = generateSignedUrl(
      `${baseUrl}/v1/runs/${run.id}/bundle.zip`,
      { runId: run.id, expiresInSeconds: 3600 }
    );
    
    res.json({
      runId: run.id,
      bundle: {
        bundleVersion: manifest?.bundleVersion || "0.2.0",
        createdAt: run.updatedAt.toISOString(),
        generationMode: manifest?.generationMode || "ai",
        inputSummary: manifest?.inputSummary || null,
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
  gen: 50,
  package: 100,
};

function buildRunInput(data: CreateRunRequest): RunInput {
  const baseInput = {
    uploadedFiles: data.uploadedFiles,
    uploadedContext: data.uploadedContext,
  };
  
  if (data.projectName && (data.features || data.users || data.description)) {
    return {
      projectName: data.projectName,
      description: data.description || "",
      features: data.features || [],
      users: data.users || [],
      techStack: data.techStack,
      preset: data.preset,
      legacy: data.idea ? { idea: data.idea, mappedFromIdea: false } : undefined,
      ...baseInput,
    };
  }
  
  if (data.idea) {
    const ideaText = data.idea;
    const projectName = data.projectName || "Untitled Project";
    const description = ideaText.length > 280 ? ideaText.slice(0, 280) + "..." : ideaText;
    
    return {
      projectName,
      description,
      features: [],
      users: [],
      techStack: data.techStack,
      preset: data.preset,
      legacy: {
        idea: ideaText,
        mappedFromIdea: true,
      },
      ...baseInput,
    };
  }
  
  return {
    projectName: data.projectName || "Untitled Project",
    description: data.description || "",
    features: data.features || [],
    users: data.users || [],
    techStack: data.techStack,
    preset: data.preset,
    ...baseInput,
  };
}

async function executePipelineV1(runId: string, input: RunInput) {
  try {
    await storage.updateRun(runId, { 
      state: "running", 
      step: "init",
      progress: { percent: stepProgress["init"] }
    });
    
    const run = await storage.getRun(runId);
    if (!run) throw new Error("Run not found");
    
    const workspaceConfig: WorkspaceConfig = {
      runId,
      projectName: input.projectName,
      idea: input.legacy?.idea || input.description,
      context: run.context || undefined,
      domains: run.domains || ["platform", "api", "web"],
    };
    
    console.log(`[v1 Pipeline] Creating workspace for run ${runId}`);
    const workspacePath = await createWorkspace(workspaceConfig);
    
    await storage.updateRun(runId, { 
      step: "gen",
      progress: { percent: stepProgress["gen"] }
    });
    
    console.log(`[v1 Pipeline] Generating AI documentation...`);
    await populateWorkspaceWithAI(workspaceConfig, workspacePath, input);
    
    await storage.updateRun(runId, { 
      step: "package",
      progress: { percent: stepProgress["package"] }
    });
    
    console.log(`[v1 Pipeline] Packaging bundle...`);
    
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
    const inputPath = path.join(workspacePath, "handoff/input.json");
    const aiContextPath = path.join(workspacePath, "handoff/ai_context.json");
    
    let bundle: RunBundle = {
      available: true,
      generationMode: "ai",
      zipBytes: 0,
      zipSha256: null,
      manifestSha256: null,
      agentPromptSha256: null,
      inputSha256: null,
      aiContextSha256: null,
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
    
    if (fs.existsSync(inputPath)) {
      bundle.inputSha256 = computeSha256(fs.readFileSync(inputPath));
    }
    
    if (fs.existsSync(aiContextPath)) {
      bundle.aiContextSha256 = computeSha256(fs.readFileSync(aiContextPath));
    }
    
    await storage.updateRun(runId, { 
      state: "completed", 
      step: "package",
      progress: { percent: 100 },
      bundle,
      bundlePath,
    });
    
    console.log(`[v1 Pipeline] Run ${runId} completed successfully`);
  } catch (error) {
    console.error(`[v1 Pipeline] Run ${runId} failed:`, error);
    await storage.updateRun(runId, { 
      state: "failed",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    });
  }
}
