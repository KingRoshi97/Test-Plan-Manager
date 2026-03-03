import type { ActionType } from '../allowlist.js';
import type { OutcomeStatus } from '../schemas/common.js';

export interface CommandResult {
  action_id: string;
  action_type: ActionType;
  outcome: OutcomeStatus;
  exit_code: number;
  stdout_path: string;
  stderr_path: string;
  combined_path: string;
}

export function buildCommand(
  _actionType: ActionType,
  _args: Record<string, unknown>
): string {
  throw new Error('not implemented');
}

export async function executeAxionCommand(
  _actionType: ActionType,
  _args: Record<string, unknown>
): Promise<CommandResult> {
  throw new Error('not implemented');
}
