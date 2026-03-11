export type MetricCategory =
  | "count"
  | "gauge"
  | "rate"
  | "ratio"
  | "duration"
  | "percentile"
  | "score"
  | "status"
  | "trend"
  | "distribution";

export type MetricUnit =
  | "count"
  | "percent"
  | "ratio"
  | "ms"
  | "seconds"
  | "minutes"
  | "hours"
  | "bytes"
  | "kb"
  | "mb"
  | "gb"
  | "tokens"
  | "currency"
  | "status"
  | "score";

export type MetricWindow = "live" | "5m" | "15m" | "1h" | "24h" | "7d" | "30d" | "all";

export type AggregationMethod =
  | "sum"
  | "count"
  | "avg"
  | "min"
  | "max"
  | "latest"
  | "rate"
  | "ratio"
  | "p50"
  | "p95"
  | "p99"
  | "custom";

export type MetricDefinition = {
  metric_key: string;
  metric_version: string;

  label: string;
  description: string;
  domain_id: string;
  category: MetricCategory | string;

  unit: MetricUnit | string;
  value_type: "number" | "integer" | "string" | "boolean" | "status";

  source_event_types: string[];
  required_dimensions: string[];
  optional_dimensions: string[];
  supported_windows: MetricWindow[];

  aggregation_method: AggregationMethod | string;
  computation_kind: "direct" | "derived" | "composite" | "snapshot";
  formula_ref: string;
  formula_version: string;

  freshness_sla_ms: number;
  late_data_tolerance_ms?: number;

  owner_component: string;
  owner_role?: string;

  quality_tier: "critical" | "high" | "standard" | "experimental";
  consumer_surfaces?: string[];

  default_dimensions?: Record<string, string | number | boolean>;
  default_window?: MetricWindow;

  status: "active" | "deprecated" | "disabled" | "draft";
  deprecated_by?: string;
  replacement_metric_key?: string;
  notes?: string;
};
