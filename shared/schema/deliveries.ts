import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

// Delivery enums
export const deliveryStateEnum = ["queued", "delivering", "completed", "failed", "canceled"] as const;
export type DeliveryState = (typeof deliveryStateEnum)[number];

export const deliveryTypeEnum = ["pull", "webhook", "git", "direct"] as const;
export type DeliveryType = (typeof deliveryTypeEnum)[number];

// Delivery config interfaces
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

// Delivery result interfaces
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

// Deliveries table
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

// Delivery Events table
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

// Backward compatibility aliases
export type Handoff = Delivery;
export type HandoffState = DeliveryState;
export type HandoffType = DeliveryType;
export type HandoffConfig = DeliveryConfig;
export type HandoffAttempt = DeliveryAttempt;
export type InsertHandoff = InsertDelivery;
export type CreateHandoffRequest = CreateDeliveryRequest;

export const handoffs = deliveries;
export const handoffStateEnum = deliveryStateEnum;
export const handoffTypeEnum = deliveryTypeEnum;
export const createHandoffRequestSchema = createDeliveryRequestSchema;
export const insertHandoffSchema = insertDeliverySchema;
