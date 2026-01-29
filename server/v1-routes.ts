import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { createAssemblyRequestSchema, createDeliveryRequestSchema, createUpgradeRequestSchema, type Kit, type AssemblyInput, type CreateAssemblyRequest, type UploadedFile, type UpgradeArtifact } from "@shared/schema";
import { generateSignedUrl, validateSignature, computeSha256 } from "./signing";
import { processDelivery } from "./adapters";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { createWorkspace, populateWorkspaceWithAI, getWorkspacePath, type WorkspaceConfig } from "./workspace-manager";
import { buildPipelineContext, type ProjectPackageSummary } from "./presets";
import { upload, processUploadedFiles, combineExtractedText } from "./file-upload";
import { registerHandler, enqueue } from "./jobs/queue";
import { scanAndIndexProjectPackage } from "./jobs/scan-index-package";
import { ingestUploadedDocs } from "./doc-ingestion";
import { writeFile, writeText, readText, getProjectPackagePath, getKitUpgradePath, fileExists as storageFileExists } from "./file-storage";
import crypto from "crypto";
import { generateApiKey, logAudit, requireApiKey, validateApiKey, optionalApiKey } from "./apikey";
import { startDeliveryRetryScheduler } from "./jobs/delivery-retry-scheduler";

registerHandler("scanAndIndexProjectPackage", scanAndIndexProjectPackage);

startDeliveryRetryScheduler();

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
  
  const optionalAuth = optionalApiKey();
  
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
  app.post("/v1/assemblies", optionalAuth, async (req: Request, res: Response) => {
    const parseResult = createAssemblyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return apiError(req, res, 400, "INVALID_REQUEST", parseResult.error.errors[0].message, {
        field: parseResult.error.errors[0].path.join(".")
      });
    }
    
    const data = parseResult.data;
    
    // Validate projectPackageId if provided
    let projectPackageId: string | undefined;
    if (data.projectPackageId) {
      const pkg = await storage.getProjectPackage(data.projectPackageId);
      if (!pkg) {
        return apiError(req, res, 404, "ASSEMBLER_PROJECT_PACKAGE_NOT_FOUND", 
          "Project package not found");
      }
      // Require indexed state for auto-attach
      if (pkg.scanState !== "scanned" || pkg.indexState !== "indexed") {
        return apiError(req, res, 409, "ASSEMBLER_PROJECT_NOT_INDEXED",
          "Project package must be fully indexed before attaching to assembly");
      }
      projectPackageId = data.projectPackageId;
    }
    
    // Server-side validation: modes that require existing project ZIP
    const ZIP_REQUIRED_MODES = ["existing_upgrade", "ui_overhaul", "refactor_hardening", "add_feature_module"];
    if (data.mode && ZIP_REQUIRED_MODES.includes(data.mode) && !projectPackageId) {
      return apiError(req, res, 400, "ASSEMBLER_ZIP_REQUIRED",
        `Mode "${data.mode}" requires an existing project ZIP to be uploaded and indexed.`);
    }
    
    const assemblyInput = buildAssemblyInput(data);
    
    const assembly = await storage.createAssembly({
      projectName: assemblyInput.projectName,
      idea: assemblyInput.legacy?.idea || assemblyInput.description,
      context: data.context,
      preset: data.preset,
      category: data.category,
      mode: data.mode,
      presetId: data.presetId,
      domains: data.domains,
      input: assemblyInput,
      projectPackageId,
    });
    
    // Auto-attach project package if provided
    if (projectPackageId) {
      await storage.attachProjectPackageToAssembly(projectPackageId, assembly.id);
      await logAudit("package.attach", "project_package", projectPackageId, req, { 
        assemblyId: assembly.id,
        attachedDuring: "assembly_creation"
      });
    }
    
    executePipelineV1(assembly.id, assemblyInput);
    
    await logAudit("assembly.create", "assembly", assembly.id, req, { 
      projectName: assemblyInput.projectName,
      projectPackageId,
      category: data.category,
      mode: data.mode,
      presetId: data.presetId
    });
    
    res.status(202).json({
      assemblyId: assembly.id,
      state: assembly.state,
      statusUrl: `/v1/assemblies/${assembly.id}`,
      projectPackageId
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
    
    // Validate projectPackageId if provided
    let projectPackageId: string | undefined;
    if (data.projectPackageId) {
      const pkg = await storage.getProjectPackage(data.projectPackageId);
      if (!pkg) {
        return apiError(req, res, 404, "ASSEMBLER_PROJECT_PACKAGE_NOT_FOUND", 
          "Project package not found");
      }
      if (pkg.scanState !== "scanned" || pkg.indexState !== "indexed") {
        return apiError(req, res, 409, "ASSEMBLER_PROJECT_NOT_INDEXED",
          "Project package must be fully indexed before attaching to assembly");
      }
      projectPackageId = data.projectPackageId;
    }
    
    const assemblyInput = buildAssemblyInput(data);
    
    const assembly = await storage.createAssembly({
      projectName: assemblyInput.projectName,
      idea: assemblyInput.legacy?.idea || assemblyInput.description,
      context: data.context,
      preset: data.preset,
      domains: data.domains,
      input: assemblyInput,
      projectPackageId,
    });
    
    if (projectPackageId) {
      await storage.attachProjectPackageToAssembly(projectPackageId, assembly.id);
    }
    
    executePipelineV1(assembly.id, assemblyInput);
    
    res.status(202).json({
      runId: assembly.id,
      state: assembly.state,
      statusUrl: `/v1/runs/${assembly.id}`,
      projectPackageId
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

  // Kit metadata endpoint for pull deliveries
  app.get("/v1/assemblies/:assemblyId/kit/metadata", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const { assemblyId } = req.params;
    const baseUrl = getBaseUrl(req);
    
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
    
    const zipBuffer = fs.readFileSync(kitPath);
    const zipSha256 = assembly.kit?.zipSha256 || computeSha256(zipBuffer);
    const zipBytes = assembly.kit?.zipBytes || zipBuffer.length;
    
    const expiresInSeconds = 3600;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    
    const kitZipSigned = generateSignedUrl(
      `${baseUrl}/v1/assemblies/${assemblyId}/kit.zip`,
      { assemblyId, expiresInSeconds }
    );
    
    const workspacePath = assembly.kitPath.replace("/dist/axiom_kit.zip", "");
    const manifestPath = path.join(workspacePath, "dist/assembly_manifest.json");
    const promptPath = path.join(workspacePath, "dist/agent_prompt.md");
    
    let manifestSha256: string | null = null;
    if (fs.existsSync(manifestPath)) {
      manifestSha256 = computeSha256(fs.readFileSync(manifestPath));
    }
    
    const artifacts: { path: string; sha256: string; sizeBytes: number }[] = [];
    
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath);
      artifacts.push({
        path: "assembly_manifest.json",
        sha256: computeSha256(content),
        sizeBytes: content.length,
      });
    }
    
    if (fs.existsSync(promptPath)) {
      const content = fs.readFileSync(promptPath);
      artifacts.push({
        path: "agent_prompt.md",
        sha256: computeSha256(content),
        sizeBytes: content.length,
      });
    }
    
    const docsPath = path.join(workspacePath, "docs");
    if (fs.existsSync(docsPath)) {
      const scanDir = (dir: string, basePath: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(basePath, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath, relativePath);
          } else {
            const content = fs.readFileSync(fullPath);
            artifacts.push({
              path: `docs/${relativePath}`,
              sha256: computeSha256(content),
              sizeBytes: content.length,
            });
          }
        }
      };
      scanDir(docsPath, "");
    }
    
    res.json({
      assemblyId,
      kit: {
        bundleVersion: "1.0.0",
        createdAt: assembly.createdAt.toISOString(),
        expiresAt,
        sizeBytes: zipBytes,
        sha256: zipSha256,
        manifestSha256,
        artifacts,
      },
      urls: {
        kitZip: kitZipSigned.url,
        manifest: `${baseUrl}/v1/assemblies/${assemblyId}/manifest.json`,
      },
    });
  });

  // Manifest.json endpoint
  app.get("/v1/assemblies/:assemblyId/manifest.json", async (req: Request<{ assemblyId: string }>, res: Response) => {
    const { assemblyId } = req.params;
    
    const assembly = await storage.getAssembly(assemblyId);
    if (!assembly) {
      return apiError(req, res, 404, "NOT_FOUND", "Assembly not found");
    }
    
    if (assembly.state !== "completed" || !assembly.kitPath) {
      return apiError(req, res, 404, "KIT_NOT_READY", "Kit not ready");
    }
    
    const workspacePath = assembly.kitPath.replace("/dist/axiom_kit.zip", "");
    const manifestPath = path.join(workspacePath, "dist/assembly_manifest.json");
    
    if (!fs.existsSync(manifestPath)) {
      return apiError(req, res, 404, "MANIFEST_NOT_FOUND", "Manifest not found");
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    res.json(manifest);
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
    
    if (assembly.kit?.zipSha256) {
      res.set("X-Checksum-SHA256", assembly.kit.zipSha256);
    }
    if (assembly.kit?.zipBytes) {
      res.set("X-Content-Length", assembly.kit.zipBytes.toString());
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
    
    if (assembly.kit?.zipSha256) {
      res.set("X-Checksum-SHA256", assembly.kit.zipSha256);
    }
    if (assembly.kit?.zipBytes) {
      res.set("X-Content-Length", assembly.kit.zipBytes.toString());
    }
    
    res.download(kitPath, `axiom_kit_${assembly.id}.zip`);
  });

  // === DELIVERIES (was handoffs) ===
  app.post("/v1/assemblies/:assemblyId/deliveries", optionalAuth, async (req: Request<{ assemblyId: string }>, res: Response) => {
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
    
    await logAudit("delivery.create", "delivery", updatedDelivery.id, req, { assemblyId: assembly.id, type: updatedDelivery.type });
    
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

  // GET /v1/deliveries/:deliveryId/events - Get delivery event history
  app.get("/v1/deliveries/:deliveryId/events", async (req: Request<{ deliveryId: string }>, res: Response) => {
    const delivery = await storage.getDelivery(req.params.deliveryId);
    if (!delivery) {
      return apiError(req, res, 404, "NOT_FOUND", "Delivery not found");
    }
    
    const events = await storage.getDeliveryEvents(delivery.id);
    
    res.json({
      deliveryId: delivery.id,
      events: events.map(e => ({
        id: e.id,
        eventType: e.eventType,
        occurredAt: e.occurredAt.toISOString(),
        details: e.detailsJson || null,
      })),
      correlationId: req.correlationId,
    });
  });

  app.post("/v1/deliveries/:deliveryId/retry", optionalAuth, async (req: Request<{ deliveryId: string }>, res: Response) => {
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
    
    await logAudit("delivery.retry", "delivery", delivery.id, req, { success: processed.success });
    
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
      
      await logAudit("package.upload", "project_package", pkg.id, req, { filename: pkg.filename, sizeBytes: pkg.sizeBytes });
      
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
    
    await logAudit("package.attach", "project_package", pkg.id, req, { assemblyId: assembly.id });
    
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
      
      await logAudit("upgrade.generate", "assembly", assembly.id, req, { projectPackageId: pkg.id, mode, artifactCount: artifacts.length });
      
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
        const signed = generateSignedUrl(`${baseUrl}/v1/assemblies/${assembly.id}/upgrade/${file.filename}`, { assemblyId: assembly.id, expiresInSeconds: 3600 });
        artifacts.push({
          type: file.type,
          downloadUrl: signed.url,
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

  // ===== API Keys Endpoints =====
  
  app.get("/v1/api-keys", async (req: Request, res: Response) => {
    try {
      const keys = await storage.getApiKeys();
      
      const safeKeys = keys.map(k => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        lastUsedAt: k.lastUsedAt?.toISOString() || null,
        expiresAt: k.expiresAt?.toISOString() || null,
        createdAt: k.createdAt.toISOString(),
      }));
      
      res.json({
        apiKeys: safeKeys,
        correlationId: req.correlationId,
      });
    } catch (error) {
      console.error("Error listing API keys:", error);
      return apiError(req, res, 500, "INTERNAL_ERROR", "Failed to list API keys");
    }
  });

  app.post("/v1/api-keys", async (req: Request, res: Response) => {
    try {
      const { name, scopes, expiresAt } = req.body;
      
      if (!name || typeof name !== "string") {
        return apiError(req, res, 400, "INVALID_REQUEST", "Name is required");
      }
      
      const validScopes = ["*", "assemblies:read", "assemblies:write", "deliveries:read", "deliveries:write", "packages:read", "packages:write"];
      if (scopes && (!Array.isArray(scopes) || scopes.some(s => !validScopes.includes(s)))) {
        return apiError(req, res, 400, "INVALID_SCOPES", `Invalid scopes. Valid values: ${validScopes.join(", ")}`);
      }
      
      const { rawKey, keyHash, keyPrefix } = generateApiKey();
      
      const apiKey = await storage.createApiKey({
        name,
        keyHash,
        keyPrefix,
        scopes: scopes || ["*"],
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });
      
      await logAudit("apikey.create", "api_key", apiKey.id, req, { name, scopes });
      
      res.status(201).json({
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey,
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt?.toISOString() || null,
        createdAt: apiKey.createdAt.toISOString(),
        correlationId: req.correlationId,
        warning: "Store this key securely. It cannot be retrieved again.",
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      return apiError(req, res, 500, "INTERNAL_ERROR", "Failed to create API key");
    }
  });

  app.delete("/v1/api-keys/:keyId", async (req: Request<{ keyId: string }>, res: Response) => {
    try {
      const { keyId } = req.params;
      
      const apiKey = await storage.getApiKey(keyId);
      if (!apiKey) {
        return apiError(req, res, 404, "NOT_FOUND", "API key not found");
      }
      
      if (apiKey.revokedAt) {
        return apiError(req, res, 400, "ALREADY_REVOKED", "API key is already revoked");
      }
      
      await storage.updateApiKey(keyId, { revokedAt: new Date() });
      
      await logAudit("apikey.revoke", "api_key", keyId, req);
      
      res.json({
        id: keyId,
        revoked: true,
        revokedAt: new Date().toISOString(),
        correlationId: req.correlationId,
      });
    } catch (error) {
      console.error("Error revoking API key:", error);
      return apiError(req, res, 500, "INTERNAL_ERROR", "Failed to revoke API key");
    }
  });

  // ===== Audit Logs Endpoints =====
  
  app.get("/v1/audit-logs", async (req: Request, res: Response) => {
    try {
      const { limit, offset, action, resourceType } = req.query;
      
      const logs = await storage.getAuditLogs({
        limit: limit ? Math.min(parseInt(limit as string, 10), 1000) : 100,
        offset: offset ? parseInt(offset as string, 10) : 0,
        action: action as string | undefined,
        resourceType: resourceType as string | undefined,
      });
      
      res.json({
        auditLogs: logs.map(l => ({
          id: l.id,
          action: l.action,
          resourceType: l.resourceType,
          resourceId: l.resourceId,
          apiKeyId: l.apiKeyId,
          ipAddress: l.ipAddress,
          requestMethod: l.requestMethod,
          requestPath: l.requestPath,
          statusCode: l.statusCode,
          correlationId: l.correlationId,
          metadata: l.metadata,
          createdAt: l.createdAt.toISOString(),
        })),
        correlationId: req.correlationId,
      });
    } catch (error) {
      console.error("Error listing audit logs:", error);
      return apiError(req, res, 500, "INTERNAL_ERROR", "Failed to list audit logs");
    }
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
    docUploadIds: data.docUploadIds,
    // @ts-expect-error docUploads is defined in schema but zod type inference not picking it up
    docUploads: data.docUploads,
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
    
    let projectPackageSummary: ProjectPackageSummary | undefined;
    if (assembly.projectPackageId) {
      const pkg = await storage.getProjectPackage(assembly.projectPackageId);
      if (pkg && pkg.indexState === "indexed" && pkg.summaryJson) {
        const summary = pkg.summaryJson as Record<string, unknown>;
        projectPackageSummary = {
          id: pkg.id,
          filename: pkg.filename,
          framework: summary.framework as string | undefined,
          scripts: summary.scripts as Record<string, string> | undefined,
          dependencies: summary.dependencies as Record<string, string> | undefined,
          entrypoints: summary.entrypoints as string[] | undefined,
          fileCount: summary.fileCount as number | undefined,
          warnings: summary.warnings as string[] | undefined,
        };
        console.log(`[Assembler Pipeline] Loaded project package summary: ${pkg.filename}, framework: ${projectPackageSummary.framework || "unknown"}`);
      }
    }
    
    const pipelineContext = assembly.category && assembly.mode 
      ? buildPipelineContext(
          assembly.category as Parameters<typeof buildPipelineContext>[0],
          assembly.mode as Parameters<typeof buildPipelineContext>[1],
          assembly.presetId || undefined,
          projectPackageSummary
        )
      : undefined;
    
    if (pipelineContext) {
      console.log(`[Assembler Pipeline] Built pipeline context: category=${pipelineContext.category}, mode=${pipelineContext.mode}, weights=${JSON.stringify(pipelineContext.domainWeights)}`);
    }
    
    const workspaceConfig: WorkspaceConfig = {
      assemblyId,
      projectName: input.projectName,
      idea: input.legacy?.idea || input.description,
      context: assembly.context || undefined,
      domains: assembly.domains || ["platform", "api", "web"],
      pipelineContext,
    };
    
    console.log(`[Assembler Pipeline] Creating workspace for assembly ${assemblyId}`);
    const workspacePath = await createWorkspace(workspaceConfig);
    
    if (input.docUploads && input.docUploads.length > 0) {
      console.log(`[Assembler Pipeline] Ingesting ${input.docUploads.length} uploaded documents...`);
      try {
        const ingestionResult = await ingestUploadedDocs(input.docUploads, workspacePath);
        console.log(`[Assembler Pipeline] Doc ingestion complete: ${ingestionResult.stats.files} files processed, ${ingestionResult.stats.chars} chars extracted`);
        
        if (ingestionResult.compiledContent) {
          input.uploadedContext = ingestionResult.compiledContent;
        }
      } catch (err) {
        console.error(`[Assembler Pipeline] Doc ingestion warning (non-fatal):`, err);
      }
    }
    
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
