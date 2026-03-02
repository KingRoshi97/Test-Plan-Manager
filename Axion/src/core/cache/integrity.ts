import { NotImplementedError } from "../../utils/errors.js";

export interface IntegrityCheckResult {
  valid: boolean;
  checked: number;
  corrupted: Array<{ path: string; expected_hash: string; actual_hash: string }>;
  missing: string[];
}

export function checkIntegrity(_cachePath: string): IntegrityCheckResult {
  throw new NotImplementedError("checkIntegrity");
}

export function repairCache(_cachePath: string, _result: IntegrityCheckResult): void {
  throw new NotImplementedError("repairCache");
}
