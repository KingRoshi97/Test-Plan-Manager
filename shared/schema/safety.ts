import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Safety Warnings table
export const safetyWarningSeverityEnum = ["info", "warning", "critical"] as const;
export type SafetyWarningSeverity = (typeof safetyWarningSeverityEnum)[number];

export const safetyWarnings = pgTable("safety_warnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assemblyId: varchar("assembly_id"),
  projectPackageId: varchar("project_package_id"),
  uploadId: varchar("upload_id"),
  code: text("code").notNull(),
  severity: text("severity").$type<SafetyWarningSeverity>().notNull(),
  message: text("message").notNull(),
  details: text("details"),
  filePath: text("file_path"),
  line: integer("line"),
  column: integer("column"),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSafetyWarningSchema = createInsertSchema(safetyWarnings).pick({
  assemblyId: true,
  projectPackageId: true,
  uploadId: true,
  code: true,
  severity: true,
  message: true,
  details: true,
  filePath: true,
  line: true,
  column: true,
});

export type InsertSafetyWarning = z.infer<typeof insertSafetyWarningSchema>;
export type SafetyWarning = typeof safetyWarnings.$inferSelect;

// Audit Logs table
export const auditLogActionEnum = [
  "assembly.create", "assembly.execute", "assembly.delete",
  "delivery.create", "delivery.retry",
  "package.upload", "package.attach",
  "upload.create", "upload.delete",
  "upgrade.generate",
  "apikey.create", "apikey.revoke",
  "safety.warning", "safety.block",
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
