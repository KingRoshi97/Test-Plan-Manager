export type ActionType =
  | 'doctor'
  | 'run_start'
  | 'run_advance'
  | 'run_stage'
  | 'run_rerun_stage'
  | 'run_close'
  | 'verify'
  | 'pack'
  | 'repro';

export interface ActionDefinition {
  action_type: ActionType;
  cli_template: string;
  required_return_pointers: string[];
  audit_fields: string[];
}

export const ACTION_MAP: Record<ActionType, ActionDefinition> = {
  doctor: {
    action_type: 'doctor',
    cli_template: 'axion doctor',
    required_return_pointers: ['report', 'logs'],
    audit_fields: [],
  },
  run_start: {
    action_type: 'run_start',
    cli_template: 'axion run --mode {mode_id} --profile {run_profile_id} --risk {risk_class} --executor {executor_type_default} --targets {targets}',
    required_return_pointers: ['manifest', 'logs'],
    audit_fields: ['mode_id', 'run_profile_id', 'risk_class', 'executor_type_default', 'targets'],
  },
  run_advance: {
    action_type: 'run_advance',
    cli_template: 'axion run --advance --run {run_id}',
    required_return_pointers: ['manifest', 'stage_report', 'logs'],
    audit_fields: ['run_id'],
  },
  run_stage: {
    action_type: 'run_stage',
    cli_template: 'axion stage --run {run_id} --stage {stage_id}',
    required_return_pointers: ['manifest', 'stage_report', 'logs'],
    audit_fields: ['run_id', 'stage_id'],
  },
  run_rerun_stage: {
    action_type: 'run_rerun_stage',
    cli_template: 'axion stage --rerun --run {run_id} --stage {stage_id}',
    required_return_pointers: ['manifest', 'stage_report', 'logs'],
    audit_fields: ['run_id', 'stage_id'],
  },
  run_close: {
    action_type: 'run_close',
    cli_template: 'axion run --close --run {run_id}',
    required_return_pointers: ['manifest', 'logs'],
    audit_fields: ['run_id'],
  },
  verify: {
    action_type: 'verify',
    cli_template: 'axion verify --run {run_id}',
    required_return_pointers: ['verification_result', 'logs'],
    audit_fields: ['run_id'],
  },
  pack: {
    action_type: 'pack',
    cli_template: 'axion pack --run {run_id} --variant {kit_variant}',
    required_return_pointers: ['kit_manifest', 'kit_entrypoint', 'bundle_metadata', 'bundle_export', 'logs'],
    audit_fields: ['run_id', 'kit_variant'],
  },
  repro: {
    action_type: 'repro',
    cli_template: 'axion repro --run {run_id}',
    required_return_pointers: ['repro_report', 'logs'],
    audit_fields: ['run_id'],
  },
};

export function isAllowedAction(action: string): action is ActionType {
  return action in ACTION_MAP;
}
