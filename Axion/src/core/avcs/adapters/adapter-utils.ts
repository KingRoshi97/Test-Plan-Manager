import { spawn } from "child_process";
import { access, constants } from "fs/promises";
import { resolve } from "path";
import type { AVCSTestResult, AVCSTestDefinition, FindingSeverity } from "../types.js";

export interface SpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  durationMs: number;
}

const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

export function spawnTool(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeoutMs?: number;
    env?: Record<string, string>;
  } = {}
): Promise<SpawnResult> {
  const { cwd, timeoutMs = 300_000, env } = options;
  const start = Date.now();

  return new Promise((resolveP) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (data: Buffer) => {
      if (stdout.length < MAX_OUTPUT_BYTES) {
        stdout += data.toString();
      }
    });

    child.stderr.on("data", (data: Buffer) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += data.toString();
      }
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolveP({
        stdout: stdout.slice(0, MAX_OUTPUT_BYTES),
        stderr: stderr.slice(0, MAX_OUTPUT_BYTES),
        exitCode: code ?? 1,
        timedOut,
        durationMs: Date.now() - start,
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolveP({
        stdout: "",
        stderr: err.message,
        exitCode: 1,
        timedOut: false,
        durationMs: Date.now() - start,
      });
    });
  });
}

export async function checkBinaryAvailable(name: string): Promise<boolean> {
  const result = await spawnTool("which", [name], { timeoutMs: 5000 });
  return result.exitCode === 0 && result.stdout.trim().length > 0;
}

export async function checkNpmToolAvailable(packageName: string): Promise<boolean> {
  try {
    const binPath = resolve("node_modules", ".bin", packageName);
    await access(binPath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function parseJsonSafe<T = unknown>(raw: string): T | null {
  try {
    const jsonStart = raw.indexOf("{");
    const jsonArrayStart = raw.indexOf("[");
    let start = -1;
    if (jsonStart >= 0 && jsonArrayStart >= 0) start = Math.min(jsonStart, jsonArrayStart);
    else if (jsonStart >= 0) start = jsonStart;
    else if (jsonArrayStart >= 0) start = jsonArrayStart;
    if (start < 0) return null;
    return JSON.parse(raw.slice(start)) as T;
  } catch {
    return null;
  }
}

export function makeSkipResult(
  test: AVCSTestDefinition,
  toolId: string,
  reason: string,
  installHint?: string
): AVCSTestResult {
  return {
    testId: test.id,
    toolId,
    status: "not_available",
    message: reason,
    score: 0,
    durationMs: 0,
    evidence: {
      adapter: `${toolId}-adapter`,
      reason: "tool_not_available",
      ...(installHint ? { installHint } : {}),
    },
  };
}

export function makeErrorResult(
  test: AVCSTestDefinition,
  toolId: string,
  error: string,
  durationMs: number
): AVCSTestResult {
  return {
    testId: test.id,
    toolId,
    status: "error",
    message: error,
    score: 0,
    durationMs,
    evidence: { adapter: `${toolId}-adapter`, error },
  };
}

export function mapSeverity(level: string): FindingSeverity {
  const lower = level.toLowerCase();
  if (lower === "error" || lower === "critical" || lower === "high") return "high";
  if (lower === "warning" || lower === "medium") return "medium";
  if (lower === "info" || lower === "low" || lower === "note") return "low";
  return "info";
}
