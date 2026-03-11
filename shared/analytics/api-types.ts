export type AnalyticsDimensions = Record<string, string | number | boolean | null>;

export type AnalyticsCommonQuery = {
  window?: "live" | "5m" | "15m" | "1h" | "24h" | "7d" | "30d" | "all";
  granularity?: "1m" | "5m" | "15m" | "1h" | "1d" | "7d" | "30d";
  start?: string;
  end?: string;
  compare_window?: string;
  include_evidence?: boolean;
  include_lineage?: boolean;
  include_registry_meta?: boolean;
  dimensions?: AnalyticsDimensions;
  filters?: Record<string, string | number | boolean | null>;
};

export type AnalyticsApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    request_id: string;
    requested_at: string;
    window?: string;
    granularity?: string;
    start?: string;
    end?: string;
    compare_window?: string;
    dimensions?: AnalyticsDimensions;
    filters?: Record<string, string | number | boolean | null>;
    freshness?: {
      computed_at?: string;
      source_data_through?: string;
      freshness_sla_ms?: number;
      stale?: boolean;
      confidence?: "high" | "medium" | "low";
      quality_flags?: string[];
    };
    registry_refs?: {
      metric_key?: string;
      metric_version?: string;
      card_id?: string;
      card_version?: string;
      query_ref?: string;
      query_version?: string;
      dashboard_id?: string;
      dashboard_version?: string;
      formula_version?: string;
      lineage_ref?: string;
    };
  };
};

export type BatchCardReadRequest = {
  cards: Array<{
    card_id: string;
    window?: string;
    compare_window?: string;
    dimensions?: AnalyticsDimensions;
  }>;
  include_evidence?: boolean;
  include_lineage?: boolean;
};

export type TrendReadRequest = {
  metric_key: string;
  start: string;
  end: string;
  granularity: string;
  dimensions?: AnalyticsDimensions;
  include_evidence?: boolean;
};
