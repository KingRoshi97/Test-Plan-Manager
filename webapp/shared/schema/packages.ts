import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { assemblies } from "./assemblies";

// Project Package enums
export const scanStateEnum = ["queued", "scanning", "scanned", "failed"] as const;
export type ScanState = (typeof scanStateEnum)[number];

export const indexStateEnum = ["queued", "indexing", "indexed", "failed"] as const;
export type IndexState = (typeof indexStateEnum)[number];

// Project Package interfaces
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

// Project Packages table
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
