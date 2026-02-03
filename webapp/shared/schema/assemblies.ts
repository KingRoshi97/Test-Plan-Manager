import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Assembly enums
export const assemblyStateEnum = ["queued", "running", "completed", "failed", "canceled"] as const;
export type AssemblyState = (typeof assemblyStateEnum)[number];

export const assemblyStepEnum = ["init", "gen", "seed", "draft", "review", "verify", "lock", "package"] as const;
export type AssemblyStep = (typeof assemblyStepEnum)[number];

export const assemblyCategoryEnum = ["web", "mobile", "api", "library", "automation", "game"] as const;
export type AssemblyCategory = (typeof assemblyCategoryEnum)[number];

export const assemblyModeEnum = ["new_build", "existing_upgrade", "ui_overhaul", "refactor_hardening", "add_feature_module"] as const;
export type AssemblyMode = (typeof assemblyModeEnum)[number];

// Assembly-related interfaces
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

export interface DocUpload {
  id: string;
  name: string;
  objectPath: string;
  size: number;
  mimeType: string;
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
  docUploadIds?: string[];
  docUploads?: DocUpload[];
  delivery?: {
    enabled: boolean;
    type: "pull" | "webhook";
    webhookUrl?: string;
    webhookSecret?: string;
  };
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

// Assemblies table
export const assemblies = pgTable("assemblies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectName: text("project_name"),
  idea: text("idea"),
  context: text("context"),
  preset: text("preset"),
  category: text("category").$type<AssemblyCategory>(),
  mode: text("mode").$type<AssemblyMode>(),
  presetId: text("preset_id"),
  domains: text("domains").array(),
  input: jsonb("input").$type<AssemblyInput>(),
  state: text("state").$type<AssemblyState>().notNull().default("queued"),
  step: text("step").$type<AssemblyStep | null>(),
  progress: jsonb("progress").$type<AssemblyProgress>(),
  errors: text("errors").array(),
  kit: jsonb("kit").$type<Kit>(),
  kitPath: text("kit_path"),
  logsTail: text("logs_tail"),
  projectPackageId: varchar("project_package_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Validation schemas
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
  category: z.enum(assemblyCategoryEnum).optional(),
  mode: z.enum(assemblyModeEnum).optional(),
  presetId: z.string().optional(),
  domains: z.array(z.string()).optional(),
  idea: z.string().optional(),
  context: z.string().optional(),
  uploadedFiles: z.array(uploadedFileSchema).optional(),
  uploadedContext: z.string().optional(),
  projectPackageId: z.string().uuid().optional(),
  docUploadIds: z.array(z.string()).optional(),
  docUploads: z.array(z.object({
    id: z.string(),
    name: z.string(),
    objectPath: z.string(),
    size: z.number(),
    mimeType: z.string(),
  })).optional(),
  delivery: z.object({
    enabled: z.boolean(),
    type: z.enum(["pull", "webhook"]),
    webhookUrl: z.string().optional(),
    webhookSecret: z.string().optional(),
  }).optional(),
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
  category: true,
  mode: true,
  presetId: true,
  domains: true,
  input: true,
  projectPackageId: true,
}).extend({
  projectName: z.string().optional(),
  idea: z.string().optional(),
  context: z.string().optional(),
  preset: z.string().optional(),
  category: z.enum(assemblyCategoryEnum).optional(),
  mode: z.enum(assemblyModeEnum).optional(),
  presetId: z.string().optional(),
  domains: z.array(z.string()).optional(),
  input: z.custom<AssemblyInput>().optional(),
  projectPackageId: z.string().uuid().optional(),
});

export type InsertAssembly = z.infer<typeof insertAssemblySchema>;
export type Assembly = typeof assemblies.$inferSelect;

// Backward compatibility aliases
export type Run = Assembly;
export type RunState = AssemblyState;
export type RunStep = AssemblyStep;
export type RunInput = AssemblyInput;
export type RunBundle = Kit;
export type RunProgress = AssemblyProgress;
export type BundleChecksums = KitChecksums;
export type BundleSizes = KitSizes;
export type InsertRun = InsertAssembly;
export type CreateRunRequest = CreateAssemblyRequest;

export const runs = assemblies;
export const runStateEnum = assemblyStateEnum;
export const runStepEnum = assemblyStepEnum;
export const createRunRequestSchema = createAssemblyRequestSchema;
export const insertRunSchema = insertAssemblySchema;
