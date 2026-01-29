import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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

export const runStatusEnum = ["created", "running", "completed", "failed", "bundled"] as const;
export type RunStatus = (typeof runStatusEnum)[number];

export const runs = pgTable("runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  idea: text("idea").notNull(),
  context: text("context"),
  status: text("status").$type<RunStatus>().notNull().default("created"),
  currentStep: text("current_step"),
  bundlePath: text("bundle_path"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRunSchema = createInsertSchema(runs).pick({
  idea: true,
  context: true,
}).extend({
  idea: z.string().min(10, "Idea must be at least 10 characters"),
  context: z.string().optional(),
});

export type InsertRun = z.infer<typeof insertRunSchema>;
export type Run = typeof runs.$inferSelect;
