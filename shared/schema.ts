import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const runStateEnum = ["queued", "running", "completed", "failed", "canceled"] as const;
export type RunState = (typeof runStateEnum)[number];

export const runStepEnum = ["init", "gen", "seed", "draft", "review", "verify", "lock", "package"] as const;
export type RunStep = (typeof runStepEnum)[number];

export interface BundleChecksums {
  zipSha256: string | null;
  manifestSha256: string | null;
  agentPromptSha256: string | null;
  inputSha256?: string | null;
  aiContextSha256?: string | null;
}

export interface Feature {
  name: string;
  description: string;
  priority: "P0" | "P1" | "P2";
}

export interface UserType {
  type: string;
  goal: string;
}

export interface TechStack {
  frontend?: string;
  backend?: string;
  database?: string;
}

export interface LegacyInput {
  idea?: string;
  mappedFromIdea: boolean;
}

export interface UploadedFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  extractedText: string;
  uploadedAt: string;
}

export interface RunInput {
  projectName: string;
  description: string;
  features: Feature[];
  users: UserType[];
  techStack?: TechStack;
  preset?: string;
  legacy?: LegacyInput;
  uploadedFiles?: UploadedFile[];
  uploadedContext?: string;
}

export interface BundleSizes {
  zipBytes: number;
}

export interface RunProgress {
  percent: number;
}

export type GenerationMode = "ai" | "template_fallback" | "hybrid";

export interface RunBundle {
  available: boolean;
  generationMode?: GenerationMode;
  zipBytes: number;
  zipSha256: string | null;
  manifestSha256: string | null;
  agentPromptSha256: string | null;
  inputSha256?: string | null;
  aiContextSha256?: string | null;
}

export const runs = pgTable("runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectName: text("project_name"),
  idea: text("idea"),
  context: text("context"),
  preset: text("preset"),
  domains: text("domains").array(),
  input: jsonb("input").$type<RunInput>(),
  state: text("state").$type<RunState>().notNull().default("queued"),
  step: text("step").$type<RunStep | null>(),
  progress: jsonb("progress").$type<RunProgress>(),
  errors: text("errors").array(),
  bundle: jsonb("bundle").$type<RunBundle>(),
  bundlePath: text("bundle_path"),
  logsTail: text("logs_tail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const featureSchema = z.object({
  name: z.string().min(1, "Feature name is required"),
  description: z.string().min(1, "Feature description is required"),
  priority: z.enum(["P0", "P1", "P2"]),
});

export const userTypeSchema = z.object({
  type: z.string().min(1, "User type is required"),
  goal: z.string().min(1, "User goal is required"),
});

export const techStackSchema = z.object({
  frontend: z.string().optional(),
  backend: z.string().optional(),
  database: z.string().optional(),
});

export const uploadedFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  extractedText: z.string(),
  uploadedAt: z.string(),
});

export const createRunRequestSchema = z.object({
  projectName: z.string().min(1, "Project name is required").optional(),
  description: z.string().optional(),
  features: z.array(featureSchema).optional(),
  users: z.array(userTypeSchema).optional(),
  techStack: techStackSchema.optional(),
  preset: z.string().optional(),
  domains: z.array(z.string()).optional(),
  idea: z.string().optional(),
  context: z.string().optional(),
  uploadedFiles: z.array(uploadedFileSchema).optional(),
  uploadedContext: z.string().optional(),
}).refine(
  (data) => data.projectName || data.idea,
  { message: "Either projectName (structured) or idea (legacy) is required" }
);

export type CreateRunRequest = z.infer<typeof createRunRequestSchema>;

export const insertRunSchema = createInsertSchema(runs).pick({
  projectName: true,
  idea: true,
  context: true,
  preset: true,
  domains: true,
  input: true,
}).extend({
  projectName: z.string().optional(),
  idea: z.string().optional(),
  context: z.string().optional(),
  preset: z.string().optional(),
  domains: z.array(z.string()).optional(),
  input: z.custom<RunInput>().optional(),
});

export type InsertRun = z.infer<typeof insertRunSchema>;
export type Run = typeof runs.$inferSelect;

export const handoffStateEnum = ["queued", "delivering", "completed", "failed", "canceled"] as const;
export type HandoffState = (typeof handoffStateEnum)[number];

export const handoffTypeEnum = ["pull", "webhook", "git", "direct"] as const;
export type HandoffType = (typeof handoffTypeEnum)[number];

export interface PullConfig {
  expiresInSeconds?: number;
  includeInlinePrompt?: boolean;
  includeInlineManifest?: boolean;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events?: string[];
  include?: string[];
}

export interface GitConfig {
  provider: "github" | "gitlab" | "bitbucket" | "generic";
  repo: string;
  branch: string;
  mode?: "commit" | "pr";
  auth: { token: string };
  pathPrefix?: string;
}

export interface DirectConfig {
  adapter: string;
  connection: Record<string, string>;
  options?: Record<string, unknown>;
}

export type HandoffConfig = PullConfig | WebhookConfig | GitConfig | DirectConfig;

export interface PullResult {
  zipUrl: string;
  expiresAt: string;
  zipSha256: string;
  zipBytes: number;
  manifest?: object;
  agentPrompt?: string;
}

export interface WebhookResult {
  deliveredAt: string;
  httpStatus: number;
}

export interface GitResult {
  provider: string;
  repo: string;
  branch: string;
  commitSha?: string;
  prUrl?: string;
}

export interface HandoffAttempt {
  attempt: number;
  at: string;
  ok: boolean;
  httpStatus?: number;
  error?: string;
}

export const handoffs = pgTable("handoffs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").notNull(),
  type: text("type").$type<HandoffType>().notNull(),
  label: text("label"),
  state: text("state").$type<HandoffState>().notNull().default("queued"),
  config: jsonb("config").$type<HandoffConfig>().notNull(),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(6),
  lastAttemptAt: timestamp("last_attempt_at"),
  result: jsonb("result").$type<PullResult | WebhookResult | GitResult | null>(),
  lastError: text("last_error"),
  attemptHistory: jsonb("attempt_history").$type<HandoffAttempt[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHandoffSchema = z.object({
  runId: z.string(),
  type: z.enum(handoffTypeEnum),
  label: z.string().optional(),
  config: z.record(z.unknown()),
});

export type InsertHandoff = z.infer<typeof insertHandoffSchema>;
export type Handoff = typeof handoffs.$inferSelect;

export const createHandoffRequestSchema = z.object({
  type: z.enum(handoffTypeEnum),
  label: z.string().optional(),
  config: z.record(z.unknown()),
});

export type CreateHandoffRequest = z.infer<typeof createHandoffRequestSchema>;

export * from "./models/chat";
