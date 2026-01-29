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

export const assemblyStateEnum = ["queued", "running", "completed", "failed", "canceled"] as const;
export type AssemblyState = (typeof assemblyStateEnum)[number];

export const assemblyStepEnum = ["init", "gen", "seed", "draft", "review", "verify", "lock", "package"] as const;
export type AssemblyStep = (typeof assemblyStepEnum)[number];

export interface KitChecksums {
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

export interface AssemblyInput {
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

export interface KitSizes {
  zipBytes: number;
}

export interface AssemblyProgress {
  percent: number;
}

export type GenerationMode = "ai" | "template_fallback" | "hybrid";

export interface Kit {
  available: boolean;
  generationMode?: GenerationMode;
  zipBytes: number;
  zipSha256: string | null;
  manifestSha256: string | null;
  agentPromptSha256: string | null;
  inputSha256?: string | null;
  aiContextSha256?: string | null;
}

export const assemblies = pgTable("assemblies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectName: text("project_name"),
  idea: text("idea"),
  context: text("context"),
  preset: text("preset"),
  domains: text("domains").array(),
  input: jsonb("input").$type<AssemblyInput>(),
  state: text("state").$type<AssemblyState>().notNull().default("queued"),
  step: text("step").$type<AssemblyStep | null>(),
  progress: jsonb("progress").$type<AssemblyProgress>(),
  errors: text("errors").array(),
  kit: jsonb("kit").$type<Kit>(),
  kitPath: text("kit_path"),
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

export const createAssemblyRequestSchema = z.object({
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

export type CreateAssemblyRequest = z.infer<typeof createAssemblyRequestSchema>;

export const insertAssemblySchema = createInsertSchema(assemblies).pick({
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
  input: z.custom<AssemblyInput>().optional(),
});

export type InsertAssembly = z.infer<typeof insertAssemblySchema>;
export type Assembly = typeof assemblies.$inferSelect;

export const deliveryStateEnum = ["queued", "delivering", "completed", "failed", "canceled"] as const;
export type DeliveryState = (typeof deliveryStateEnum)[number];

export const deliveryTypeEnum = ["pull", "webhook", "git", "direct"] as const;
export type DeliveryType = (typeof deliveryTypeEnum)[number];

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

export type DeliveryConfig = PullConfig | WebhookConfig | GitConfig | DirectConfig;

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

export interface DeliveryAttempt {
  attempt: number;
  at: string;
  ok: boolean;
  httpStatus?: number;
  error?: string;
}

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assemblyId: varchar("assembly_id").notNull(),
  type: text("type").$type<DeliveryType>().notNull(),
  label: text("label"),
  state: text("state").$type<DeliveryState>().notNull().default("queued"),
  config: jsonb("config").$type<DeliveryConfig>().notNull(),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(6),
  lastAttemptAt: timestamp("last_attempt_at"),
  nextAttemptAt: timestamp("next_attempt_at"),
  result: jsonb("result").$type<PullResult | WebhookResult | GitResult | null>(),
  lastError: text("last_error"),
  attemptHistory: jsonb("attempt_history").$type<DeliveryAttempt[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDeliverySchema = z.object({
  assemblyId: z.string(),
  type: z.enum(deliveryTypeEnum),
  label: z.string().optional(),
  config: z.record(z.unknown()),
});

export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;

export const createDeliveryRequestSchema = z.object({
  type: z.enum(deliveryTypeEnum),
  label: z.string().optional(),
  config: z.record(z.unknown()),
});

export type CreateDeliveryRequest = z.infer<typeof createDeliveryRequestSchema>;

// Delivery Events table (for tracking delivery attempts, successes, failures)
export const deliveryEventTypeEnum = [
  "queued",
  "attempted",
  "response",
  "succeeded",
  "failed",
  "scheduled_retry",
  "dead"
] as const;
export type DeliveryEventType = (typeof deliveryEventTypeEnum)[number];

export interface DeliveryEventDetails {
  httpStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  nextAttemptAt?: string;
  attempt?: number;
  maxAttempts?: number;
}

export const deliveryEvents = pgTable("delivery_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deliveryId: varchar("delivery_id").notNull(),
  eventType: text("event_type").$type<DeliveryEventType>().notNull(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  detailsJson: jsonb("details_json").$type<DeliveryEventDetails>(),
});

export const insertDeliveryEventSchema = z.object({
  deliveryId: z.string(),
  eventType: z.enum(deliveryEventTypeEnum),
  detailsJson: z.record(z.unknown()).optional(),
});

export type InsertDeliveryEvent = z.infer<typeof insertDeliveryEventSchema>;
export type DeliveryEvent = typeof deliveryEvents.$inferSelect;

// Project Package types and table
export const scanStateEnum = ["queued", "scanning", "scanned", "failed"] as const;
export type ScanState = (typeof scanStateEnum)[number];

export const indexStateEnum = ["queued", "indexing", "indexed", "failed"] as const;
export type IndexState = (typeof indexStateEnum)[number];

export interface ProjectSummary {
  framework?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  hasTypeScript?: boolean;
  hasEslint?: boolean;
  hasPrettier?: boolean;
  entryPoints?: string[];
  routesStructure?: string[];
  fileCount?: number;
  totalSize?: number;
}

export interface ProjectWarning {
  code: string;
  message: string;
  details?: string;
}

export const projectPackages = pgTable("project_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assemblyId: varchar("assembly_id").references(() => assemblies.id),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  sha256: text("sha256").notNull(),
  objectKey: text("object_key").notNull(),
  unpackedObjectKey: text("unpacked_object_key"),
  scanState: text("scan_state").$type<ScanState>().notNull().default("queued"),
  indexState: text("index_state").$type<IndexState>().notNull().default("queued"),
  summaryJson: jsonb("summary_json").$type<ProjectSummary>(),
  warningsJson: jsonb("warnings_json").$type<ProjectWarning[]>(),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  correlationId: text("correlation_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectPackageSchema = createInsertSchema(projectPackages).pick({
  filename: true,
  mimeType: true,
  sizeBytes: true,
  sha256: true,
  objectKey: true,
  correlationId: true,
});

export type InsertProjectPackage = z.infer<typeof insertProjectPackageSchema>;
export type ProjectPackage = typeof projectPackages.$inferSelect;

// Upgrade request types
export interface UpgradeRequest {
  overview: string;
  goals?: string[];
  constraints?: string[];
  doNotTouch?: string[];
}

export type UpgradeOutputMode = "patch_only" | "patched_zip" | "git_pr_later";

export interface UpgradeArtifact {
  type: "upgrade_plan" | "upgrade_diff" | "upgraded_zip" | "project_summary" | "project_tree" | "dep_snapshot";
  objectKey: string;
  sha256?: string;
  sizeBytes?: number;
}

export const createUpgradeRequestSchema = z.object({
  projectPackageId: z.string(),
  request: z.object({
    overview: z.string().min(1, "Overview is required"),
    goals: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    doNotTouch: z.array(z.string()).optional(),
  }),
  output: z.object({
    mode: z.enum(["patch_only", "patched_zip", "git_pr_later"]).default("patch_only"),
  }).optional(),
});

export type CreateUpgradeRequest = z.infer<typeof createUpgradeRequestSchema>;

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  scopes: text("scopes").array(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
  keyHash: true,
  keyPrefix: true,
  scopes: true,
  expiresAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// Audit Logs table
export const auditLogActionEnum = [
  "assembly.create", "assembly.execute", "assembly.delete",
  "delivery.create", "delivery.retry",
  "package.upload", "package.attach",
  "upgrade.generate",
  "apikey.create", "apikey.revoke",
] as const;
export type AuditLogAction = (typeof auditLogActionEnum)[number];

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").$type<AuditLogAction>().notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  apiKeyId: varchar("api_key_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestMethod: text("request_method"),
  requestPath: text("request_path"),
  statusCode: integer("status_code"),
  correlationId: text("correlation_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  action: true,
  resourceType: true,
  resourceId: true,
  apiKeyId: true,
  ipAddress: true,
  userAgent: true,
  requestMethod: true,
  requestPath: true,
  statusCode: true,
  correlationId: true,
  metadata: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Backward compatibility aliases
export type Run = Assembly;
export type RunState = AssemblyState;
export type RunStep = AssemblyStep;
export type RunInput = AssemblyInput;
export type RunBundle = Kit;
export type RunProgress = AssemblyProgress;
export type BundleChecksums = KitChecksums;
export type BundleSizes = KitSizes;
export type Handoff = Delivery;
export type HandoffState = DeliveryState;
export type HandoffType = DeliveryType;
export type HandoffConfig = DeliveryConfig;
export type HandoffAttempt = DeliveryAttempt;
export type InsertRun = InsertAssembly;
export type InsertHandoff = InsertDelivery;
export type CreateRunRequest = CreateAssemblyRequest;
export type CreateHandoffRequest = CreateDeliveryRequest;

export const runs = assemblies;
export const handoffs = deliveries;
export const runStateEnum = assemblyStateEnum;
export const runStepEnum = assemblyStepEnum;
export const handoffStateEnum = deliveryStateEnum;
export const handoffTypeEnum = deliveryTypeEnum;
export const createRunRequestSchema = createAssemblyRequestSchema;
export const createHandoffRequestSchema = createDeliveryRequestSchema;
export const insertRunSchema = insertAssemblySchema;
export const insertHandoffSchema = insertDeliverySchema;

export * from "./models/chat";
