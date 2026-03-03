import type { OutcomeStatus, Pointer } from '../schemas/common.js';

export interface ActionLogEntry {
  action_id: string;
  timestamp: string;
  action_type: string;
  request_payload: Record<string, unknown>;
  command_executed: string;
  outcome: OutcomeStatus;
  artifact_pointers: Pointer[];
  log_pointers: Pointer[];
}

export function generateActionId(): string {
  throw new Error('not implemented');
}

export async function writeActionLog(_entry: ActionLogEntry): Promise<void> {
  throw new Error('not implemented');
}
