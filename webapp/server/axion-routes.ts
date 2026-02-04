import type { Express, Request, Response } from "express";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";

interface AxionKit {
  id: string;
  name: string;
  createdAt: string;
  path: string;
  status: "created" | "scaffolding" | "drafting" | "reviewing" | "verified" | "locked";
  stageMarkers?: Record<string, Record<string, { completed_at: string; status: string }>>;
}

interface RunResult {
  id: string;
  kitId: string;
  plan: string;
  status: "running" | "success" | "failed";
  startedAt: string;
  completedAt?: string;
  output: string[];
}

const kits: Map<string, AxionKit> = new Map();
const runs: Map<string, RunResult> = new Map();
const activeProcesses: Map<string, ChildProcess> = new Map();

const AXION_ROOT = path.join(process.cwd(), "axion");
const KITS_ROOT = path.join(process.cwd(), "axion-kits");

function ensureKitsDir() {
  if (!fs.existsSync(KITS_ROOT)) {
    fs.mkdirSync(KITS_ROOT, { recursive: true });
  }
}

// Kit metadata file stored in each kit directory
const KIT_METADATA_FILE = "kit.json";

interface KitMetadata {
  id: string;
  name: string;
  createdAt: string;
}

// Load existing kits from disk on startup
function loadExistingKits() {
  ensureKitsDir();
  try {
    const entries = fs.readdirSync(KITS_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const kitPath = path.join(KITS_ROOT, entry.name);
        const metadataPath = path.join(kitPath, KIT_METADATA_FILE);
        
        let kitId: string;
        let kitName: string;
        let createdAt: string;
        
        // Try to read kit metadata for consistent IDs
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata: KitMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
            kitId = metadata.id;
            kitName = metadata.name;
            createdAt = metadata.createdAt;
          } catch {
            // Fallback to directory-based ID if metadata corrupt
            kitId = `kit_${entry.name}`;
            kitName = entry.name;
            createdAt = fs.statSync(kitPath).birthtime.toISOString();
          }
        } else {
          // Legacy kit without metadata - generate and save
          const stat = fs.statSync(kitPath);
          kitId = `kit_${entry.name}`;
          kitName = entry.name;
          createdAt = stat.birthtime.toISOString();
          
          // Save metadata for future consistency
          try {
            fs.writeFileSync(metadataPath, JSON.stringify({
              id: kitId,
              name: kitName,
              createdAt
            }, null, 2));
          } catch {
            // Ignore write errors
          }
        }
        
        // Check if kit already loaded
        if (kits.has(kitId)) continue;
        
        // Try to read stage markers for status
        let status: AxionKit["status"] = "created";
        const stageMarkersPath = path.join(kitPath, "registry/stage_markers.json");
        if (fs.existsSync(stageMarkersPath)) {
          try {
            const markers = JSON.parse(fs.readFileSync(stageMarkersPath, "utf-8"));
            if (Object.keys(markers).length > 0) {
              status = "scaffolding";
            }
          } catch {
            // Ignore parse errors
          }
        }
        
        const kit: AxionKit = {
          id: kitId,
          name: kitName,
          createdAt,
          path: kitPath,
          status
        };
        kits.set(kitId, kit);
      }
    }
  } catch (err) {
    console.error("[AXION] Failed to load existing kits:", err);
  }
}

// Initialize on module load
loadExistingKits();

export function registerAxionRoutes(app: Express) {
  
  // List all kits
  app.get("/api/axion/kits", async (req: Request, res: Response) => {
    ensureKitsDir();
    const kitsList = Array.from(kits.values());
    res.json({ kits: kitsList });
  });

  // Create a new kit
  app.post("/api/axion/kits", async (req: Request, res: Response) => {
    const { name, stackProfile = "default-web-saas" } = req.body;
    
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Kit name is required", code: "VALIDATION_ERROR" });
    }

    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const kitId = `kit_${Date.now()}_${sanitizedName}`;
    const kitPath = path.join(KITS_ROOT, sanitizedName);

    ensureKitsDir();

    // Run axion-kit-create
    const createProcess = spawn("npx", [
      "tsx",
      path.join(AXION_ROOT, "scripts/axion-kit-create.ts"),
      "--build-root", process.cwd(),
      "--project-name", sanitizedName,
      "--target", kitPath
    ], {
      cwd: process.cwd(),
      env: process.env
    });

    let output = "";
    createProcess.stdout.on("data", (data) => { output += data.toString(); });
    createProcess.stderr.on("data", (data) => { output += data.toString(); });

    createProcess.on("close", (code) => {
      if (code === 0) {
        const createdAt = new Date().toISOString();
        const kit: AxionKit = {
          id: kitId,
          name: sanitizedName,
          createdAt,
          path: kitPath,
          status: "created"
        };
        
        // Save kit metadata for persistence across restarts
        try {
          fs.writeFileSync(
            path.join(kitPath, KIT_METADATA_FILE),
            JSON.stringify({ id: kitId, name: sanitizedName, createdAt }, null, 2)
          );
        } catch {
          // Ignore write errors
        }
        
        kits.set(kitId, kit);
        res.status(201).json({ kit, output });
      } else {
        res.status(500).json({ 
          error: "Failed to create kit", 
          code: "KIT_CREATE_FAILED",
          output 
        });
      }
    });
  });

  // Get kit details
  app.get("/api/axion/kits/:id", async (req: Request<{ id: string }>, res: Response) => {
    const kit = kits.get(req.params.id);
    if (!kit) {
      return res.status(404).json({ error: "Kit not found", code: "NOT_FOUND" });
    }

    // Try to load stage markers
    const markersPath = path.join(kit.path, "registry/stage_markers.json");
    if (fs.existsSync(markersPath)) {
      try {
        kit.stageMarkers = JSON.parse(fs.readFileSync(markersPath, "utf-8"));
      } catch {}
    }

    res.json(kit);
  });

  // Run a pipeline plan on a kit
  app.post("/api/axion/kits/:id/run", async (req: Request<{ id: string }>, res: Response) => {
    const kit = kits.get(req.params.id);
    if (!kit) {
      return res.status(404).json({ error: "Kit not found", code: "NOT_FOUND" });
    }

    const { plan = "docs:full", override = false } = req.body;

    const runId = `run_${Date.now()}`;
    const run: RunResult = {
      id: runId,
      kitId: kit.id,
      plan,
      status: "running",
      startedAt: new Date().toISOString(),
      output: []
    };
    runs.set(runId, run);

    const args = [
      "tsx",
      path.join(kit.path, "axion/scripts/axion-run.ts"),
      "--build-root", kit.path,
      "--project-name", "build",
      "--preset", "system",
      "--plan", plan,
      "--allow-nonempty"
    ];

    if (override) {
      args.push("--override");
    }

    const runProcess = spawn("npx", args, {
      cwd: kit.path,
      env: process.env
    });

    activeProcesses.set(runId, runProcess);

    runProcess.stdout.on("data", (data) => {
      run.output.push(data.toString());
    });

    runProcess.stderr.on("data", (data) => {
      run.output.push(data.toString());
    });

    runProcess.on("close", (code) => {
      run.status = code === 0 ? "success" : "failed";
      run.completedAt = new Date().toISOString();
      activeProcesses.delete(runId);

      // Update kit status based on plan
      if (code === 0) {
        if (plan.includes("scaffold")) kit.status = "scaffolding";
        if (plan.includes("draft")) kit.status = "drafting";
        if (plan.includes("review")) kit.status = "reviewing";
        if (plan.includes("verify")) kit.status = "verified";
        if (plan.includes("lock")) kit.status = "locked";
        if (plan === "docs:full") kit.status = "verified";
      }
    });

    res.status(202).json({ 
      runId, 
      message: `Started ${plan} on kit ${kit.name}`,
      status: "running"
    });
  });

  // Get run status/output
  app.get("/api/axion/runs/:id", async (req: Request<{ id: string }>, res: Response) => {
    const run = runs.get(req.params.id);
    if (!run) {
      return res.status(404).json({ error: "Run not found", code: "NOT_FOUND" });
    }
    res.json(run);
  });

  // Stream run output (SSE)
  app.get("/api/axion/runs/:id/stream", async (req: Request<{ id: string }>, res: Response) => {
    const run = runs.get(req.params.id);
    if (!run) {
      return res.status(404).json({ error: "Run not found", code: "NOT_FOUND" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send current output
    res.write(`data: ${JSON.stringify({ type: "history", lines: run.output })}\n\n`);

    if (run.status !== "running") {
      res.write(`data: ${JSON.stringify({ type: "complete", status: run.status })}\n\n`);
      res.end();
      return;
    }

    const process = activeProcesses.get(req.params.id);
    if (!process) {
      res.write(`data: ${JSON.stringify({ type: "complete", status: run.status })}\n\n`);
      res.end();
      return;
    }

    const onData = (data: Buffer) => {
      res.write(`data: ${JSON.stringify({ type: "output", line: data.toString() })}\n\n`);
    };

    process.stdout?.on("data", onData);
    process.stderr?.on("data", onData);

    process.on("close", (code) => {
      res.write(`data: ${JSON.stringify({ type: "complete", status: code === 0 ? "success" : "failed" })}\n\n`);
      res.end();
    });

    req.on("close", () => {
      process.stdout?.off("data", onData);
      process.stderr?.off("data", onData);
    });
  });

  // List available plans
  app.get("/api/axion/plans", async (req: Request, res: Response) => {
    res.json({
      plans: [
        { id: "docs:scaffold", label: "Scaffold Docs", description: "Generate + Seed all modules" },
        { id: "docs:content", label: "Generate Content", description: "Draft + Review all modules" },
        { id: "docs:full", label: "Full Docs Pipeline", description: "Generate → Seed → Draft → Review → Verify" },
        { id: "app:bootstrap", label: "Bootstrap App", description: "Scaffold application code" }
      ]
    });
  });

  // Read file from kit
  app.get("/api/axion/kits/:id/files", async (req: Request<{ id: string }>, res: Response) => {
    const kit = kits.get(req.params.id);
    if (!kit) {
      return res.status(404).json({ error: "Kit not found", code: "NOT_FOUND" });
    }

    const rawPath = (req.query.path as string) || "";
    
    // Security: decode the path
    let filePath: string;
    try {
      filePath = decodeURIComponent(rawPath);
    } catch {
      return res.status(400).json({ error: "Invalid path encoding", code: "BAD_REQUEST" });
    }
    
    // Security: reject absolute paths
    if (path.isAbsolute(filePath)) {
      return res.status(403).json({ error: "Absolute paths not allowed", code: "FORBIDDEN" });
    }
    
    // Security: resolve paths and use canonical containment check
    const resolvedKitPath = path.resolve(kit.path);
    const fullPath = path.resolve(kit.path, filePath);

    // Canonical containment: resolved path must be within or equal to kit root
    // This handles all traversal attempts (.., symlinks, etc.) after resolution
    if (fullPath !== resolvedKitPath && !fullPath.startsWith(resolvedKitPath + path.sep)) {
      return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found", code: "NOT_FOUND" });
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(fullPath).map(name => ({
        name,
        isDirectory: fs.statSync(path.join(fullPath, name)).isDirectory()
      }));
      return res.json({ type: "directory", entries });
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    res.json({ type: "file", content, path: filePath });
  });
}
