import { pgTable, serial, text, timestamp, integer, jsonb, varchar, boolean, uniqueIndex, index, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assemblies = pgTable("assemblies", {
  id: serial("id").primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  idea: text("idea"),
  preset: varchar("preset", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("queued"),
  currentStep: varchar("current_step", { length: 100 }),
  runId: varchar("run_id", { length: 50 }),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  config: jsonb("config"),
  verificationStatus: varchar("verification_status", { length: 50 }),
  lockReady: varchar("lock_ready", { length: 10 }),
  revision: integer("revision").default(0),
  kitType: varchar("kit_type", { length: 50 }),
  totalRuns: integer("total_runs").default(0),
  totalDurationMs: integer("total_duration_ms").default(0),
  intakePayload: jsonb("intake_payload"),
  buildTokenUsage: jsonb("build_token_usage"),
});

export const pipelineRuns = pgTable("pipeline_runs", {
  id: serial("id").primaryKey(),
  assemblyId: integer("assembly_id").notNull(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  plan: varchar("plan", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("queued"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  stages: jsonb("stages"),
  currentStage: varchar("current_stage", { length: 100 }),
  error: text("error"),
  tokenUsage: jsonb("token_usage"),
});

export const moduleStatuses = pgTable("module_statuses", {
  id: serial("id").primaryKey(),
  assemblyId: integer("assembly_id").notNull(),
  moduleName: varchar("module_name", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  assemblyId: integer("assembly_id").notNull(),
  runId: varchar("run_id", { length: 50 }),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  content: jsonb("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssemblySchema = createInsertSchema(assemblies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPipelineRunSchema = createInsertSchema(pipelineRuns).omit({
  id: true,
  startedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export type Assembly = typeof assemblies.$inferSelect;
export type InsertAssembly = z.infer<typeof insertAssemblySchema>;
export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type InsertPipelineRun = z.infer<typeof insertPipelineRunSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 255 }).notNull(),
  eventVersion: varchar("event_version", { length: 50 }).notNull(),
  domainId: varchar("domain_id", { length: 100 }).notNull(),
  sourceSystem: varchar("source_system", { length: 100 }).notNull(),
  sourceComponent: varchar("source_component", { length: 255 }).notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
  recordedAt: timestamp("recorded_at").notNull(),
  acceptedAt: timestamp("accepted_at").defaultNow().notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  runId: varchar("run_id", { length: 255 }),
  stageId: varchar("stage_id", { length: 255 }),
  gateId: varchar("gate_id", { length: 255 }),
  artifactId: varchar("artifact_id", { length: 255 }),
  maintenanceRunId: varchar("maintenance_run_id", { length: 255 }),
  severity: varchar("severity", { length: 50 }),
  status: varchar("status", { length: 100 }),
  outcome: varchar("outcome", { length: 50 }),
  dedupeKey: varchar("dedupe_key", { length: 255 }),
  envelope: jsonb("envelope").notNull(),
}, (table) => [
  index("idx_ae_domain").on(table.domainId),
  index("idx_ae_event_type").on(table.eventType),
  index("idx_ae_occurred").on(table.occurredAt),
  index("idx_ae_run").on(table.runId),
]);

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: serial("id").primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 512 }).notNull(),
  metricKey: varchar("metric_key", { length: 255 }).notNull(),
  metricVersion: varchar("metric_version", { length: 50 }).notNull(),
  formulaVersion: varchar("formula_version", { length: 50 }).notNull(),
  window: varchar("window", { length: 50 }).notNull(),
  dimensionsHash: varchar("dimensions_hash", { length: 64 }).notNull(),
  dimensions: jsonb("dimensions").notNull().default({}),
  value: real("value"),
  valueText: text("value_text"),
  valueType: varchar("value_type", { length: 50 }).notNull().default("number"),
  unit: varchar("unit", { length: 50 }).notNull().default("count"),
  status: varchar("status", { length: 50 }).notNull().default("ok"),
  confidence: varchar("confidence", { length: 50 }).notNull().default("high"),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  sourceDataThrough: timestamp("source_data_through"),
  freshnessSlaMs: integer("freshness_sla_ms").notNull().default(60000),
  stale: boolean("stale").notNull().default(false),
  evidenceRefs: jsonb("evidence_refs"),
  lineageRef: varchar("lineage_ref", { length: 512 }),
}, (table) => [
  uniqueIndex("idx_as_natural_key").on(table.metricKey, table.window, table.dimensionsHash),
]);

export const analyticsTrends = pgTable("analytics_trends", {
  id: serial("id").primaryKey(),
  pointId: varchar("point_id", { length: 512 }).notNull(),
  metricKey: varchar("metric_key", { length: 255 }).notNull(),
  metricVersion: varchar("metric_version", { length: 50 }).notNull(),
  formulaVersion: varchar("formula_version", { length: 50 }).notNull(),
  bucketStart: timestamp("bucket_start").notNull(),
  bucketEnd: timestamp("bucket_end").notNull(),
  bucketGranularity: varchar("bucket_granularity", { length: 50 }).notNull(),
  dimensionsHash: varchar("dimensions_hash", { length: 64 }).notNull(),
  dimensions: jsonb("dimensions").notNull().default({}),
  value: real("value"),
  valueText: text("value_text"),
  valueType: varchar("value_type", { length: 50 }).notNull().default("number"),
  unit: varchar("unit", { length: 50 }).notNull().default("count"),
  confidence: varchar("confidence", { length: 50 }).notNull().default("high"),
  qualityFlags: jsonb("quality_flags"),
  backfilled: boolean("backfilled").notNull().default(false),
  corrected: boolean("corrected").notNull().default(false),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  sourceDataThrough: timestamp("source_data_through"),
  evidenceRefs: jsonb("evidence_refs"),
  lineageRef: varchar("lineage_ref", { length: 512 }),
}, (table) => [
  uniqueIndex("idx_at_natural_key").on(table.metricKey, table.bucketStart, table.bucketGranularity, table.dimensionsHash),
  index("idx_at_metric").on(table.metricKey),
]);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type AnalyticsTrend = typeof analyticsTrends.$inferSelect;
