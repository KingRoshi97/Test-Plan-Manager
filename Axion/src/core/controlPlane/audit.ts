import { appendJsonl } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";

export interface AuditEntry {
  timestamp: string;
  action: string;
  run_id: string;
  details: Record<string, unknown>;
  prev_hash: string;
  hash: string;
}

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
}
