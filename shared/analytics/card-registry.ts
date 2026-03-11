export type CardVisualization =
  | "single_value"
  | "value_with_delta"
  | "sparkline"
  | "table"
  | "bar_chart"
  | "line_chart"
  | "distribution"
  | "status_indicator"
  | "leaderboard";

export type CardDefinition = {
  card_id: string;
  card_version: string;
  title: string;
  subtitle?: string;
  description: string;
  domain_id: string;
  category: "stat" | "status" | "trend" | "leaderboard" | "summary" | "composite";
  visualization: CardVisualization | string;
  source_kind: "metric" | "composite_query" | "snapshot";
  metric_key?: string;
  query_ref?: string;
  required_dimensions: string[];
  optional_dimensions: string[];
  default_dimensions?: Record<string, string | number | boolean>;
  supported_windows: string[];
  default_window: string;
  refresh_mode: "realtime" | "poll" | "manual";
  refresh_interval_ms?: number;
  value_shape: "scalar" | "scalar_with_delta" | "table_rows" | "timeseries" | "status";
  unit?: string;
  precision?: number;
  drilldown_target?: string;
  drilldown_query_ref?: string;
  evidence_mode?: "none" | "summary" | "full";
  stale_behavior: "show_last_with_warning" | "show_stale_state" | "hide_value" | "manual_refresh_only";
  empty_behavior: "show_zero" | "show_empty_state" | "show_not_applicable";
  error_behavior: "show_error_state" | "show_last_known_value";
  consumer_surfaces: string[];
  placement_tags?: string[];
  permission_scope?: string[];
  quality_tier: "critical" | "high" | "standard" | "experimental";
  status: "active" | "deprecated" | "disabled" | "draft";
  replacement_card_id?: string;
  notes?: string;
};

export type AnalyticsCardResponse = {
  card_id: string;
  card_version: string;
  title: string;
  subtitle?: string;
  category: string;
  visualization: string;
  value_shape: string;
  value: number | string | boolean | null | Array<Record<string, unknown>>;
  secondary_value?: string | number | null;
  delta?: {
    direction: "up" | "down" | "flat";
    absolute?: number;
    percent?: number;
    compare_window?: string;
  };
  unit?: string;
  precision?: number;
  status?: "ok" | "warn" | "fail" | "unknown";
  state: "ready" | "stale" | "empty" | "error" | "unauthorized" | "disabled";
  updated_at?: string;
  source_data_through?: string;
  drilldown_target?: string;
  evidence_summary?: {
    available: boolean;
    count?: number;
    lineage_ref?: string;
  };
};
