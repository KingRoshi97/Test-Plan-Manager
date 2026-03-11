import crypto from "crypto";
import { getCardDefinition, getMetricDefinition, METRIC_REGISTRY, CARD_REGISTRY } from "./analytics-registry.js";
import { getSnapshot, refreshSnapshot, refreshAllSnapshots } from "./analytics-snapshots.js";
import { db } from "../db.js";
import { analyticsEvents, analyticsSnapshots, analyticsTrends } from "../../shared/schema.js";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getWindowBounds, hashDimensions } from "./analytics-aggregator.js";
import type { AnalyticsCardResponse } from "../../shared/analytics/card-registry.js";
import type { AnalyticsApiResponse, AnalyticsDimensions } from "../../shared/analytics/api-types.js";
import type { MetricSnapshot, TrendPoint } from "../../shared/analytics/snapshot-store.js";

function makeRequestId(): string {
  return `req_${crypto.randomUUID().slice(0, 12)}`;
}

function buildMeta(opts: {
  window?: string;
  dimensions?: AnalyticsDimensions;
  snapshot?: MetricSnapshot | null;
  metricKey?: string;
  cardId?: string;
}) {
  return {
    request_id: makeRequestId(),
    requested_at: new Date().toISOString(),
    window: opts.window,
    dimensions: opts.dimensions,
    freshness: opts.snapshot
      ? {
          computed_at: opts.snapshot.computed_at,
          source_data_through: opts.snapshot.source_data_through,
          freshness_sla_ms: opts.snapshot.freshness_sla_ms,
          stale: opts.snapshot.stale,
          confidence: opts.snapshot.confidence,
        }
      : undefined,
    registry_refs: {
      metric_key: opts.metricKey,
      card_id: opts.cardId,
    },
  };
}

function formatValue(value: number | string | boolean | null, unit: string, precision?: number): string | number | null {
  if (value === null) return null;
  if (typeof value === "number" && precision !== undefined) {
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
  }
  return value;
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export async function getCard(
  cardId: string,
  window?: string,
  dimensions?: AnalyticsDimensions
): Promise<AnalyticsApiResponse<AnalyticsCardResponse>> {
  const cardDef = getCardDefinition(cardId);
  if (!cardDef) {
    return {
      ok: false,
      error: { code: "CARD_NOT_FOUND", message: `Card "${cardId}" not found in registry` },
      meta: { request_id: makeRequestId(), requested_at: new Date().toISOString() },
    };
  }

  if (cardDef.status === "disabled") {
    return {
      ok: true,
      data: {
        card_id: cardDef.card_id,
        card_version: cardDef.card_version,
        title: cardDef.title,
        subtitle: cardDef.subtitle,
        category: cardDef.category,
        visualization: cardDef.visualization,
        value_shape: cardDef.value_shape,
        value: null,
        state: "disabled",
      },
      meta: buildMeta({ cardId }),
    };
  }

  const resolvedWindow = window || cardDef.default_window;
  const resolvedDimensions = { ...(cardDef.default_dimensions || {}), ...(dimensions || {}) } as Record<string, string | number | boolean | null>;

  if (!cardDef.metric_key) {
    return {
      ok: false,
      error: { code: "NO_METRIC", message: `Card "${cardId}" has no metric_key` },
      meta: buildMeta({ window: resolvedWindow, cardId }),
    };
  }

  try {
    const snapshot = await getSnapshot(cardDef.metric_key, resolvedWindow, resolvedDimensions);
    if (!snapshot) {
      return {
        ok: true,
        data: {
          card_id: cardDef.card_id,
          card_version: cardDef.card_version,
          title: cardDef.title,
          subtitle: cardDef.subtitle,
          category: cardDef.category,
          visualization: cardDef.visualization,
          value_shape: cardDef.value_shape,
          value: null,
          unit: cardDef.unit,
          state: "empty",
        },
        meta: buildMeta({ window: resolvedWindow, dimensions: resolvedDimensions, cardId }),
      };
    }

    const formattedValue = formatValue(
      snapshot.value as number | string | boolean | null,
      cardDef.unit || "count",
      cardDef.precision
    );

    let secondaryValue: string | undefined;
    if (cardDef.unit === "ms" && typeof snapshot.value === "number") {
      secondaryValue = formatDuration(snapshot.value as number);
    }

    const cardResponse: AnalyticsCardResponse = {
      card_id: cardDef.card_id,
      card_version: cardDef.card_version,
      title: cardDef.title,
      subtitle: cardDef.subtitle,
      category: cardDef.category,
      visualization: cardDef.visualization,
      value_shape: cardDef.value_shape,
      value: formattedValue,
      secondary_value: secondaryValue,
      unit: cardDef.unit,
      precision: cardDef.precision,
      status: snapshot.status,
      state: snapshot.stale ? "stale" : "ready",
      updated_at: snapshot.computed_at,
      source_data_through: snapshot.source_data_through,
      drilldown_target: cardDef.drilldown_target,
    };

    return {
      ok: true,
      data: cardResponse,
      meta: buildMeta({
        window: resolvedWindow,
        dimensions: resolvedDimensions,
        snapshot,
        metricKey: cardDef.metric_key,
        cardId,
      }),
    };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "COMPUTATION_ERROR",
        message: `Failed to compute card "${cardId}": ${err instanceof Error ? err.message : String(err)}`,
      },
      meta: buildMeta({ window: resolvedWindow, cardId }),
    };
  }
}

export async function getCards(
  cardIds: Array<{ card_id: string; window?: string; dimensions?: AnalyticsDimensions }>
): Promise<AnalyticsApiResponse<AnalyticsCardResponse[]>> {
  const results: AnalyticsCardResponse[] = [];

  for (const req of cardIds) {
    const response = await getCard(req.card_id, req.window, req.dimensions);
    if (response.ok && response.data) {
      results.push(response.data);
    } else {
      results.push({
        card_id: req.card_id,
        card_version: "0.0.0",
        title: req.card_id,
        category: "stat",
        visualization: "single_value",
        value_shape: "scalar",
        value: null,
        state: "error",
        status: "unknown",
      });
    }
  }

  return {
    ok: true,
    data: results,
    meta: {
      request_id: makeRequestId(),
      requested_at: new Date().toISOString(),
    },
  };
}

export async function getMetric(
  metricKey: string,
  window?: string,
  dimensions?: AnalyticsDimensions
): Promise<AnalyticsApiResponse<MetricSnapshot>> {
  const def = getMetricDefinition(metricKey);
  if (!def) {
    return {
      ok: false,
      error: { code: "METRIC_NOT_FOUND", message: `Metric "${metricKey}" not found in registry` },
      meta: { request_id: makeRequestId(), requested_at: new Date().toISOString() },
    };
  }

  const resolvedWindow = window || def.default_window || def.supported_windows[0];
  const resolvedDimensions = (dimensions || {}) as Record<string, string | number | boolean | null>;

  const snapshot = await getSnapshot(metricKey, resolvedWindow, resolvedDimensions);
  if (!snapshot) {
    return {
      ok: false,
      error: { code: "SNAPSHOT_UNAVAILABLE", message: `No snapshot available for "${metricKey}"` },
      meta: buildMeta({ window: resolvedWindow, metricKey }),
    };
  }

  return {
    ok: true,
    data: snapshot,
    meta: buildMeta({ window: resolvedWindow, dimensions: resolvedDimensions, snapshot, metricKey }),
  };
}

export async function getMetricTrend(
  metricKey: string,
  start: string,
  end: string,
  granularity: string,
  dimensions?: AnalyticsDimensions
): Promise<AnalyticsApiResponse<TrendPoint[]>> {
  const def = getMetricDefinition(metricKey);
  if (!def) {
    return {
      ok: false,
      error: { code: "METRIC_NOT_FOUND", message: `Metric "${metricKey}" not found in registry` },
      meta: { request_id: makeRequestId(), requested_at: new Date().toISOString() },
    };
  }

  const dimHash = hashDimensions((dimensions || {}) as Record<string, string | number | boolean | null>);

  const rows = await db
    .select()
    .from(analyticsTrends)
    .where(
      and(
        eq(analyticsTrends.metricKey, metricKey),
        gte(analyticsTrends.bucketStart, new Date(start)),
        lte(analyticsTrends.bucketEnd, new Date(end)),
        eq(analyticsTrends.bucketGranularity, granularity),
        eq(analyticsTrends.dimensionsHash, dimHash)
      )
    )
    .orderBy(analyticsTrends.bucketStart);

  const points: TrendPoint[] = rows.map((row) => ({
    point_id: row.pointId,
    metric_key: row.metricKey,
    metric_version: row.metricVersion,
    formula_version: row.formulaVersion,
    bucket_start: row.bucketStart.toISOString(),
    bucket_end: row.bucketEnd.toISOString(),
    bucket_granularity: row.bucketGranularity,
    dimensions: row.dimensions as Record<string, string | number | boolean | null>,
    dimensions_hash: row.dimensionsHash,
    value: row.value ?? null,
    value_type: row.valueType,
    unit: row.unit,
    confidence: row.confidence as "high" | "medium" | "low",
    quality_flags: row.qualityFlags as string[] | undefined,
    backfilled: row.backfilled,
    corrected: row.corrected,
    computed_at: row.computedAt.toISOString(),
    source_data_through: row.sourceDataThrough?.toISOString(),
    evidence_refs: row.evidenceRefs as string[] | undefined,
    lineage_ref: row.lineageRef || undefined,
  }));

  return {
    ok: true,
    data: points,
    meta: {
      request_id: makeRequestId(),
      requested_at: new Date().toISOString(),
      start,
      end,
      granularity,
      dimensions,
      registry_refs: { metric_key: metricKey },
    },
  };
}

export function listMetrics() {
  return METRIC_REGISTRY.filter((m) => m.status === "active").map((m) => ({
    metric_key: m.metric_key,
    label: m.label,
    domain_id: m.domain_id,
    category: m.category,
    unit: m.unit,
    supported_windows: m.supported_windows,
    quality_tier: m.quality_tier,
  }));
}

export function listCards() {
  return CARD_REGISTRY.filter((c) => c.status === "active").map((c) => ({
    card_id: c.card_id,
    title: c.title,
    domain_id: c.domain_id,
    category: c.category,
    visualization: c.visualization,
    metric_key: c.metric_key,
    supported_windows: c.supported_windows,
    quality_tier: c.quality_tier,
    consumer_surfaces: c.consumer_surfaces,
  }));
}

export async function getEngineHealth(): Promise<{
  status: string;
  metrics_registered: number;
  cards_registered: number;
  events_total: number;
  snapshots_total: number;
}> {
  const eventsCount = await db.select({ count: sql<number>`count(*)` }).from(analyticsEvents);
  const snapshotsCount = await db.select({ count: sql<number>`count(*)` }).from(analyticsSnapshots);

  return {
    status: "operational",
    metrics_registered: METRIC_REGISTRY.filter((m) => m.status === "active").length,
    cards_registered: CARD_REGISTRY.filter((c) => c.status === "active").length,
    events_total: Number(eventsCount[0]?.count ?? 0),
    snapshots_total: Number(snapshotsCount[0]?.count ?? 0),
  };
}

export { refreshAllSnapshots };
