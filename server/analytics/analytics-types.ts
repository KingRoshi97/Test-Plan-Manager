export type AnalyticsSourceDomain = {
  domain_id: string;
  domain_name: string;
  owning_component: string;
  primary_producers: string[];
  required_dimensions: string[];
  event_contract_version: string;
  mvp_required: boolean;
  realtime_required: boolean;
};

export const SOURCE_DOMAINS: AnalyticsSourceDomain[] = [
  {
    domain_id: "system_runtime",
    domain_name: "System Runtime",
    owning_component: "system-monitor",
    primary_producers: ["healthcheck", "process-monitor", "resource-tracker"],
    required_dimensions: ["environment"],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: true,
  },
  {
    domain_id: "control_plane",
    domain_name: "Control Plane",
    owning_component: "control-plane-api",
    primary_producers: ["release-manager", "policy-engine", "pin-manager"],
    required_dimensions: ["environment"],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: true,
  },
  {
    domain_id: "run_lifecycle",
    domain_name: "Run Lifecycle",
    owning_component: "run-orchestrator",
    primary_producers: ["pipeline-runner", "run-manager"],
    required_dimensions: ["run_id"],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: true,
  },
  {
    domain_id: "stage_execution",
    domain_name: "Stage Execution",
    owning_component: "stage-executor",
    primary_producers: ["stage-runner", "stage-reporter"],
    required_dimensions: ["run_id", "stage_id"],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: true,
  },
  {
    domain_id: "gate_evaluation",
    domain_name: "Gate Evaluation",
    owning_component: "gate-engine",
    primary_producers: ["gate-evaluator", "gate-reporter"],
    required_dimensions: ["run_id", "gate_id"],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: true,
  },
  {
    domain_id: "artifact_production",
    domain_name: "Artifact Production",
    owning_component: "artifact-manager",
    primary_producers: ["artifact-writer", "manifest-builder"],
    required_dimensions: ["run_id"],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: false,
  },
  {
    domain_id: "maintenance",
    domain_name: "Maintenance System",
    owning_component: "maintenance-engine",
    primary_producers: ["mus-engine", "maintenance-scheduler"],
    required_dimensions: [],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: false,
  },
  {
    domain_id: "agent_operations",
    domain_name: "Agent Operations",
    owning_component: "agent-manager",
    primary_producers: ["openai-bridge", "agent-orchestrator"],
    required_dimensions: [],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: false,
  },
  {
    domain_id: "verification",
    domain_name: "Verification + Test Systems",
    owning_component: "verification-engine",
    primary_producers: ["avcs-engine", "proof-capture"],
    required_dimensions: ["run_id"],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: false,
  },
  {
    domain_id: "cost_resources",
    domain_name: "Cost + Resource Usage",
    owning_component: "cost-tracker",
    primary_producers: ["token-meter", "compute-monitor"],
    required_dimensions: [],
    event_contract_version: "1.0.0",
    mvp_required: true,
    realtime_required: false,
  },
];

export type IngestionResult = {
  accepted: boolean;
  event_id: string;
  errors?: string[];
  warnings?: string[];
};

export type SnapshotComputeResult = {
  metric_key: string;
  window: string;
  value: number | string | boolean | null;
  computed_at: string;
  stale: boolean;
};
