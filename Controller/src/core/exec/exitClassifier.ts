import type { OutcomeStatus } from '../schemas/common.js';

export function classifyExit(_exitCode: number, _stderr: string): OutcomeStatus {
  throw new Error('not implemented');
}
