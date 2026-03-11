export type AnalyticsEventEnvelope = {
  event_id: string;
  event_type: string;
  event_version: string;

  domain_id: string;
  source_system: string;
  source_component: string;
  source_instance_id?: string;

  occurred_at: string;
  recorded_at: string;
  accepted_at?: string;

  environment: "local" | "dev" | "test" | "staging" | "prod" | string;
  org_id?: string;
  workspace_id?: string;
  project_id?: string;

  actor_type?: "user" | "agent" | "system" | "job" | "service" | string;
  actor_id?: string;
  actor_role?: string;

  entity_type?: string;
  entity_id?: string;

  run_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  gate_id?: string;
  artifact_id?: string;
  template_id?: string;
  plan_id?: string;

  maintenance_run_id?: string;
  maintenance_mode_id?: string;
  finding_id?: string;
  proposal_id?: string;
  schedule_id?: string;

  approval_id?: string;
  policy_id?: string;
  override_id?: string;

  severity?: "debug" | "info" | "warn" | "error" | "critical";
  status?: string;
  outcome?: "success" | "failure" | "partial" | "skipped" | "unknown" | string;

  dimensions?: Record<string, string | number | boolean | null>;
  payload: Record<string, unknown>;

  evidence_refs?: string[];
  tags?: string[];

  correlation_id?: string;
  causation_id?: string;
  parent_event_id?: string;
  trace_id?: string;
  span_id?: string;

  dedupe_key?: string;
  ttl_class?: "short" | "medium" | "long" | "permanent" | string;
};

export const REQUIRED_ENVELOPE_FIELDS: (keyof AnalyticsEventEnvelope)[] = [
  "event_id",
  "event_type",
  "event_version",
  "domain_id",
  "source_system",
  "source_component",
  "occurred_at",
  "recorded_at",
  "environment",
  "payload",
];

export const VALID_DOMAIN_IDS = [
  "system_runtime",
  "control_plane",
  "run_lifecycle",
  "stage_execution",
  "gate_evaluation",
  "artifact_production",
  "template_rendering",
  "planning_coverage",
  "maintenance",
  "agent_operations",
  "verification",
  "registries_libraries",
  "approvals_governance",
  "audit_operator",
  "jobs_scheduling",
  "adapters_integrations",
  "notifications_alerts",
  "cost_resources",
  "ui_telemetry",
] as const;

export type DomainId = (typeof VALID_DOMAIN_IDS)[number];
