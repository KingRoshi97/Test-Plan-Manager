import { join } from "node:path";
import { sha256 } from "../../utils/hash.js";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";

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
  const canonicalPayload = JSON.stringify(submission, Object.keys(submission as Record<string, unknown>).sort(), 0);
  const payloadHash = sha256(canonicalPayload);
  const submissionId = `SUB-${payloadHash.slice(0, 12)}`;

  const record: SubmissionRecord = {
    submission_id: submissionId,
    received_at: isoNow(),
    schema_version: schemaVersion,
    payload_hash: payloadHash,
    payload: submission,
    metadata: {
      source: "cli",
    },
  };

  const intakeDir = join(runDir, "intake");
  ensureDir(intakeDir);
  writeJson(join(intakeDir, "submission_record.json"), record);

  return record;
}

export function loadSubmissionRecord(runDir: string): SubmissionRecord {
  const filePath = join(runDir, "intake", "submission_record.json");
  return readJson<SubmissionRecord>(filePath);
}
