import { NotImplementedError } from "../../utils/errors.js";

export interface IncrementalPlan {
  reuse: Array<{ stage: string; cache_key: string; reason: string }>;
  rebuild: Array<{ stage: string; reason: string }>;
  invalidated: Array<{ stage: string; cache_key: string; reason: string }>;
}

export function planIncremental(_previousRunDir: string, _currentInputs: unknown): IncrementalPlan {
  throw new NotImplementedError("planIncremental");
}

export function shouldReuse(_stage: string, _previousHash: string, _currentHash: string): boolean {
  throw new NotImplementedError("shouldReuse");
}
