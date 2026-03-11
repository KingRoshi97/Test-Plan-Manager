import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";

export interface CompilationStatus {
  status: "idle" | "installing" | "compiling" | "ready" | "failed";
  progress?: string;
  error?: string;
}

interface CompilationEntry {
  status: CompilationStatus;
  process: ChildProcess | null;
  timeout: ReturnType<typeof setTimeout> | null;
}

const runningCompilations = new Map<string, CompilationEntry>();

const COMPILATION_TIMEOUT_MS = 5 * 60 * 1000;

export function getCompilationStatus(runId: string): CompilationStatus {
  const entry = runningCompilations.get(runId);
  if (!entry) {
    return { status: "idle" };
  }
  return { ...entry.status };
}

export function startCompilation(runId: string, repoDir: string): CompilationStatus {
  const existing = runningCompilations.get(runId);
  if (existing && (existing.status.status === "installing" || existing.status.status === "compiling")) {
    return { ...existing.status };
  }

  if (!fs.existsSync(repoDir)) {
    return { status: "failed", error: "Repository directory not found" };
  }

  const entry: CompilationEntry = {
    status: { status: "installing", progress: "Installing dependencies..." },
    process: null,
    timeout: null,
  };
  runningCompilations.set(runId, entry);

  const outputLines: string[] = [];

  const child = spawn("sh", ["-c", "npm install --prefer-offline --no-audit --no-fund && npx vite build"], {
    cwd: repoDir,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  entry.process = child;

  entry.timeout = setTimeout(() => {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      entry.status = {
        status: "failed",
        error: "Compilation timed out after 5 minutes",
      };
      entry.process = null;
      entry.timeout = null;
    }
  }, COMPILATION_TIMEOUT_MS);

  child.stdout?.on("data", (data: Buffer) => {
    const text = data.toString().trim();
    if (text) {
      outputLines.push(text);
      const lastLine = text.split("\n").pop() || "";
      if (entry.status.status === "installing" && lastLine.includes("vite")) {
        entry.status = { status: "compiling", progress: lastLine.slice(0, 200) };
      } else {
        entry.status = { ...entry.status, progress: lastLine.slice(0, 200) };
      }
    }
  });

  child.stderr?.on("data", (data: Buffer) => {
    const text = data.toString().trim();
    if (text) {
      outputLines.push(text);
      if (text.toLowerCase().includes("vite") || text.toLowerCase().includes("build")) {
        entry.status = { status: "compiling", progress: text.split("\n").pop()?.slice(0, 200) };
      }
    }
  });

  child.on("close", (code) => {
    if (entry.timeout) {
      clearTimeout(entry.timeout);
      entry.timeout = null;
    }
    entry.process = null;

    if (code === 0) {
      const distDir = path.join(repoDir, "dist");
      if (fs.existsSync(distDir)) {
        entry.status = { status: "ready", progress: "Build completed successfully" };
      } else {
        entry.status = {
          status: "failed",
          error: "Build completed but dist/ directory was not created",
        };
      }
    } else {
      const lastLines = outputLines.slice(-10).join("\n");
      entry.status = {
        status: "failed",
        error: `Build failed with exit code ${code}:\n${lastLines}`.slice(0, 1000),
      };
    }
  });

  child.on("error", (err) => {
    if (entry.timeout) {
      clearTimeout(entry.timeout);
      entry.timeout = null;
    }
    entry.process = null;
    entry.status = {
      status: "failed",
      error: `Failed to start build process: ${err.message}`,
    };
  });

  return { ...entry.status };
}
