import { pgTable, serial, text, integer, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assemblies = pgTable("assemblies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectName: text("project_name"),
  idea: text("idea"),
  context: text("context"),
  preset: text("preset"),
  domains: text("domains").array(),
  input: jsonb("input"),
  state: text("state").notNull().default("queued"),
  step: text("step"),
  progress: jsonb("progress"),
  errors: text("errors").array(),
  kit: jsonb("kit"),
  kitPath: text("kit_path"),
  logsTail: text("logs_tail"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  projectPackageId: varchar("project_package_id"),
  category: text("category"),
  mode: text("mode"),
  presetId: text("preset_id"),
  revision: integer("revision").notNull().default(1),
  upgradeNotes: text("upgrade_notes"),
  kitType: text("kit_type").notNull().default("original"),
  sourceFiles: jsonb("source_files"),
  archiveUrl: text("archive_url"),
});

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull().unique(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  hasManifest: integer("has_manifest").default(0).notNull(),
  hasRegistry: integer("has_registry").default(0).notNull(),
  hasDomains: integer("has_domains").default(0).notNull(),
  hasApp: integer("has_app").default(0).notNull(),
});

export const pipelineRuns = pgTable("pipeline_runs", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id"),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  stepId: varchar("step_id", { length: 100 }).notNull(),
  stepLabel: varchar("step_label", { length: 255 }).notNull(),
  stepGroup: varchar("step_group", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  exitCode: integer("exit_code").notNull(),
  durationMs: integer("duration_ms").notNull(),
  stdout: text("stdout").default(""),
  stderr: text("stderr").default(""),
  parsedJson: jsonb("parsed_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moduleStatuses = pgTable("module_statuses", {
  id: serial("id").primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  moduleName: varchar("module_name", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  data: jsonb("data").notNull(),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssemblySchema = createInsertSchema(assemblies).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  revision: z.number().int().min(1).optional(),
  upgradeNotes: z.string().nullable().optional(),
  kitType: z.string().optional(),
});
export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true, createdAt: true });
export const insertPipelineRunSchema = createInsertSchema(pipelineRuns).omit({ id: true, createdAt: true });
export const insertModuleStatusSchema = createInsertSchema(moduleStatuses).omit({ id: true, updatedAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });

export type InsertAssembly = z.infer<typeof insertAssemblySchema>;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type InsertPipelineRun = z.infer<typeof insertPipelineRunSchema>;
export type InsertModuleStatus = z.infer<typeof insertModuleStatusSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Assembly = typeof assemblies.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type ModuleStatus = typeof moduleStatuses.$inferSelect;
export type Report = typeof reports.$inferSelect;

export interface PipelineCommand {
  id: string;
  label: string;
  description: string;
  script: string;
  args: string[];
  requiresWorkspace: boolean;
}

export interface RunRequest {
  command: string;
  workspacePath?: string;
  projectName?: string;
  extraArgs?: string[];
}

export interface RunResult {
  status: 'success' | 'error';
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
}

export interface WorkspaceInfo {
  path: string;
  projectName: string;
  exists: boolean;
  hasManifest: boolean;
  hasRegistry: boolean;
  hasDomains: boolean;
  hasApp: boolean;
}

export interface ReleaseCheckResult {
  id: string;
  name: string;
  required: boolean;
  passed: boolean;
  skipped: boolean;
  duration_ms: number;
  exit_code: number | null;
  test_count?: number;
  log_path: string;
  error_summary?: string;
}

export interface ReleaseGateReport {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  duration_ms: number;
  passed: boolean;
  logs_dir: string;
  checks: ReleaseCheckResult[];
  failures: Array<{
    check_id: string;
    reason_code: string;
    summary: string;
    log_path: string;
  }>;
  next_commands: string[];
}

export interface SourceFile {
  path: string;
  language: string;
  content: string;
  size: number;
}

export interface SkipBreakdown {
  binary: number;
  tooLarge: number;
  excludedDir: number;
  traversal: number;
  readError: number;
  empty: number;
}

export interface UploadResult {
  files: SourceFile[];
  skipped: SkipBreakdown;
  totalExtracted: number;
  totalSkipped: number;
  archiveType: 'zip' | 'tar.gz' | 'github' | 'pdf';
  originalName: string;
}
