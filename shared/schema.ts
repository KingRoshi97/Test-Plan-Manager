import { pgTable, serial, text, timestamp, integer, jsonb, varchar } from "drizzle-orm/pg-core";
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
