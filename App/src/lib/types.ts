export interface Run {
  run_id: string;
  status: 'pass' | 'fail' | 'running' | 'pending';
  created_at: string;
  stages: StageReport[];
  gates: GateReport[];
}

export interface StageReport {
  stage_id: string;
  status: 'pass' | 'fail' | 'skip' | 'not_started' | 'in_progress';
  started_at: string;
  ended_at: string;
  artifacts: string[];
}

export interface GateReport {
  gate_id: string;
  stage_id: string;
  status: 'pass' | 'fail';
  evaluated_at: string;
  checks: GateCheck[];
  failure_codes: string[];
}

export interface GateCheck {
  check_id: string;
  status: 'pass' | 'fail';
  failure_code: string | null;
  evidence: EvidenceEntry[];
}

export interface EvidenceEntry {
  type: string;
  path: string;
  hash?: string;
}

export interface ProofEntry {
  proof_id: string;
  proof_type: string;
  run_id: string;
  stage_id: string;
  created_at: string;
  payload: Record<string, unknown>;
}

export interface KitManifest {
  kit_id: string;
  run_id: string;
  version: string;
  created_at: string;
  entry_point: string;
  artifacts: KitArtifact[];
}

export interface KitArtifact {
  path: string;
  hash: string;
  size: number;
}

export interface RegistryEntry {
  id: string;
  name: string;
  type: string;
  description: string;
  data: Record<string, unknown>;
}

export interface Template {
  template_id: string;
  title: string;
  type: string;
  template_version: string;
  file_path: string;
  status: string;
  requiredness: string;
  compliance_gate_id: string;
}

export type RunStatus = 'pass' | 'fail' | 'running' | 'pending';
export type StageStatus = 'pass' | 'fail' | 'skip' | 'not_started' | 'in_progress';
export type GateStatus = 'pass' | 'fail';
