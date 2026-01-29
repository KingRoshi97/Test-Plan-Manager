import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { createAssemblyRequestSchema, createDeliveryRequestSchema, createUpgradeRequestSchema, type Kit, type AssemblyInput, type CreateAssemblyRequest, type UploadedFile, type UpgradeArtifact } from "@shared/schema";
import { generateSignedUrl, validateSignature, computeSha256 } from "./signing";
import { processDelivery } from "./adapters";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { createWorkspace, populateWorkspaceWithAI, getWorkspacePath, type WorkspaceConfig } from "./workspace-manager";
import { upload, processUploadedFiles, combineExtractedText } from "./file-upload";
import { registerHandler, enqueue } from "./jobs/queue";
import { scanAndIndexProjectPackage } from "./jobs/scan-index-package";
import { writeFile, writeText, readText, getProjectPackagePath, getKitUpgradePath, fileExists as storageFileExists } from "./file-storage";
import crypto from "crypto";

registerHandler("scanAndIndexProjectPackage", scanAndIndexProjectPackage);

function getBaseUrl(req: Request): string {
  const protocol = req.protocol;
  const host = req.get("host") || "localhost:5000";
  return `${protocol}://${host}`;
}

function apiError(req: Request, res: Response, status: number, code: string, message: string, details?: object) {
  return res.status(status).json({
    error: { 
      code: `ASSEMBLER_${code}`, 
      message, 
      details,
      correlationId: req.correlationId,
    }
  });
}

function addDeprecationHeaders(res: Response) {
  res.set("Deprecation", "true");
  res.set("Sunset", "2026-03-01");
}

export function registerV1Routes(app: Express) {
  
  app.get("/health", (req: Request, res: Response) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    });
  });

  app.get("/v1/health", (req: Request, res: Response) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    });
  });

  app.get("/v1/meta", (req: Request, res: Response) => {
    res.json({
      apiVersion: "1.0.0",
      bundleVersion: "0.2.0",
      supportedDeliveryTypes: ["webhook", "pull", "git", "manual"],
      maxUploadSizeBytes: 10 * 1024 * 1024,
      maxUploadFiles: 5,
      signatureAlgo: "HMAC-SHA256",
      correlationId: req.correlationId,
    });
  });

  // === UPLOADS ===
  app.post("/v1/uploads", (req: Request, res: Response, next) => {
    upload.array("files", 5)(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return apiError(req, res, 400, "FILE_TOO_LARGE", "File size exceeds 10MB limit");
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return apiError(req, res, 400, "TOO_MANY_FILES", "Maximum 5 files allowed");
        }
        if (err.message?.includes("Unsupported file type")) {
          return apiError(req, res, 400, "INVALID_FILE_TYPE", err.message);
        }
        return apiError(req, res, 400, "UPLOAD_ERROR", err.message || "Upload failed");
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return apiError(req, res, 400, "NO_FILES", "No files uploaded");
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
      return apiError(req, res, 500, "UPLOAD_ERROR", error instanceof Error ? error.message : "Upload failed");
    }
  });

  // Backward compatibility: /v1/upload -> /v1/uploads
  app.post("/v1/upload", (req: Request, res: Response, next) => {
    addDeprecationHeaders(res);
    upload.array("files", 5)(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return apiError(req, res, 400, "FILE_TOO_LARGE", "File size exceeds 10MB limit");
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return apiError(req, res, 400, "TOO_MANY_FILES", "Maximum 5 files allowed");
        }
        if (err.message?.includes("Unsupported file type")) {
          return apiError(req, res, 400, "INVALID_FILE_TYPE", err.message);
        }
        return apiError(req, res, 400, "UPLOAD_ERROR", err.message || "Upload failed");
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return apiError(req, res, 400, "NO_FILES", "No files uploaded");
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
      return apiError(req, res, 500, "UPLOAD_ERROR", error instanceof Error ? error.message : "Upload failed");
    }
  });

  // === ASSEMBLIES (was runs) ===
  app.post("/v1/assemblies", async (req: Request, res: Response) => {
    const parseResult = createAssemblyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(req, res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message, {
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
      return apiError(req, res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message, {
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
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
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
      return apiError(req, res, 404, "NOT_FOUND", "Run not found");
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
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
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
      return apiError(req, res, 404, "NOT_FOUND", "Run not found");
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
        return apiError(req, res, 401, "INVALID_SIGNATURE", validation.error || "Invalid signature");
      }
    }
    
    const assembly = await storage.getAssembly(assemblyId);
    if (!assembly) {
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    if (assembly.state !== "completed" || !assembly.kitPath) {
      return apiError(req, res, 404, "KIT_NOT_READY", "Kit not ready");
    }
    
    const kitPath = path.resolve(assembly.kitPath);
    if (!fs.existsSync(kitPath)) {
      return apiError(req, res, 404, "FILE_NOT_FOUND", "Kit file not found");
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
        return apiError(req, res, 401, "INVALID_SIGNATURE", validation.error || "Invalid signature");
      }
    }
    
    const assembly = await storage.getAssembly(runId);
    if (!assembly) {
      return apiError(req, res, 404, "NOT_FOUND", "Run not found");
    }
    
    if (assembly.state !== "completed" || !assembly.kitPath) {
      return apiError(req, res, 404, "BUNDLE_NOT_READY", "Bundle not ready");
    }
    
    const kitPath = path.resolve(assembly.kitPath);
    if (!fs.existsSync(kitPath)) {
      return apiError(req, res, 404, "FILE_NOT_FOUND", "Bundle file not found");
    }
    
    res.download(kitPath, `axiom_kit_${assembly.id}.zip`);
  });

  // === DELIVERIES (was handoffs) ===
  app.post("/v1/assemblies/:assemblyId/deliveries", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    const parseResult = createDeliveryRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(req, res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message);
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
      return apiError(req, res, 404, "NOT_FOUND", "Run not found");
    }
    
    const parseResult = createDeliveryRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(req, res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message);
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
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
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
      return apiError(req, res, 404, "NOT_FOUND", "Run not found");
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
      return apiError(req, res, 404, "NOT_FOUND", "Delivery not found");
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
      return apiError(req, res, 404, "NOT_FOUND", "Handoff not found");
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
      return apiError(req, res, 404, "NOT_FOUND", "Delivery not found");
    }
    
    if (delivery.state === "completed") {
      return apiError(req, res, 409, "ALREADY_COMPLETED", "Delivery already completed");
    }
    
    if (delivery.attempts >= delivery.maxAttempts) {
      return apiError(req, res, 409, "MAX_ATTEMPTS_REACHED", "Maximum attempts reached");
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
      return apiError(req, res, 404, "NOT_FOUND", "Handoff not found");
    }
    
    if (delivery.state === "completed") {
      return apiError(req, res, 409, "ALREADY_COMPLETED", "Handoff already completed");
    }
    
    if (delivery.attempts >= delivery.maxAttempts) {
      return apiError(req, res, 409, "MAX_ATTEMPTS_REACHED", "Maximum attempts reached");
    }
    
    const baseUrl = getBaseUrl(req);
    const processed = await processDelivery(delivery.id, baseUrl);
    
    res.json({ ok: processed.success, handoffId: delivery.id });
  });

  // === PROJECT PACKAGES ===
  
  const projectZipUpload = upload.single("file");
  const MAX_ZIP_SIZE = 100 * 1024 * 1024; // 100MB

  app.post("/v1/project-packages", (req: Request, res: Response, next) => {
    projectZipUpload(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return apiError(req, res, 400, "UPLOAD_TOO_LARGE", "ZIP file exceeds size limit");
        }
        return apiError(req, res, 400, "UPLOAD_ERROR", err.message || "Upload failed");
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const file = req.file;
      
      if (!file) {
        return apiError(req, res, 400, "NO_FILE", "No file uploaded");
      }
      
      const isZip = file.mimetype === "application/zip" || 
                    file.mimetype === "application/x-zip-compressed" ||
                    file.originalname.toLowerCase().endsWith(".zip");
      
      if (!isZip) {
        return apiError(req, res, 400, "INVALID_FILE_TYPE", "Only ZIP files are accepted");
      }
      
      if (file.size > MAX_ZIP_SIZE) {
        return apiError(req, res, 400, "UPLOAD_TOO_LARGE", `ZIP file exceeds ${MAX_ZIP_SIZE / 1024 / 1024}MB limit`);
      }
      
      const sha256 = crypto.createHash("sha256").update(file.buffer).digest("hex");
      const packageId = `pkg_${crypto.randomUUID().replace(/-/g, "").substring(0, 12)}`;
      const objectKey = getProjectPackagePath(packageId, "original.zip");
      
      await writeFile(objectKey, file.buffer);
      
      const pkg = await storage.createProjectPackage({
        filename: file.originalname,
        mimeType: file.mimetype || "application/zip",
        sizeBytes: file.size,
        sha256,
        objectKey,
        correlationId: req.correlationId || "",
      });
      
      enqueue("scanAndIndexProjectPackage", { projectPackageId: pkg.id });
      
      res.status(201).json({
        projectPackageId: pkg.id,
        filename: pkg.filename,
        sizeBytes: pkg.sizeBytes,
        sha256: pkg.sha256,
        scanState: pkg.scanState,
        indexState: pkg.indexState,
        warnings: [],
        correlationId: req.correlationId,
      });
    } catch (error) {
      console.error("Project package upload error:", error);
      return apiError(req, res, 500, "UPLOAD_ERROR", error instanceof Error ? error.message : "Upload failed");
    }
  });

  app.get("/v1/project-packages/:projectPackageId", async (req: Request<{ projectPackageId: string }>, res: Response) => {
    const pkg = await storage.getProjectPackage(req.params.projectPackageId);
    if (!pkg) {
      return apiError(req, res, 404, "NOT_FOUND", "Project package not found");
    }
    
    res.json({
      projectPackage: {
        id: pkg.id,
        filename: pkg.filename,
        sizeBytes: pkg.sizeBytes,
        sha256: pkg.sha256,
        scanState: pkg.scanState,
        indexState: pkg.indexState,
        summary: pkg.summaryJson,
        warnings: pkg.warningsJson || [],
        error: pkg.errorCode ? { code: pkg.errorCode, message: pkg.errorMessage } : null,
        assemblyId: pkg.assemblyId,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
      },
      correlationId: req.correlationId,
    });
  });

  app.post("/v1/assemblies/:assemblyId/project-packages/:projectPackageId/attach", 
    async (req: Request<{ assemblyId: string; projectPackageId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    const pkg = await storage.getProjectPackage(req.params.projectPackageId);
    if (!pkg) {
      return apiError(req, res, 404, "NOT_FOUND", "Project package not found");
    }
    
    if (pkg.assemblyId && pkg.assemblyId !== assembly.id) {
      return apiError(req, res, 409, "ALREADY_ATTACHED", "Package already attached to another assembly");
    }
    
    await storage.updateProjectPackage(pkg.id, { assemblyId: assembly.id });
    
    res.json({
      ok: true,
      assemblyId: assembly.id,
      projectPackageId: pkg.id,
      correlationId: req.correlationId,
    });
  });

  app.post("/v1/assemblies/:assemblyId/upgrade", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    const parseResult = createUpgradeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(req, res, 400, "UPGRADE_REQUEST_INVALID", "Invalid upgrade request", 
        { errors: parseResult.error.errors });
    }
    
    const { projectPackageId, request, output } = parseResult.data;
    const mode = output?.mode || "patch_only";
    
    const pkg = await storage.getProjectPackage(projectPackageId);
    if (!pkg) {
      return apiError(req, res, 404, "NOT_FOUND", "Project package not found");
    }
    
    if (pkg.indexState !== "indexed") {
      return apiError(req, res, 409, "PROJECT_NOT_INDEXED", "Project package has not been indexed yet");
    }
    
    if (!pkg.assemblyId) {
      await storage.updateProjectPackage(pkg.id, { assemblyId: assembly.id });
    }
    
    const artifacts: UpgradeArtifact[] = [];
    const kitId = assembly.id;
    
    try {
      if (pkg.summaryJson) {
        const summaryKey = getKitUpgradePath(kitId, "PROJECT_SUMMARY.json");
        const summaryContent = JSON.stringify(pkg.summaryJson, null, 2);
        await writeText(summaryKey, summaryContent);
        artifacts.push({
          type: "project_summary",
          objectKey: summaryKey,
          sha256: crypto.createHash("sha256").update(summaryContent).digest("hex"),
          sizeBytes: Buffer.byteLength(summaryContent),
        });
      }
      
      if (pkg.unpackedObjectKey) {
        try {
          const treeContent = await readText(`${pkg.unpackedObjectKey}/project_tree.txt`);
          const treeKey = getKitUpgradePath(kitId, "PROJECT_TREE.txt");
          await writeText(treeKey, treeContent);
          artifacts.push({
            type: "project_tree",
            objectKey: treeKey,
            sha256: crypto.createHash("sha256").update(treeContent).digest("hex"),
            sizeBytes: Buffer.byteLength(treeContent),
          });
        } catch {}
        
        try {
          const depContent = await readText(`${pkg.unpackedObjectKey}/dependency_snapshot.json`);
          const depKey = getKitUpgradePath(kitId, "DEPENDENCY_SNAPSHOT.json");
          await writeText(depKey, depContent);
          artifacts.push({
            type: "dep_snapshot",
            objectKey: depKey,
            sha256: crypto.createHash("sha256").update(depContent).digest("hex"),
            sizeBytes: Buffer.byteLength(depContent),
          });
        } catch {}
      }
      
      const patchPlan = generatePatchPlan(request, pkg.summaryJson);
      const planKey = getKitUpgradePath(kitId, "PATCH_PLAN.md");
      await writeText(planKey, patchPlan);
      artifacts.push({
        type: "upgrade_plan",
        objectKey: planKey,
        sha256: crypto.createHash("sha256").update(patchPlan).digest("hex"),
        sizeBytes: Buffer.byteLength(patchPlan),
      });
      
      const diffPlaceholder = "# Patch Diff\n\n(Patch diff will be generated in Phase 2 when auto-apply is implemented)\n";
      const diffKey = getKitUpgradePath(kitId, "patch.diff");
      await writeText(diffKey, diffPlaceholder);
      artifacts.push({
        type: "upgrade_diff",
        objectKey: diffKey,
        sha256: crypto.createHash("sha256").update(diffPlaceholder).digest("hex"),
        sizeBytes: Buffer.byteLength(diffPlaceholder),
      });
      
      res.json({
        assemblyId: assembly.id,
        upgrade: {
          mode,
          projectPackageId: pkg.id,
          artifacts,
        },
        correlationId: req.correlationId,
      });
    } catch (error) {
      console.error("Upgrade generation error:", error);
      return apiError(req, res, 500, "UPGRADE_GENERATION_FAILED", 
        error instanceof Error ? error.message : "Failed to generate upgrade artifacts");
    }
  });

  app.get("/v1/assemblies/:assemblyId/upgrade", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const assembly = await storage.getAssembly(req.params.assemblyId);
    if (!assembly) {
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    const packages = await storage.getProjectPackagesByAssemblyId(assembly.id);
    const kitId = assembly.id;
    const baseUrl = getBaseUrl(req);
    
    const artifacts: Array<{ type: string; downloadUrl: string; sha256?: string }> = [];
    
    const upgradeFiles = [
      { type: "upgrade_plan", filename: "PATCH_PLAN.md" },
      { type: "upgrade_diff", filename: "patch.diff" },
      { type: "project_summary", filename: "PROJECT_SUMMARY.json" },
      { type: "project_tree", filename: "PROJECT_TREE.txt" },
      { type: "dep_snapshot", filename: "DEPENDENCY_SNAPSHOT.json" },
    ];
    
    for (const file of upgradeFiles) {
      const objectKey = getKitUpgradePath(kitId, file.filename);
      if (await storageFileExists(objectKey)) {
        const signedUrl = generateSignedUrl(`${baseUrl}/v1/assemblies/${assembly.id}/upgrade/${file.filename}`, 3600);
        artifacts.push({
          type: file.type,
          downloadUrl: signedUrl,
        });
      }
    }
    
    res.json({
      assemblyId: assembly.id,
      projectPackages: packages.map(p => ({
        id: p.id,
        filename: p.filename,
        indexState: p.indexState,
      })),
      artifacts,
      correlationId: req.correlationId,
    });
  });
}

function generatePatchPlan(request: { overview: string; goals?: string[]; constraints?: string[]; doNotTouch?: string[] }, summary: any): string {
  let plan = `# Upgrade Plan\n\n`;
  plan += `## Overview\n\n${request.overview}\n\n`;
  
  if (request.goals && request.goals.length > 0) {
    plan += `## Goals\n\n`;
    request.goals.forEach((goal, i) => {
      plan += `${i + 1}. ${goal}\n`;
    });
    plan += `\n`;
  }
  
  if (request.constraints && request.constraints.length > 0) {
    plan += `## Constraints\n\n`;
    request.constraints.forEach((c, i) => {
      plan += `- ${c}\n`;
    });
    plan += `\n`;
  }
  
  if (request.doNotTouch && request.doNotTouch.length > 0) {
    plan += `## Do Not Touch\n\n`;
    request.doNotTouch.forEach((p) => {
      plan += `- \`${p}\`\n`;
    });
    plan += `\n`;
  }
  
  if (summary) {
    plan += `## Project Analysis\n\n`;
    if (summary.framework) plan += `- **Framework**: ${summary.framework}\n`;
    if (summary.packageManager) plan += `- **Package Manager**: ${summary.packageManager}\n`;
    if (summary.hasTypeScript) plan += `- **TypeScript**: Yes\n`;
    if (summary.hasEslint) plan += `- **ESLint**: Yes\n`;
    if (summary.hasPrettier) plan += `- **Prettier**: Yes\n`;
    if (summary.fileCount) plan += `- **File Count**: ${summary.fileCount}\n`;
    if (summary.entryPoints && summary.entryPoints.length > 0) {
      plan += `- **Entry Points**: ${summary.entryPoints.join(", ")}\n`;
    }
    plan += `\n`;
  }
  
  plan += `## Implementation Steps\n\n`;
  plan += `1. Review the PROJECT_SUMMARY.json and PROJECT_TREE.txt to understand the codebase structure\n`;
  plan += `2. Identify files that need modification based on the goals above\n`;
  plan += `3. Create patches for each file following the constraints\n`;
  plan += `4. Apply patches and run validation (build, lint, test if available)\n`;
  plan += `5. Generate the final patch.diff or upgraded_project.zip\n\n`;
  
  plan += `---\n\n`;
  plan += `*Generated by Axiom Assembler*\n`;
  
  return plan;
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
