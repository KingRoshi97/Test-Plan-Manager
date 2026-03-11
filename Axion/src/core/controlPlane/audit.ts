import { existsSync, readFileSync } from "node:fs";
import { appendJsonl } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { AuditActionCategory } from "./model.js";

export interface AuditEntry {
  timestamp: string;
  action: string;
  category: AuditActionCategory;
  run_id: string;
  actor: string;
  details: Record<string, unknown>;
  prev_hash: string;
  hash: string;
}

const ACTION_CATEGORY_MAP: Record<string, AuditActionCategory> = {
  "run.created": "lifecycle",
  "run.paused": "lifecycle",
  "run.resumed": "lifecycle",
  "run.cancelled": "lifecycle",
  "run.retried": "lifecycle",
  "run.released": "lifecycle",
  "run.completed": "lifecycle",
  "run.export_denied": "governance",
  "stage.started": "lifecycle",
  "stage.completed": "lifecycle",
  "policy.evaluated": "governance",
  "policy.snapshot": "governance",
  "pin.created": "evidence",
  "pin.removed": "evidence",
  "pin.verified": "evidence",
  "release.created": "evidence",
  "release.signed": "evidence",
  "release.published": "evidence",
  "release.revoked": "evidence",
};

function resolveCategory(action: string): AuditActionCategory {
  if (ACTION_CATEGORY_MAP[action]) return ACTION_CATEGORY_MAP[action];
  if (action.startsWith("run.") || action.startsWith("stage.")) return "lifecycle";
  if (action.startsWith("policy.") || action.startsWith("approval.")) return "governance";
  if (action.startsWith("pin.") || action.startsWith("release.") || action.startsWith("audit.")) return "evidence";
  return "lifecycle";
}

export class AuditLogger {
  private prevHash: string = "0000000000000000000000000000000000000000000000000000000000000000";

  constructor(private logPath: string) {}

  append(action: string, runId: string, details: Record<string, unknown>, actor: string = "system"): void {
    const timestamp = isoNow();
    const category = resolveCategory(action);
    const payload = JSON.stringify({ timestamp, action, category, run_id: runId, actor, details, prev_hash: this.prevHash });
    const hash = sha256(payload);

    const entry: AuditEntry = {
      timestamp,
      action,
      category,
      run_id: runId,
      actor,
      details,
      prev_hash: this.prevHash,
      hash,
    };

    appendJsonl(this.logPath, entry);
    this.prevHash = hash;
  }

  verifyChain(): { valid: boolean; entries_checked: number; first_invalid_index?: number } {
    if (!existsSync(this.logPath)) {
      return { valid: true, entries_checked: 0 };
    }

    const content = readFileSync(this.logPath, "utf-8").trim();
    if (!content) {
      return { valid: true, entries_checked: 0 };
    }

    const lines = content.split("\n");
    let expectedPrevHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < lines.length; i++) {
      const entry: AuditEntry = JSON.parse(lines[i]);

      if (entry.prev_hash !== expectedPrevHash) {
        return { valid: false, entries_checked: i + 1, first_invalid_index: i };
      }

      const { hash: _storedHash, ...rest } = entry;
      const payload = JSON.stringify({
        timestamp: rest.timestamp,
        action: rest.action,
        category: rest.category,
        run_id: rest.run_id,
        actor: rest.actor,
        details: rest.details,
        prev_hash: rest.prev_hash,
      });
      const computedHash = sha256(payload);

      if (computedHash !== _storedHash) {
        return { valid: false, entries_checked: i + 1, first_invalid_index: i };
      }

      expectedPrevHash = _storedHash;
    }

    return { valid: true, entries_checked: lines.length };
  }
}
