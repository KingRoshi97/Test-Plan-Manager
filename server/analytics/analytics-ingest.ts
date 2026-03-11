import { db } from "../db.js";
import { analyticsEvents } from "../../shared/schema.js";
import { eq } from "drizzle-orm";
import type { AnalyticsEventEnvelope } from "../../shared/analytics/event-envelope.js";
import { REQUIRED_ENVELOPE_FIELDS, VALID_DOMAIN_IDS } from "../../shared/analytics/event-envelope.js";
import type { IngestionResult } from "./analytics-types.js";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function validateEnvelope(event: Record<string, unknown>): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of REQUIRED_ENVELOPE_FIELDS) {
    if (event[field] === undefined || event[field] === null || event[field] === "") {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (typeof event.occurred_at === "string" && !ISO_DATE_REGEX.test(event.occurred_at)) {
    errors.push("Invalid timestamp format for occurred_at (expected ISO 8601)");
  }
  if (typeof event.recorded_at === "string" && !ISO_DATE_REGEX.test(event.recorded_at)) {
    errors.push("Invalid timestamp format for recorded_at (expected ISO 8601)");
  }

  if (typeof event.payload !== "object" || event.payload === null || Array.isArray(event.payload)) {
    errors.push("payload must be a non-null object");
  }

  if (typeof event.domain_id === "string" && !(VALID_DOMAIN_IDS as readonly string[]).includes(event.domain_id)) {
    warnings.push(`Unknown domain_id: ${event.domain_id}`);
  }

  if (typeof event.dimensions === "object" && event.dimensions !== null) {
    const dims = event.dimensions as Record<string, unknown>;
    for (const [key, val] of Object.entries(dims)) {
      if (val !== null && typeof val !== "string" && typeof val !== "number" && typeof val !== "boolean") {
        errors.push(`Invalid dimension value type for key "${key}": ${typeof val}`);
      }
    }
  }

  if (event.actor_type && !event.actor_id) {
    warnings.push("actor_type set without actor_id");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export async function ingestEvent(event: AnalyticsEventEnvelope): Promise<IngestionResult> {
  const validation = validateEnvelope(event as unknown as Record<string, unknown>);

  if (!validation.valid) {
    return {
      accepted: false,
      event_id: event.event_id || "unknown",
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const existing = await db
    .select({ id: analyticsEvents.id })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.eventId, event.event_id))
    .limit(1);

  if (existing.length > 0) {
    return {
      accepted: true,
      event_id: event.event_id,
      warnings: ["Duplicate event_id, no-op (idempotent accept)"],
    };
  }

  const now = new Date();
  const acceptedEnvelope = { ...event, accepted_at: now.toISOString() };

  await db.insert(analyticsEvents).values({
    eventId: event.event_id,
    eventType: event.event_type,
    eventVersion: event.event_version,
    domainId: event.domain_id,
    sourceSystem: event.source_system,
    sourceComponent: event.source_component,
    occurredAt: new Date(event.occurred_at),
    recordedAt: new Date(event.recorded_at),
    acceptedAt: now,
    environment: event.environment,
    runId: event.run_id || null,
    stageId: event.stage_id || null,
    gateId: event.gate_id || null,
    artifactId: event.artifact_id || null,
    maintenanceRunId: event.maintenance_run_id || null,
    severity: event.severity || null,
    status: event.status || null,
    outcome: event.outcome || null,
    dedupeKey: event.dedupe_key || null,
    envelope: acceptedEnvelope,
  });

  return {
    accepted: true,
    event_id: event.event_id,
    warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
  };
}

export async function ingestBatch(events: AnalyticsEventEnvelope[]): Promise<IngestionResult[]> {
  const results: IngestionResult[] = [];
  for (const event of events) {
    try {
      const result = await ingestEvent(event);
      results.push(result);
    } catch (err) {
      results.push({
        accepted: false,
        event_id: event.event_id || "unknown",
        errors: [`Ingestion error: ${err instanceof Error ? err.message : String(err)}`],
      });
    }
  }
  return results;
}
