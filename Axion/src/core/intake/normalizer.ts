import { NotImplementedError } from "../../utils/errors.js";

export interface NormalizedInputRecord {
  submission_id: string;
  normalized_at: string;
  routing: RoutingSnapshot;
  project: ProjectInfo;
  spec: SpecSnapshot;
  constraints: Record<string, unknown>;
  raw_hash: string;
}

export interface RoutingSnapshot {
  skill_level: string;
  category: string;
  type_preset: string;
  build_target: string;
  audience_context: string;
}

export interface ProjectInfo {
  project_name: string;
  project_overview: string;
}

export interface SpecSnapshot {
  must_have_features: Array<{ name: string; description?: string }>;
  roles: Array<{ name: string; description?: string; primary_goal?: string }>;
  workflows: Array<{
    name: string;
    actor_role: string;
    steps: string[];
    success_outcome: string;
    failure_states?: string;
    priority?: string;
  }>;
}

export function normalizeSubmission(_rawSubmission: unknown): NormalizedInputRecord {
  throw new NotImplementedError("normalizeSubmission");
}
