import { db } from "../db.js";
import { analyticsEvents } from "../../shared/schema.js";
import { and, eq, gte, lte, desc, sql, count as drizzleCount } from "drizzle-orm";

type EventsQueryParams = {
  page: number;
  limit: number;
  event_type?: string;
  domain_id?: string;
  outcome?: string;
  start?: string;
  end?: string;
};

type EventRow = {
  id: number;
  event_id: string;
  event_type: string;
  domain_id: string;
  occurred_at: string;
  outcome: string | null;
  severity: string | null;
  run_id: string | null;
  stage_id: string | null;
  gate_id: string | null;
  environment: string;
  envelope: Record<string, unknown>;
};

export async function getAnalyticsEvents(params: EventsQueryParams) {
  const { event_type, domain_id, outcome, start, end } = params;
  const page = Math.max(1, params.page);
  const limit = Math.max(1, Math.min(100, params.limit));
  const offset = (page - 1) * limit;

  if (start && isNaN(new Date(start).getTime())) {
    throw new Error("Invalid start date");
  }
  if (end && isNaN(new Date(end).getTime())) {
    throw new Error("Invalid end date");
  }

  const conditions = [];

  if (event_type) {
    conditions.push(eq(analyticsEvents.eventType, event_type));
  }
  if (domain_id) {
    conditions.push(eq(analyticsEvents.domainId, domain_id));
  }
  if (outcome) {
    conditions.push(eq(analyticsEvents.outcome, outcome));
  }
  if (start) {
    conditions.push(gte(analyticsEvents.occurredAt, new Date(start)));
  }
  if (end) {
    conditions.push(lte(analyticsEvents.occurredAt, new Date(end)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult, eventTypesList, domainIdsList] = await Promise.all([
    db
      .select({
        id: analyticsEvents.id,
        eventId: analyticsEvents.eventId,
        eventType: analyticsEvents.eventType,
        domainId: analyticsEvents.domainId,
        occurredAt: analyticsEvents.occurredAt,
        outcome: analyticsEvents.outcome,
        severity: analyticsEvents.severity,
        runId: analyticsEvents.runId,
        stageId: analyticsEvents.stageId,
        gateId: analyticsEvents.gateId,
        environment: analyticsEvents.environment,
        envelope: analyticsEvents.envelope,
      })
      .from(analyticsEvents)
      .where(whereClause)
      .orderBy(desc(analyticsEvents.occurredAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: drizzleCount() })
      .from(analyticsEvents)
      .where(whereClause),

    db
      .select({ eventType: analyticsEvents.eventType })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventType)
      .orderBy(analyticsEvents.eventType),

    db
      .select({ domainId: analyticsEvents.domainId })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.domainId)
      .orderBy(analyticsEvents.domainId),
  ]);

  const events: EventRow[] = rows.map((row) => ({
    id: row.id,
    event_id: row.eventId,
    event_type: row.eventType,
    domain_id: row.domainId,
    occurred_at: row.occurredAt.toISOString(),
    outcome: row.outcome,
    severity: row.severity,
    run_id: row.runId,
    stage_id: row.stageId,
    gate_id: row.gateId,
    environment: row.environment,
    envelope: row.envelope as Record<string, unknown>,
  }));

  return {
    events,
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
    available_filters: {
      event_types: eventTypesList.map((r) => r.eventType),
      domain_ids: domainIdsList.map((r) => r.domainId),
    },
  };
}
