import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const assemblyTemplates = pgTable("assembly_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  presetId: varchar("preset_id").notNull(),
  projectName: varchar("project_name"),
  idea: text("idea"),
  domains: text("domains").array(),
  goals: text("goals").array(),
  constraints: text("constraints").array(),
  techStack: jsonb("tech_stack"),
  isPublic: varchar("is_public").default("false"),
  usageCount: varchar("usage_count").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAssemblyTemplateSchema = createInsertSchema(assemblyTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAssemblyTemplate = z.infer<typeof insertAssemblyTemplateSchema>;
export type AssemblyTemplate = typeof assemblyTemplates.$inferSelect;
