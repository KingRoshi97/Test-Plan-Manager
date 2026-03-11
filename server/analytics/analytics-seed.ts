import crypto from "crypto";
import { db } from "../db.js";
import { pipelineRuns, assemblies, analyticsEvents } from "../../shared/schema.js";
import { sql } from "drizzle-orm";
import { ingestEvent } from "./analytics-ingest.js";
import { refreshAllSnapshots } from "./analytics-snapshots.js";
import type { AnalyticsEventEnvelope } from "../../shared/analytics/event-envelope.js";

function makeEventId(): string {
  return `evt_seed_${crypto.randomUUID().slice(0, 16)}`;
}

function makeEnvelope(overrides: Partial<AnalyticsEventEnvelope> & { event_type: string; domain_id: string; payload: Record<string, unknown> }): AnalyticsEventEnvelope {
  const now = new Date().toISOString();
  return {
    event_id: makeEventId(),
    event_version: "1.0.0",
    source_system: "axion",
    source_component: "seed",
    occurred_at: overrides.occurred_at || now,
    recorded_at: overrides.recorded_at || now,
    environment: "dev",
    ...overrides,
  };
}

export async function seedFromExistingData(): Promise<{ seeded: number; errors: number }> {
  let seeded = 0;
  let errors = 0;

  const existingCount = await db.select({ count: sql<number>`count(*)` }).from(analyticsEvents);
  if (Number(existingCount[0]?.count ?? 0) > 0) {
    console.log("[AAE] Analytics events already exist, skipping seed. Refreshing snapshots...");
    await refreshAllSnapshots();
    return { seeded: 0, errors: 0 };
  }

  console.log("[AAE] Seeding analytics events from existing pipeline data...");

  const runs = await db.select().from(pipelineRuns);

  for (const run of runs) {
    try {
      const startedAt = run.startedAt?.toISOString() || new Date().toISOString();

      await ingestEvent(makeEnvelope({
        event_type: "run_started",
        domain_id: "run_lifecycle",
        source_component: "pipeline-runner",
        occurred_at: startedAt,
        recorded_at: startedAt,
        entity_type: "run",
        entity_id: run.runId,
        run_id: run.runId,
        status: "started",
        outcome: "unknown",
        severity: "info",
        payload: {
          assembly_id: run.assemblyId,
          plan: run.plan,
        },
        correlation_id: `corr_${run.runId}`,
      }));
      seeded++;

      if (run.status === "completed" && run.completedAt) {
        const completedAt = run.completedAt.toISOString();
        const durationMs = run.completedAt.getTime() - (run.startedAt?.getTime() || 0);

        await ingestEvent(makeEnvelope({
          event_type: "run_completed",
          domain_id: "run_lifecycle",
          source_component: "pipeline-runner",
          occurred_at: completedAt,
          recorded_at: completedAt,
          entity_type: "run",
          entity_id: run.runId,
          run_id: run.runId,
          status: "completed",
          outcome: "success",
          severity: "info",
          payload: {
            duration_ms: durationMs,
            assembly_id: run.assemblyId,
          },
          correlation_id: `corr_${run.runId}`,
        }));
        seeded++;
      }

      if (run.status === "failed") {
        const failedAt = run.completedAt?.toISOString() || startedAt;

        await ingestEvent(makeEnvelope({
          event_type: "run_failed",
          domain_id: "run_lifecycle",
          source_component: "pipeline-runner",
          occurred_at: failedAt,
          recorded_at: failedAt,
          entity_type: "run",
          entity_id: run.runId,
          run_id: run.runId,
          status: "failed",
          outcome: "failure",
          severity: "error",
          payload: {
            error: run.error || "Unknown error",
            assembly_id: run.assemblyId,
          },
          correlation_id: `corr_${run.runId}`,
        }));
        seeded++;
      }

      if (run.stages && typeof run.stages === "object") {
        const stages = run.stages as Record<string, { status?: string; startedAt?: string; completedAt?: string; error?: string }>;
        for (const [stageId, stageData] of Object.entries(stages)) {
          if (!stageData || typeof stageData !== "object") continue;

          if (stageData.startedAt) {
            await ingestEvent(makeEnvelope({
              event_type: "stage_started",
              domain_id: "stage_execution",
              source_component: "stage-executor",
              occurred_at: stageData.startedAt,
              recorded_at: stageData.startedAt,
              entity_type: "stage",
              entity_id: stageId,
              run_id: run.runId,
              stage_id: stageId,
              status: "started",
              severity: "info",
              payload: {},
              correlation_id: `corr_${run.runId}`,
            }));
            seeded++;
          }

          if (stageData.status === "completed" && stageData.completedAt) {
            const durationMs = stageData.startedAt
              ? new Date(stageData.completedAt).getTime() - new Date(stageData.startedAt).getTime()
              : 0;

            await ingestEvent(makeEnvelope({
              event_type: "stage_completed",
              domain_id: "stage_execution",
              source_component: "stage-executor",
              occurred_at: stageData.completedAt,
              recorded_at: stageData.completedAt,
              entity_type: "stage",
              entity_id: stageId,
              run_id: run.runId,
              stage_id: stageId,
              status: "completed",
              outcome: "success",
              severity: "info",
              payload: { duration_ms: durationMs },
              correlation_id: `corr_${run.runId}`,
            }));
            seeded++;
          }

          if (stageData.status === "failed") {
            await ingestEvent(makeEnvelope({
              event_type: "stage_failed",
              domain_id: "stage_execution",
              source_component: "stage-executor",
              occurred_at: stageData.completedAt || stageData.startedAt || startedAt,
              recorded_at: stageData.completedAt || stageData.startedAt || startedAt,
              entity_type: "stage",
              entity_id: stageId,
              run_id: run.runId,
              stage_id: stageId,
              status: "failed",
              outcome: "failure",
              severity: "error",
              payload: { error: stageData.error || "Stage failed" },
              correlation_id: `corr_${run.runId}`,
            }));
            seeded++;
          }
        }
      }

      if (run.tokenUsage && typeof run.tokenUsage === "object") {
        const tokenData = run.tokenUsage as Record<string, unknown>;
        const totalTokens = (tokenData as any).total_tokens || (tokenData as any).totalTokens || 0;
        if (totalTokens > 0) {
          await ingestEvent(makeEnvelope({
            event_type: "token_usage_recorded",
            domain_id: "cost_resources",
            source_component: "token-meter",
            occurred_at: run.completedAt?.toISOString() || startedAt,
            recorded_at: run.completedAt?.toISOString() || startedAt,
            entity_type: "run",
            entity_id: run.runId,
            run_id: run.runId,
            severity: "info",
            payload: { total_tokens: totalTokens, ...tokenData },
            correlation_id: `corr_${run.runId}`,
          }));
          seeded++;
        }
      }
    } catch (err) {
      console.error(`[AAE] Seed error for run ${run.runId}:`, err instanceof Error ? err.message : err);
      errors++;
    }
  }

  console.log(`[AAE] Seed complete: ${seeded} events ingested, ${errors} errors`);

  await refreshAllSnapshots();

  return { seeded, errors };
}
