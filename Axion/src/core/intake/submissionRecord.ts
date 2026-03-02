import { NotImplementedError } from "../../utils/errors.js";

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
  _runDir: string,
  _submission: unknown,
  _schemaVersion: string
): SubmissionRecord {
  throw new NotImplementedError("writeSubmissionRecord");
}

export function loadSubmissionRecord(_runDir: string): SubmissionRecord {
  throw new NotImplementedError("loadSubmissionRecord");
}
