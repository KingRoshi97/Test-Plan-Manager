import { db } from "../db.js";
import { analyticsSnapshots, analyticsEvents } from "../../shared/schema.js";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { hashDimensions, getWindowBounds } from "./analytics-aggregator.js";
import { computeFromPipelineRuns, computeSystemHealth, countEvents, computeRate } from "./analytics-aggregator.js";
import { getMetricDefinition, METRIC_REGISTRY } from "./analytics-registry.js";
import type { MetricSnapshot } from "../../shared/analytics/snapshot-store.js";

async function computeMetricValue(metricKey: string, window: string): Promise<number | null> {
  const baseKey = metricKey.replace(/\.\d+[hmd]$/, "").replace(/\.live$/, "");

  const directDbMetrics: Record<string, string> = {
    "runs.active.count": "runs.active.count.live",
    "runs.started.count": "runs.started.count",
    "runs.completed.count": "runs.completed.count",
    "runs.failed.count": "runs.failed.count",
    "runs.success.rate": "runs.success.rate",
    "runs.blocked.count": "runs.blocked.count",
    "runs.duration.avg": "runs.duration.avg",
  };

  if (directDbMetrics[baseKey]) {
    return computeFromPipelineRuns(directDbMetrics[baseKey], window);
  }

  switch (baseKey) {
    case "system.health.score":
      return computeSystemHealth();

    case "stages.failures.count":
      return countEvents(["stage_failed"], window);

    case "stages.duration.avg": {
      const { start, end } = getWindowBounds(window);
      const result = await db
        .select({
          avg: sql<number>`AVG(COALESCE(("envelope"->'payload'->>'duration_ms')::numeric, 0))`,
        })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, "stage_completed"),
            gte(analyticsEvents.occurredAt, start),
            lte(analyticsEvents.occurredAt, end)
          )
        );
      return result[0]?.avg ? Math.round(Number(result[0].avg)) : 0;
    }

    case "gates.failed.count":
      return countEvents(["gate_failed"], window);

    case "artifacts.generated.count":
      return countEvents(["artifact_generated"], window);

    case "maintenance.executions.count":
      return countEvents(["maintenance_mode_completed", "maintenance_mode_started"], window);

    case "verification.pass.rate":
      return computeRate(["verification_passed"], ["verification_passed", "verification_failed"], window);

    case "cost.tokens.total": {
      const { start: tStart, end: tEnd } = getWindowBounds(window);
      const tokenResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(("envelope"->'payload'->>'token_count')::numeric), 0)`,
        })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, "token_usage_recorded"),
            gte(analyticsEvents.occurredAt, tStart),
            lte(analyticsEvents.occurredAt, tEnd)
          )
        );
      return tokenResult[0]?.total ? Math.round(Number(tokenResult[0].total)) : 0;
    }

    default:
      return null;
  }
}

export async function refreshSnapshot(metricKey: string, window: string, dimensions: Record<string, string | number | boolean | null> = {}): Promise<MetricSnapshot | null> {
  const def = getMetricDefinition(metricKey);
  if (!def) return null;

  const value = await computeMetricValue(metricKey, window);
  const now = new Date();
  const dimHash = hashDimensions(dimensions);

  const snapshot: MetricSnapshot = {
    snapshot_id: `snap_${metricKey}_${window}_${dimHash}`,
    metric_key: metricKey,
    metric_version: def.metric_version,
    formula_version: def.formula_version,
    window,
    dimensions,
    dimensions_hash: dimHash,
    value: value ?? 0,
    value_type: def.value_type,
    unit: def.unit,
    status: "ok",
    confidence: "high",
    computed_at: now.toISOString(),
    source_data_through: now.toISOString(),
    freshness_sla_ms: def.freshness_sla_ms,
    stale: false,
  };

  const existing = await db
    .select({ id: analyticsSnapshots.id })
    .from(analyticsSnapshots)
    .where(
      and(
        eq(analyticsSnapshots.metricKey, metricKey),
        eq(analyticsSnapshots.window, window),
        eq(analyticsSnapshots.dimensionsHash, dimHash)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(analyticsSnapshots)
      .set({
        value: typeof value === "number" ? value : null,
        valueText: typeof value === "string" ? value : null,
        valueType: def.value_type,
        unit: def.unit,
        status: "ok",
        confidence: "high",
        computedAt: now,
        sourceDataThrough: now,
        stale: false,
        snapshotId: snapshot.snapshot_id,
        metricVersion: def.metric_version,
        formulaVersion: def.formula_version,
        freshnessSlaMs: def.freshness_sla_ms,
        dimensions: dimensions,
      })
      .where(eq(analyticsSnapshots.id, existing[0].id));
  } else {
    await db.insert(analyticsSnapshots).values({
      snapshotId: snapshot.snapshot_id,
      metricKey: metricKey,
      metricVersion: def.metric_version,
      formulaVersion: def.formula_version,
      window,
      dimensionsHash: dimHash,
      dimensions: dimensions,
      value: typeof value === "number" ? value : null,
      valueText: typeof value === "string" ? value : null,
      valueType: def.value_type,
      unit: def.unit,
      status: "ok",
      confidence: "high",
      computedAt: now,
      sourceDataThrough: now,
      freshnessSlaMs: def.freshness_sla_ms,
      stale: false,
    });
  }

  return snapshot;
}

export async function getSnapshot(metricKey: string, window: string, dimensions: Record<string, string | number | boolean | null> = {}): Promise<MetricSnapshot | null> {
  const dimHash = hashDimensions(dimensions);

  const rows = await db
    .select()
    .from(analyticsSnapshots)
    .where(
      and(
        eq(analyticsSnapshots.metricKey, metricKey),
        eq(analyticsSnapshots.window, window),
        eq(analyticsSnapshots.dimensionsHash, dimHash)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return refreshSnapshot(metricKey, window, dimensions);
  }

  const row = rows[0];
  const now = Date.now();
  const computedAt = row.computedAt.getTime();
  const isStale = (now - computedAt) > row.freshnessSlaMs;

  if (isStale) {
    return refreshSnapshot(metricKey, window, dimensions);
  }

  return {
    snapshot_id: row.snapshotId,
    metric_key: row.metricKey,
    metric_version: row.metricVersion,
    formula_version: row.formulaVersion,
    window: row.window,
    dimensions: row.dimensions as Record<string, string | number | boolean | null>,
    dimensions_hash: row.dimensionsHash,
    value: row.value ?? row.valueText ?? null,
    value_type: row.valueType,
    unit: row.unit,
    status: row.status as "ok" | "warn" | "fail" | "unknown",
    confidence: row.confidence as "high" | "medium" | "low",
    computed_at: row.computedAt.toISOString(),
    source_data_through: row.sourceDataThrough?.toISOString(),
    freshness_sla_ms: row.freshnessSlaMs,
    stale: isStale,
    evidence_refs: row.evidenceRefs as string[] | undefined,
    lineage_ref: row.lineageRef || undefined,
  };
}

export async function refreshAllSnapshots(): Promise<void> {
  for (const def of METRIC_REGISTRY) {
    if (def.status !== "active") continue;
    const window = def.default_window || def.supported_windows[0];
    try {
      await refreshSnapshot(def.metric_key, window);
    } catch (err) {
      console.error(`[AAE] Failed to refresh snapshot for ${def.metric_key}:`, err instanceof Error ? err.message : err);
    }
  }
}
