import { NotImplementedError } from "../../utils/errors.js";
import type { CompletionReport } from "./completion.js";

export interface VerificationContext {
  run_id: string;
  run_dir: string;
  policy_path?: string;
}

export function runVerification(_ctx: VerificationContext): CompletionReport {
  throw new NotImplementedError("runVerification");
}
