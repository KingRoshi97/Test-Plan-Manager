import crypto from "crypto";
import { db } from "../db.js";
import { analyticsEvents, pipelineRuns, assemblies } from "../../shared/schema.js";
import { eq, sql, and, gte, lte, inArray, count as drizzleCount, avg } from "drizzle-orm";

export function normalizeDimensions(dims: Record<string, string | number | boolean | null>): Record<string, string | number | boolean | null> {
  const sorted: Record<string, string | number | boolean | null> = {};
  for (const key of Object.keys(dims).sort()) {
    sorted[key] = dims[key];
  }
  return sorted;
}

export function hashDimensions(dims: Record<string, string | number | boolean | null>): string {
  const normalized = normalizeDimensions(dims);
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 16);
}

export function getWindowBounds(window: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (window) {
    case "live":
    case "5m":
      start.setMinutes(start.getMinutes() - 5);
      break;
    case "15m":
      start.setMinutes(start.getMinutes() - 15);
      break;
    case "1h":
      start.setHours(start.getHours() - 1);
      break;
    case "24h":
      start.setHours(start.getHours() - 24);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "all":
      start.setFullYear(2020);
      break;
    default:
      start.setHours(start.getHours() - 24);
  }

  return { start, end };
}

export async function countEvents(
  eventTypes: string[],
  window: string,
  extraFilters?: Record<string, string>
): Promise<number> {
  const { start, end } = getWindowBounds(window);

  const conditions = [
    gte(analyticsEvents.occurredAt, start),
    lte(analyticsEvents.occurredAt, end),
  ];

  if (eventTypes.length === 1) {
    conditions.push(eq(analyticsEvents.eventType, eventTypes[0]));
  } else if (eventTypes.length > 1) {
    conditions.push(inArray(analyticsEvents.eventType, eventTypes));
  }

  if (extraFilters?.outcome) {
    conditions.push(eq(analyticsEvents.outcome, extraFilters.outcome));
  }
  if (extraFilters?.domain_id) {
    conditions.push(eq(analyticsEvents.domainId, extraFilters.domain_id));
  }

  const result = await db
    .select({ count: drizzleCount() })
    .from(analyticsEvents)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

export async function computeRate(
  successTypes: string[],
  totalTypes: string[],
  window: string
): Promise<number> {
  const total = await countEvents(totalTypes, window);
  if (total === 0) return 0;
  const success = await countEvents(successTypes, window, { outcome: "success" });
  return Math.round((success / total) * 10000) / 100;
}

export async function computeFromPipelineRuns(
  metric: string,
  window: string
): Promise<number | null> {
  const { start, end } = getWindowBounds(window);

  switch (metric) {
    case "runs.active.count.live": {
      const result = await db
        .select({ count: drizzleCount() })
        .from(pipelineRuns)
        .where(eq(pipelineRuns.status, "running"));
      return result[0]?.count ?? 0;
    }

    case "runs.started.count": {
      const result = await db
        .select({ count: drizzleCount() })
        .from(pipelineRuns)
        .where(and(
          gte(pipelineRuns.startedAt, start),
          lte(pipelineRuns.startedAt, end)
        ));
      return result[0]?.count ?? 0;
    }

    case "runs.completed.count": {
      const result = await db
        .select({ count: drizzleCount() })
        .from(pipelineRuns)
        .where(and(
          eq(pipelineRuns.status, "completed"),
          sql`${pipelineRuns.completedAt} IS NOT NULL`,
          gte(pipelineRuns.completedAt, start),
          lte(pipelineRuns.completedAt, end)
        ));
      return result[0]?.count ?? 0;
    }

    case "runs.failed.count": {
      const result = await db
        .select({ count: drizzleCount() })
        .from(pipelineRuns)
        .where(and(
          eq(pipelineRuns.status, "failed"),
          sql`${pipelineRuns.completedAt} IS NOT NULL`,
          gte(pipelineRuns.completedAt, start),
          lte(pipelineRuns.completedAt, end)
        ));
      return result[0]?.count ?? 0;
    }

    case "runs.success.rate": {
      const total = await db
        .select({ count: drizzleCount() })
        .from(pipelineRuns)
        .where(and(
          sql`${pipelineRuns.completedAt} IS NOT NULL`,
          gte(pipelineRuns.completedAt, start),
          lte(pipelineRuns.completedAt, end),
          sql`${pipelineRuns.status} IN ('completed', 'failed')`
        ));

      if ((total[0]?.count ?? 0) === 0) return 0;

      const success = await db
        .select({ count: drizzleCount() })
        .from(pipelineRuns)
        .where(and(
          eq(pipelineRuns.status, "completed"),
          sql`${pipelineRuns.completedAt} IS NOT NULL`,
          gte(pipelineRuns.completedAt, start),
          lte(pipelineRuns.completedAt, end)
        ));

      return Math.round(((success[0]?.count ?? 0) / (total[0]?.count ?? 1)) * 10000) / 100;
    }

    case "runs.blocked.count": {
      const result = await db
        .select({ count: drizzleCount() })
        .from(pipelineRuns)
        .where(eq(pipelineRuns.status, "blocked"));
      return result[0]?.count ?? 0;
    }

    case "runs.duration.avg": {
      const result = await db
        .select({
          avg: avg(sql`EXTRACT(EPOCH FROM (${pipelineRuns.completedAt} - ${pipelineRuns.startedAt})) * 1000`),
        })
        .from(pipelineRuns)
        .where(and(
          sql`${pipelineRuns.completedAt} IS NOT NULL`,
          gte(pipelineRuns.startedAt, start),
          lte(pipelineRuns.startedAt, end)
        ));
      return result[0]?.avg ? Math.round(Number(result[0].avg)) : null;
    }

    default:
      return null;
  }
}

export async function computeSystemHealth(): Promise<number> {
  const totalRuns = await db.select({ count: drizzleCount() }).from(pipelineRuns);
  const failedRecent = await db
    .select({ count: drizzleCount() })
    .from(pipelineRuns)
    .where(and(
      eq(pipelineRuns.status, "failed"),
      gte(pipelineRuns.startedAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
    ));

  const total = totalRuns[0]?.count ?? 0;
  const failed = failedRecent[0]?.count ?? 0;

  if (total === 0) return 100;
  const failRate = failed / Math.max(total, 1);
  return Math.round((1 - failRate) * 100);
}
