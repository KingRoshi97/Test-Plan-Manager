import { execSync } from "node:child_process";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { VerificationResult } from "./model.js";

export interface VerificationCommand {
  check_id: string;
  command: string;
  timeout_ms?: number;
}

export interface VerificationRunResult {
  kit_run_id: string;
  results: VerificationResult[];
  all_passed: boolean;
  timestamp: string;
}

const DEFAULT_COMMANDS: VerificationCommand[] = [
  { check_id: "VR-LINT", command: "npm run lint --if-present", timeout_ms: 60000 },
  { check_id: "VR-TYPECHECK", command: "npx tsc --noEmit --pretty", timeout_ms: 60000 },
  { check_id: "VR-BUILD", command: "npm run build --if-present", timeout_ms: 120000 },
  { check_id: "VR-TEST", command: "npm test --if-present", timeout_ms: 120000 },
];

export function runVerificationCommand(
  cmd: VerificationCommand,
  workingDir: string,
): VerificationResult {
  const timestamp = isoNow();
  const logRef = `verification_${sha256(`${cmd.check_id}_${timestamp}`).slice(0, 12)}.log`;

  try {
    execSync(cmd.command, {
      cwd: workingDir,
      timeout: cmd.timeout_ms ?? 60000,
      stdio: "pipe",
      encoding: "utf-8",
    });

    return {
      check_id: cmd.check_id,
      command: cmd.command,
      exit_code: 0,
      passed: true,
      log_ref: logRef,
      timestamp,
    };
  } catch (err: unknown) {
    const exitCode = (err as { status?: number }).status ?? 1;

    return {
      check_id: cmd.check_id,
      command: cmd.command,
      exit_code: exitCode,
      passed: false,
      log_ref: logRef,
      timestamp,
    };
  }
}

export function runAllVerifications(
  kitRunId: string,
  workingDir: string,
  commands?: VerificationCommand[],
): VerificationRunResult {
  const cmds = commands ?? DEFAULT_COMMANDS;
  const results: VerificationResult[] = [];

  for (const cmd of cmds) {
    const result = runVerificationCommand(cmd, workingDir);
    results.push(result);
  }

  return {
    kit_run_id: kitRunId,
    results,
    all_passed: results.every((r) => r.passed),
    timestamp: isoNow(),
  };
}
