import { appendJsonl } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { existsSync, readFileSync } from "node:fs";
import type { OperatorActionType } from "../../types/controlPlane.js";

export interface AuditEntry {
  timestamp: string;
  action: string;
  run_id: string;
  details: Record<string, unknown>;
  prev_hash: string;
  hash: string;
}

export interface OperatorAction {
  action_type: OperatorActionType;
  run_id: string;
  operator_id: string;
  details: Record<string, unknown>;
  timestamp: string;
}

const NEVER_OVERRIDABLE_GATES: ReadonlySet<string> = new Set([
  "G1_INTAKE_VALIDITY",
  "G2_CANONICAL_INTEGRITY",
  "G8_PACKAGE_INTEGRITY",
]);

export class AuditLogger {
  private prevHash: string = "0000000000000000000000000000000000000000000000000000000000000000";

  constructor(private logPath: string) {}

  append(action: string, runId: string, details: Record<string, unknown>): void {
    const timestamp = isoNow();
    const payload = JSON.stringify({ timestamp, action, run_id: runId, details, prev_hash: this.prevHash });
    const hash = sha256(payload);

    const entry: AuditEntry = {
      timestamp,
      action,
      run_id: runId,
      details,
      prev_hash: this.prevHash,
      hash,
    };

    appendJsonl(this.logPath, entry);
    this.prevHash = hash;
  }

  logOperatorAction(action: OperatorAction): void {
    if (action.action_type === "approve_override") {
      const gateId = action.details["gate_id"] as string | undefined;
      if (gateId && NEVER_OVERRIDABLE_GATES.has(gateId)) {
        throw new Error(`Gate ${gateId} is never overridable`);
      }

      const expiry = action.details["expiry"] as string | undefined;
      if (expiry) {
        const expiryDate = new Date(expiry);
        if (expiryDate <= new Date()) {
          throw new Error(`Override expiry ${expiry} is in the past`);
        }
      }

      const scope = action.details["scope"] as string | undefined;
      if (!scope) {
        throw new Error("Override scope is required");
      }
    }

    this.append(action.action_type, action.run_id, {
      operator_id: action.operator_id,
      ...action.details,
    });
  }

  getEntries(): AuditEntry[] {
    if (!existsSync(this.logPath)) {
      return [];
    }
    const content = readFileSync(this.logPath, "utf-8").trim();
    if (!content) return [];
    return content.split("\n").map((line) => JSON.parse(line) as AuditEntry);
  }
}
