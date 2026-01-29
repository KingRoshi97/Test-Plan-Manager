import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { createAssemblyRequestSchema, createDeliveryRequestSchema, type Kit, type AssemblyInput, type CreateAssemblyRequest, type UploadedFile } from "@shared/schema";
import { generateSignedUrl, validateSignature, computeSha256 } from "./signing";
import { processDelivery } from "./adapters";
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
    error: { code, message, details, reasonCode: `ASSEMBLER_${code}` }
  });
}

function addDeprecationHeaders(res: Response) {
  res.set("Deprecation", "true");
  res.set("Sunset", "2026-03-01");
}

export function registerV1Routes(app: Express) {
  
  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // === UPLOADS ===
  app.post("/v1/uploads", (req: Request, res: Response, next) => {
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

  // Backward compatibility: /v1/upload -> /v1/uploads
  app.post("/v1/upload", (req: Request, res: Response, next) => {
    addDeprecationHeaders(res);
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

  // === ASSEMBLIES (was runs) ===
  app.post("/v1/assemblies", async (req: Request, res: Response) => {
    const parseResult = createAssemblyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message, {
        field: parseResult.error.errors[0].path.join(".")
      });
    }
    
    const data = parseResult.data;
    
    const assemblyInput = buildAssemblyInput(data);
    
    const assembly = await storage.createAssembly({
      projectName: assemblyInput.projectName,
      idea: assemblyInput.legacy?.idea || assemblyInput.description,
      context: data.context,
      preset: data.preset,
      domains: data.domains,
      input: assemblyInput,
    });
    
    executePipelineV1(assembly.id, assemblyInput);
    
    res.status(202).json({
      assemblyId: assembly.id,
      state: assembly.state,
      statusUrl: `/v1/assemblies/${assembly.id}`
    });
  });

  // Backward compatibility: /v1/runs -> /v1/assemblies
  app.post("/v1/runs", async (req: Request, res: Response) => {
    addDeprecationHeaders(res);
    const parseResult = createAssemblyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message, {
        field: parseResult.error.errors[0].path.join(".")
      });
    }
    
    const data = parseResult.data;
    const assemblyInput = buildAssemblyInput(data);
    
    const assembly = await storage.createAssembly({
      projectName: assemblyInput.projectName,
      idea: assemblyInput.legacy?.idea || assemblyInput.description,
      context: data.context,
      preset: data.preset,
      domains: data.domains,
      input: assemblyInput,
    });
    
    executePipelineV1(assembly.id, assemblyInput);
    
    res.status(202).json({
      runId: assembly.id,
      state: assembly.state,
      statusUrl: `/v1/runs/${assembly.id}`
    });
  });

  app.get("/v1/assemblies/:assemblyId", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    res.json({
      assembly: {
        assemblyId: assembly.id,
        state: assembly.state,
        step: assembly.step,
        createdAt: assembly.createdAt.toISOString(),
        updatedAt: assembly.updatedAt.toISOString(),
        projectName: assembly.projectName,
        preset: assembly.preset,
        domains: assembly.domains,
        input: assembly.input || null,
        errors: assembly.errors || [],
        progress: assembly.progress || { percent: 0 },
        kit: assembly.kit || {
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
      logsTail: assembly.logsTail || ""
    });
  });

  // Backward compatibility: /v1/runs/:runId -> /v1/assemblies/:assemblyId
  app.get("/v1/runs/:runId", async (req: Request<{ runId: string }>, res: Response) => {
    addDeprecationHeaders(res);
    const assembly = await storage.getAssembly(req.params.runId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    res.json({
      run: {
        runId: assembly.id,
        state: assembly.state,
        step: assembly.step,
        createdAt: assembly.createdAt.toISOString(),
        updatedAt: assembly.updatedAt.toISOString(),
        projectName: assembly.projectName,
        preset: assembly.preset,
        domains: assembly.domains,
        input: assembly.input || null,
        errors: assembly.errors || [],
        progress: assembly.progress || { percent: 0 },
        bundle: assembly.kit || {
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
      logsTail: assembly.logsTail || ""
    });
  });

  // === KIT (was bundle) ===
  app.get("/v1/assemblies/:assemblyId/kit", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    if (assembly.state !== "completed") {
      return res.json({
        assemblyId: assembly.id,
        kit: {
          available: false,
          message: `Assembly is ${assembly.state}, not completed yet`
        }
      });
    }
    
    const kitPath = assembly.kitPath || "dist/axiom_kit.zip";
    const manifestPath = kitPath.replace(".zip", "/assembly_manifest.json");
    const promptPath = kitPath.replace(".zip", "/agent_prompt.md");
    
    let manifest = null;
    let checksums = { 
      zipSha256: null as string | null, 
      manifestSha256: null as string | null, 
      agentPromptSha256: null as string | null,
      inputSha256: null as string | null,
      aiContextSha256: null as string | null,
    };
    let sizes = { zipBytes: 0 };
    
    if (fs.existsSync(kitPath)) {
      const zipBuffer = fs.readFileSync(kitPath);
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
    
    const workspacePath = assembly.kitPath?.replace("/dist/axiom_kit.zip", "") || "";
    const inputPath = path.join(workspacePath, "delivery/input.json");
    const aiContextPath = path.join(workspacePath, "delivery/ai_context.json");
    
    if (fs.existsSync(inputPath)) {
      checksums.inputSha256 = computeSha256(fs.readFileSync(inputPath));
    }
    
    if (fs.existsSync(aiContextPath)) {
      checksums.aiContextSha256 = computeSha256(fs.readFileSync(aiContextPath));
    }
    
    const baseUrl = getBaseUrl(req);
    const signed = generateSignedUrl(
      `${baseUrl}/v1/assemblies/${assembly.id}/kit.zip`,
      { assemblyId: assembly.id, expiresInSeconds: 3600 }
    );
    
    res.json({
      assemblyId: assembly.id,
      kit: {
        kitVersion: manifest?.kitVersion || manifest?.bundleVersion || "0.2.0",
        createdAt: assembly.updatedAt.toISOString(),
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

  // Backward compatibility: /v1/runs/:runId/bundle -> /v1/assemblies/:assemblyId/kit
  app.get("/v1/runs/:runId/bundle", async (req: Request<{ runId: string }>, res: Response) => {
    addDeprecationHeaders(res);
    const assembly = await storage.getAssembly(req.params.runId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    if (assembly.state !== "completed") {
      return res.json({
        runId: assembly.id,
        bundle: {
          available: false,
          message: `Run is ${assembly.state}, not completed yet`
        }
      });
    }
    
    const kitPath = assembly.kitPath || "dist/axiom_kit.zip";
    const manifestPath = kitPath.replace(".zip", "/assembly_manifest.json");
    const promptPath = kitPath.replace(".zip", "/agent_prompt.md");
    
    let manifest = null;
    let checksums = { 
      zipSha256: null as string | null, 
      manifestSha256: null as string | null, 
      agentPromptSha256: null as string | null,
      inputSha256: null as string | null,
      aiContextSha256: null as string | null,
    };
    let sizes = { zipBytes: 0 };
    
    if (fs.existsSync(kitPath)) {
      const zipBuffer = fs.readFileSync(kitPath);
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
    
    const workspacePath = assembly.kitPath?.replace("/dist/axiom_kit.zip", "") || "";
    const inputPath = path.join(workspacePath, "delivery/input.json");
    const aiContextPath = path.join(workspacePath, "delivery/ai_context.json");
    
    if (fs.existsSync(inputPath)) {
      checksums.inputSha256 = computeSha256(fs.readFileSync(inputPath));
    }
    
    if (fs.existsSync(aiContextPath)) {
      checksums.aiContextSha256 = computeSha256(fs.readFileSync(aiContextPath));
    }
    
    const baseUrl = getBaseUrl(req);
    const signed = generateSignedUrl(
      `${baseUrl}/v1/runs/${assembly.id}/bundle.zip`,
      { assemblyId: assembly.id, expiresInSeconds: 3600 }
    );
    
    res.json({
      runId: assembly.id,
      bundle: {
        bundleVersion: manifest?.bundleVersion || "0.2.0",
        createdAt: assembly.updatedAt.toISOString(),
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

  app.get("/v1/assemblies/:assemblyId/kit.zip", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const { assemblyId } = req.params;
    const { exp, sig } = req.query;
    
    if (exp && sig) {
      const validation = validateSignature(assemblyId, exp as string, sig as string);
      if (!validation.valid) {
        return apiError(res, 401, "INVALID_SIGNATURE", validation.error || "Invalid signature");
      }
    }
    
    const assembly = await storage.getAssembly(assemblyId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    if (assembly.state !== "completed" || !assembly.kitPath) {
      return apiError(res, 404, "KIT_NOT_READY", "Kit not ready");
    }
    
    const kitPath = path.resolve(assembly.kitPath);
    if (!fs.existsSync(kitPath)) {
      return apiError(res, 404, "FILE_NOT_FOUND", "Kit file not found");
    }
    
    res.download(kitPath, `axiom_kit_${assembly.id}.zip`);
  });

  // Backward compatibility: /v1/runs/:runId/bundle.zip -> /v1/assemblies/:assemblyId/kit.zip
  app.get("/v1/runs/:runId/bundle.zip", async (req: Request<{ runId: string }>, res: Response) => {
    addDeprecationHeaders(res);
    const { runId } = req.params;
    const { exp, sig } = req.query;
    
    if (exp && sig) {
      const validation = validateSignature(runId, exp as string, sig as string);
      if (!validation.valid) {
        return apiError(res, 401, "INVALID_SIGNATURE", validation.error || "Invalid signature");
      }
    }
    
    const assembly = await storage.getAssembly(runId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    if (assembly.state !== "completed" || !assembly.kitPath) {
      return apiError(res, 404, "BUNDLE_NOT_READY", "Bundle not ready");
    }
    
    const kitPath = path.resolve(assembly.kitPath);
    if (!fs.existsSync(kitPath)) {
      return apiError(res, 404, "FILE_NOT_FOUND", "Bundle file not found");
    }
    
    res.download(kitPath, `axiom_kit_${assembly.id}.zip`);
  });

  // === DELIVERIES (was handoffs) ===
  app.post("/v1/assemblies/:assemblyId/deliveries", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    const parseResult = createDeliveryRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message);
    }
    
    const delivery = await storage.createDelivery({
      assemblyId: assembly.id,
      type: parseResult.data.type,
      label: parseResult.data.label,
      config: parseResult.data.config,
    });
    
    const baseUrl = getBaseUrl(req);
    const processed = await processDelivery(delivery.id, baseUrl);
    
    const updatedDelivery = processed.delivery || delivery;
    
    res.status(201).json({
      delivery: {
        deliveryId: updatedDelivery.id,
        assemblyId: updatedDelivery.assemblyId,
        type: updatedDelivery.type,
        label: updatedDelivery.label,
        state: updatedDelivery.state,
        attempts: updatedDelivery.attempts,
        maxAttempts: updatedDelivery.maxAttempts,
        lastAttemptAt: updatedDelivery.lastAttemptAt?.toISOString() || null,
        result: updatedDelivery.result,
        lastError: updatedDelivery.lastError,
        createdAt: updatedDelivery.createdAt.toISOString(),
        updatedAt: updatedDelivery.updatedAt.toISOString(),
      }
    });
  });

  // Backward compatibility: /v1/runs/:runId/handoffs -> /v1/assemblies/:assemblyId/deliveries
  app.post("/v1/runs/:runId/handoffs", async (req: Request<{ runId: string }>, res: Response) => {
    addDeprecationHeaders(res);
    const assembly = await storage.getAssembly(req.params.runId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    const parseResult = createDeliveryRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message);
    }
    
    const delivery = await storage.createDelivery({
      assemblyId: assembly.id,
      type: parseResult.data.type,
      label: parseResult.data.label,
      config: parseResult.data.config,
    });
    
    const baseUrl = getBaseUrl(req);
    const processed = await processDelivery(delivery.id, baseUrl);
    
    const updatedDelivery = processed.delivery || delivery;
    
    res.status(201).json({
      handoff: {
        handoffId: updatedDelivery.id,
        runId: updatedDelivery.assemblyId,
        type: updatedDelivery.type,
        label: updatedDelivery.label,
        state: updatedDelivery.state,
        attempts: updatedDelivery.attempts,
        maxAttempts: updatedDelivery.maxAttempts,
        lastAttemptAt: updatedDelivery.lastAttemptAt?.toISOString() || null,
        result: updatedDelivery.result,
        lastError: updatedDelivery.lastError,
        createdAt: updatedDelivery.createdAt.toISOString(),
        updatedAt: updatedDelivery.updatedAt.toISOString(),
      }
    });
  });

  app.get("/v1/assemblies/:assemblyId/deliveries", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    const deliveries = await storage.getDeliveriesByAssemblyId(assembly.id);
    
    res.json({
      assemblyId: assembly.id,
      deliveries: deliveries.map(d => ({
        deliveryId: d.id,
        assemblyId: d.assemblyId,
        type: d.type,
        label: d.label,
        state: d.state,
        attempts: d.attempts,
        maxAttempts: d.maxAttempts,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      }))
    });
  });

  // Backward compatibility: /v1/runs/:runId/handoffs -> /v1/assemblies/:assemblyId/deliveries
  app.get("/v1/runs/:runId/handoffs", async (req: Request<{ runId: string }>, res: Response) => {
    addDeprecationHeaders(res);
    const assembly = await storage.getAssembly(req.params.runId);
    if (!assembly) {
      return apiError(res, 404, "NOT_FOUND", "Run not found");
    }
    
    const deliveries = await storage.getDeliveriesByAssemblyId(assembly.id);
    
    res.json({
      runId: assembly.id,
      handoffs: deliveries.map(d => ({
        handoffId: d.id,
        runId: d.assemblyId,
        type: d.type,
        label: d.label,
        state: d.state,
        attempts: d.attempts,
        maxAttempts: d.maxAttempts,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      }))
    });
  });

  app.get("/v1/deliveries/:deliveryId", async (req: Request<{ deliveryId: string }>, res: Response) => {
    const delivery = await storage.getDelivery(req.params.deliveryId);
    if (!delivery) {
      return apiError(res, 404, "NOT_FOUND", "Delivery not found");
    }
    
    res.json({
      delivery: {
        deliveryId: delivery.id,
        assemblyId: delivery.assemblyId,
        type: delivery.type,
        label: delivery.label,
        state: delivery.state,
        attempts: delivery.attempts,
        maxAttempts: delivery.maxAttempts,
        lastAttemptAt: delivery.lastAttemptAt?.toISOString() || null,
        result: delivery.result,
        lastError: delivery.lastError,
        createdAt: delivery.createdAt.toISOString(),
        updatedAt: delivery.updatedAt.toISOString(),
      },
      attemptHistory: delivery.attemptHistory || []
    });
  });

  // Backward compatibility: /v1/handoffs/:handoffId -> /v1/deliveries/:deliveryId
  app.get("/v1/handoffs/:handoffId", async (req: Request<{ handoffId: string }>, res: Response) => {
    addDeprecationHeaders(res);
    const delivery = await storage.getDelivery(req.params.handoffId);
    if (!delivery) {
      return apiError(res, 404, "NOT_FOUND", "Handoff not found");
    }
    
    res.json({
      handoff: {
        handoffId: delivery.id,
        runId: delivery.assemblyId,
        type: delivery.type,
        label: delivery.label,
        state: delivery.state,
        attempts: delivery.attempts,
        maxAttempts: delivery.maxAttempts,
        lastAttemptAt: delivery.lastAttemptAt?.toISOString() || null,
        result: delivery.result,
        lastError: delivery.lastError,
        createdAt: delivery.createdAt.toISOString(),
        updatedAt: delivery.updatedAt.toISOString(),
      },
      attemptHistory: delivery.attemptHistory || []
    });
  });

  app.post("/v1/deliveries/:deliveryId/retry", async (req: Request<{ deliveryId: string }>, res: Response) => {
    const delivery = await storage.getDelivery(req.params.deliveryId);
    if (!delivery) {
      return apiError(res, 404, "NOT_FOUND", "Delivery not found");
    }
    
    if (delivery.state === "completed") {
      return apiError(res, 409, "ALREADY_COMPLETED", "Delivery already completed");
    }
    
    if (delivery.attempts >= delivery.maxAttempts) {
      return apiError(res, 409, "MAX_ATTEMPTS_REACHED", "Maximum attempts reached");
    }
    
    const baseUrl = getBaseUrl(req);
    const processed = await processDelivery(delivery.id, baseUrl);
    
    res.json({ ok: processed.success, deliveryId: delivery.id });
  });

  // Backward compatibility: /v1/handoffs/:handoffId/retry -> /v1/deliveries/:deliveryId/retry
  app.post("/v1/handoffs/:handoffId/retry", async (req: Request<{ handoffId: string }>, res: Response) => {
    addDeprecationHeaders(res);
    const delivery = await storage.getDelivery(req.params.handoffId);
    if (!delivery) {
      return apiError(res, 404, "NOT_FOUND", "Handoff not found");
    }
    
    if (delivery.state === "completed") {
      return apiError(res, 409, "ALREADY_COMPLETED", "Handoff already completed");
    }
    
    if (delivery.attempts >= delivery.maxAttempts) {
      return apiError(res, 409, "MAX_ATTEMPTS_REACHED", "Maximum attempts reached");
    }
    
    const baseUrl = getBaseUrl(req);
    const processed = await processDelivery(delivery.id, baseUrl);
    
    res.json({ ok: processed.success, handoffId: delivery.id });
  });
}

const stepProgress: Record<string, number> = {
  init: 10,
  gen: 50,
  package: 100,
};

function buildAssemblyInput(data: CreateAssemblyRequest): AssemblyInput {
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

async function executePipelineV1(assemblyId: string, input: AssemblyInput) {
  try {
    await storage.updateAssembly(assemblyId, { 
      state: "running", 
      step: "init",
      progress: { percent: stepProgress["init"] }
    });
    
    const assembly = await storage.getAssembly(assemblyId);
    if (!assembly) throw new Error("Assembly not found");
    
    const workspaceConfig: WorkspaceConfig = {
      assemblyId,
      projectName: input.projectName,
      idea: input.legacy?.idea || input.description,
      context: assembly.context || undefined,
      domains: assembly.domains || ["platform", "api", "web"],
    };
    
    console.log(`[Assembler Pipeline] Creating workspace for assembly ${assemblyId}`);
    const workspacePath = await createWorkspace(workspaceConfig);
    
    await storage.updateAssembly(assemblyId, { 
      step: "gen",
      progress: { percent: stepProgress["gen"] }
    });
    
    console.log(`[Assembler Pipeline] Generating AI documentation...`);
    await populateWorkspaceWithAI(workspaceConfig, workspacePath, input);
    
    await storage.updateAssembly(assemblyId, { 
      step: "package",
      progress: { percent: stepProgress["package"] }
    });
    
    console.log(`[Assembler Pipeline] Packaging kit...`);
    
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
    const inputPath = path.join(workspacePath, "delivery/input.json");
    const aiContextPath = path.join(workspacePath, "delivery/ai_context.json");
    
    let kit: Kit = {
      available: true,
      generationMode: "ai",
      zipBytes: 0,
      zipSha256: null,
      manifestSha256: null,
      agentPromptSha256: null,
      inputSha256: null,
      aiContextSha256: null,
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
    
    if (fs.existsSync(inputPath)) {
      kit.inputSha256 = computeSha256(fs.readFileSync(inputPath));
    }
    
    if (fs.existsSync(aiContextPath)) {
      kit.aiContextSha256 = computeSha256(fs.readFileSync(aiContextPath));
    }
    
    await storage.updateAssembly(assemblyId, { 
      state: "completed", 
      step: "package",
      progress: { percent: 100 },
      kit,
      kitPath,
    });
    
    console.log(`[Assembler Pipeline] Assembly ${assemblyId} completed successfully`);
  } catch (error) {
    console.error(`[Assembler Pipeline] Assembly ${assemblyId} failed:`, error);
    await storage.updateAssembly(assemblyId, { 
      state: "failed",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    });
  }
}
