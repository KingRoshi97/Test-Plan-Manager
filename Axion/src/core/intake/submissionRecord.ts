import { join } from "node:path";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { writeJson, readJson } from "../../utils/fs.js";
import { canonicalJsonString } from "../../utils/canonicalJson.js";

export interface SubmissionRecord {
  submission_id: string;
  received_at: string;
  schema_version: string;
  payload_hash: string;
  payload: unknown;
  metadata: {
    source: string;
    ip?: string;
    user_agent?: string;
  };
}

export function writeSubmissionRecord(
  runDir: string,
  submission: unknown,
  schemaVersion: string
): SubmissionRecord {
  const payloadStr = canonicalJsonString(submission);
  const payloadHash = sha256(payloadStr);
  const sub = submission as Record<string, unknown>;

  const record: SubmissionRecord = {
    submission_id: String(sub.submission_id ?? `SUB-${Date.now()}`),
    received_at: isoNow(),
    schema_version: schemaVersion,
    payload_hash: payloadHash,
    payload: submission,
    metadata: {
      source: "axion-cli",
    },
  };

  writeJson(join(runDir, "intake", "submission_record.json"), record);
  return record;
}

export function loadSubmissionRecord(runDir: string): SubmissionRecord {
  return readJson<SubmissionRecord>(join(runDir, "intake", "submission_record.json"));
}
