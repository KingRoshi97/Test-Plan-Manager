import { pgTable, serial, text, timestamp, integer, jsonb, varchar, boolean, uniqueIndex, index, real, uuid } from "drizzle-orm/pg-core";
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
  familyId: varchar("family_id", { length: 50 }),
  familyName: varchar("family_name", { length: 100 }),
  familyType: varchar("family_type", { length: 50 }),
  lifecycleState: varchar("lifecycle_state", { length: 20 }).default("draft"),
  ownerName: varchar("owner_name", { length: 100 }),
  teamName: varchar("team_name", { length: 100 }),
  usageState: varchar("usage_state", { length: 20 }),
  lastActivityAt: timestamp("last_activity_at"),
  parentAssemblyId: integer("parent_assembly_id"),
  dependencyMeta: jsonb("dependency_meta"),
  riskLevel: varchar("risk_level", { length: 20 }),
  attentionFlags: jsonb("attention_flags"),
  controlPlane: varchar("control_plane", { length: 100 }),
  assignedAgents: jsonb("assigned_agents"),
  deprecationState: varchar("deprecation_state", { length: 20 }).default("none"),
  deprecationTargetDate: timestamp("deprecation_target_date"),
  retirementCandidate: boolean("retirement_candidate").default(false),
  lifecycleUpdatedAt: timestamp("lifecycle_updated_at"),
  requestsLast24h: integer("requests_last_24h").default(0),
  activeConsumers: integer("active_consumers").default(0),
  errorRatePct: real("error_rate_pct").default(0),
  p95LatencyMs: integer("p95_latency_ms").default(0),
  ecosystemRole: varchar("ecosystem_role", { length: 30 }),
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

export const assemblyRevisions = pgTable("assembly_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assemblyId: integer("assembly_id").notNull(),
  revisionNumber: integer("revision_number").notNull(),
  parentRevisionId: uuid("parent_revision_id"),
  sourceRunId: varchar("source_run_id", { length: 255 }),
  sourceSessionId: uuid("source_session_id"),
  modeId: varchar("mode_id", { length: 20 }),
  status: varchar("status", { length: 30 }).notNull().default("candidate"),
  title: text("title"),
  summary: text("summary"),
  manifestPath: text("manifest_path"),
  kitPath: text("kit_path"),
  artifactTreeHash: varchar("artifact_tree_hash", { length: 128 }),
  createdBy: varchar("created_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  promotedAt: timestamp("promoted_at"),
  archivedAt: timestamp("archived_at"),
  isCurrentActive: boolean("is_current_active").notNull().default(false),
  isRollbackTarget: boolean("is_rollback_target").notNull().default(false),
}, (table) => [
  uniqueIndex("idx_ar_assembly_revision").on(table.assemblyId, table.revisionNumber),
  index("idx_ar_assembly_active").on(table.assemblyId, table.isCurrentActive),
  index("idx_ar_parent").on(table.parentRevisionId),
]);

export const upgradeSessions = pgTable("upgrade_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assemblyId: integer("assembly_id").notNull(),
  sourceRevisionId: uuid("source_revision_id").notNull(),
  candidateRevisionId: uuid("candidate_revision_id"),
  modeId: varchar("mode_id", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("draft"),
  objective: text("objective").notNull(),
  scope: text("scope"),
  instructions: text("instructions"),
  notes: text("notes"),
  compatibilityRequired: boolean("compatibility_required").notNull().default(false),
  validationProfile: varchar("validation_profile", { length: 100 }),
  riskLevel: varchar("risk_level", { length: 20 }),
  blockingIssue: text("blocking_issue"),
  createdBy: varchar("created_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_us_assembly_status").on(table.assemblyId, table.status),
  index("idx_us_source_revision").on(table.sourceRevisionId),
]);

export const upgradePlans = pgTable("upgrade_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull(),
  findingsSummary: text("findings_summary").notNull(),
  agentSummary: text("agent_summary"),
  rollbackTargetRevisionId: uuid("rollback_target_revision_id"),
  rollbackNotes: text("rollback_notes"),
  safeRollbackAvailable: boolean("safe_rollback_available").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by", { length: 100 }),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_up_session").on(table.sessionId),
]);

export const upgradePlanChanges = pgTable("upgrade_plan_changes", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id").notNull(),
  ordinal: integer("ordinal").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }),
  targetArea: text("target_area"),
  expectedImpact: text("expected_impact"),
}, (table) => [
  uniqueIndex("idx_upc_plan_ordinal").on(table.planId, table.ordinal),
]);

export const upgradeSessionArtifacts = pgTable("upgrade_session_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull(),
  artifactKey: varchar("artifact_key", { length: 255 }).notNull(),
  artifactLabel: varchar("artifact_label", { length: 255 }).notNull(),
  artifactType: varchar("artifact_type", { length: 50 }),
  artifactPath: text("artifact_path"),
  role: varchar("role", { length: 30 }).notNull(),
  changeStatus: varchar("change_status", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_usa_session").on(table.sessionId),
]);

export const revisionDiffs = pgTable("revision_diffs", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id"),
  sourceRevisionId: uuid("source_revision_id").notNull(),
  candidateRevisionId: uuid("candidate_revision_id").notNull(),
  addedCount: integer("added_count").notNull().default(0),
  removedCount: integer("removed_count").notNull().default(0),
  modifiedCount: integer("modified_count").notNull().default(0),
  renamedCount: integer("renamed_count").notNull().default(0),
  warningCount: integer("warning_count").notNull().default(0),
  regressionCount: integer("regression_count").notNull().default(0),
  semanticImprovements: jsonb("semantic_improvements"),
  semanticRegressions: jsonb("semantic_regressions"),
  unresolvedIssues: jsonb("unresolved_issues"),
  introducedAssumptions: jsonb("introduced_assumptions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_rd_source_candidate").on(table.sourceRevisionId, table.candidateRevisionId),
]);

export const revisionDiffItems = pgTable("revision_diff_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  diffId: uuid("diff_id").notNull(),
  changeType: varchar("change_type", { length: 20 }).notNull(),
  category: varchar("category", { length: 30 }),
  label: text("label").notNull(),
  pathFrom: text("path_from"),
  pathTo: text("path_to"),
  detail: text("detail"),
  severity: varchar("severity", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_rdi_diff").on(table.diffId),
]);

export const revisionVerifications = pgTable("revision_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  revisionId: uuid("revision_id").notNull(),
  verdict: varchar("verdict", { length: 30 }).notNull().default("not_run"),
  requiredChecksTotal: integer("required_checks_total").notNull().default(0),
  requiredChecksPassed: integer("required_checks_passed").notNull().default(0),
  optionalChecksTotal: integer("optional_checks_total").notNull().default(0),
  optionalChecksPassed: integer("optional_checks_passed").notNull().default(0),
  warningCount: integer("warning_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  proofRefs: jsonb("proof_refs"),
  notes: text("notes"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_rv_revision").on(table.revisionId),
]);

export const revisionVerificationChecks = pgTable("revision_verification_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  verificationId: uuid("verification_id").notNull(),
  checkKey: varchar("check_key", { length: 100 }).notNull(),
  label: text("label").notNull(),
  category: varchar("category", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("not_run"),
  message: text("message"),
  proofRefs: jsonb("proof_refs"),
  ordinal: integer("ordinal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_rvc_verification_key").on(table.verificationId, table.checkKey),
]);

export const revisionEvents = pgTable("revision_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  assemblyId: integer("assembly_id").notNull(),
  revisionId: uuid("revision_id"),
  sessionId: uuid("session_id"),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  actorType: varchar("actor_type", { length: 20 }).notNull(),
  actorLabel: varchar("actor_label", { length: 100 }),
  payloadJson: jsonb("payload_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_re_assembly").on(table.assemblyId),
  index("idx_re_revision").on(table.revisionId),
]);

export const revisionSnapshots = pgTable("revision_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  revisionId: uuid("revision_id").notNull(),
  snapshotType: varchar("snapshot_type", { length: 30 }).notNull(),
  manifestPath: text("manifest_path"),
  kitArchivePath: text("kit_archive_path"),
  artifactTreeHash: varchar("artifact_tree_hash", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 100 }),
}, (table) => [
  index("idx_rs_revision").on(table.revisionId),
]);

export type AssemblyRevision = typeof assemblyRevisions.$inferSelect;
export type UpgradeSession = typeof upgradeSessions.$inferSelect;
export type UpgradePlan = typeof upgradePlans.$inferSelect;
export type UpgradePlanChange = typeof upgradePlanChanges.$inferSelect;
export type UpgradeSessionArtifact = typeof upgradeSessionArtifacts.$inferSelect;
export type RevisionDiff = typeof revisionDiffs.$inferSelect;
export type RevisionDiffItem = typeof revisionDiffItems.$inferSelect;
export type RevisionVerification = typeof revisionVerifications.$inferSelect;
export type RevisionVerificationCheck = typeof revisionVerificationChecks.$inferSelect;
export type RevisionEvent = typeof revisionEvents.$inferSelect;
export type RevisionSnapshot = typeof revisionSnapshots.$inferSelect;
