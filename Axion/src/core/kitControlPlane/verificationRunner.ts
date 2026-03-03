import { execSync } from "node:child_process";
import { join } from "node:path";
import { isoNow } from "../../utils/time.js";
import { ensureDir, writeJson } from "../../utils/fs.js";
import { writeFileSync } from "node:fs";
import type { CommandResult, VerificationPolicy } from "./types.js";
import type { VerificationRunResult } from "./types.js";

export function captureCommandOutput(
  commandId: string,
  command: string,
  stdout: string,
  stderr: string,
  exitCode: number,
  startedAt: string,
  finishedAt: string
): CommandResult {
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  return {
    command_id: commandId,
    command,
    exit_code: exitCode,
    stdout_pointer: `logs/${commandId}.stdout.log`,
    stderr_pointer: `logs/${commandId}.stderr.log`,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: end - start,
  };
}

export function runVerificationCommands(
  policy: VerificationPolicy,
  repoPath: string,
  logsDir: string
): VerificationRunResult {
  ensureDir(logsDir);
  const results: CommandResult[] = [];

  for (const cmd of policy.commands) {
    const startedAt = isoNow();
    let stdout = "";
    let stderr = "";
    let exitCode = 0;

    try {
      const output = execSync(cmd.command, {
        cwd: repoPath,
        timeout: cmd.timeout_ms ?? 60000,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      stdout = output ?? "";
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; status?: number };
      stdout = execErr.stdout ?? "";
      stderr = execErr.stderr ?? "";
      exitCode = execErr.status ?? 1;
    }

    const finishedAt = isoNow();
    const result = captureCommandOutput(cmd.command_id, cmd.command, stdout, stderr, exitCode, startedAt, finishedAt);
    results.push(result);

    writeFileSync(join(logsDir, `${cmd.command_id}.stdout.log`), stdout, "utf-8");
    writeFileSync(join(logsDir, `${cmd.command_id}.stderr.log`), stderr, "utf-8");
  }

  const overallStatus = results.every((r) => r.exit_code === 0) ? "PASS" : "FAIL";

  const runResult: VerificationRunResult = {
    kit_id: repoPath.split("/").pop() ?? "unknown",
    command_results: results,
    overall_status: overallStatus,
    executed_at: isoNow(),
  };

  writeJson(join(logsDir, "verification_run_result.json"), runResult);

  return runResult;
}
