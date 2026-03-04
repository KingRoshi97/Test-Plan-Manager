import { db } from "./db.js";
import { assemblies, pipelineRuns, moduleStatuses, reports } from "../shared/schema.js";
import type { Assembly, InsertAssembly, PipelineRun, InsertPipelineRun, Report, InsertReport } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";

export const storage = {
  async getAssemblies(): Promise<Assembly[]> {
    return db.select().from(assemblies).orderBy(desc(assemblies.createdAt));
  },

  async getAssembly(id: number): Promise<Assembly | undefined> {
    const rows = await db.select().from(assemblies).where(eq(assemblies.id, id));
    return rows[0];
  },

  async createAssembly(data: InsertAssembly): Promise<Assembly> {
    const rows = await db.insert(assemblies).values(data).returning();
    return rows[0];
  },

  async updateAssembly(id: number, data: Partial<InsertAssembly>): Promise<Assembly | undefined> {
    const rows = await db
      .update(assemblies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assemblies.id, id))
      .returning();
    return rows[0];
  },

  async deleteAssembly(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.assemblyId, id));
    await db.delete(moduleStatuses).where(eq(moduleStatuses.assemblyId, id));
    await db.delete(pipelineRuns).where(eq(pipelineRuns.assemblyId, id));
    await db.delete(assemblies).where(eq(assemblies.id, id));
  },

  async getPipelineRuns(assemblyId: number): Promise<PipelineRun[]> {
    return db
      .select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.assemblyId, assemblyId))
      .orderBy(desc(pipelineRuns.startedAt));
  },

  async getPipelineRun(id: number): Promise<PipelineRun | undefined> {
    const rows = await db.select().from(pipelineRuns).where(eq(pipelineRuns.id, id));
    return rows[0];
  },

  async getPipelineRunByRunId(runId: string): Promise<PipelineRun | undefined> {
    const rows = await db.select().from(pipelineRuns).where(eq(pipelineRuns.runId, runId));
    return rows[0];
  },

  async createPipelineRun(data: InsertPipelineRun): Promise<PipelineRun> {
    const rows = await db.insert(pipelineRuns).values(data).returning();
    return rows[0];
  },

  async updatePipelineRun(id: number, data: Partial<InsertPipelineRun>): Promise<PipelineRun | undefined> {
    const rows = await db
      .update(pipelineRuns)
      .set(data)
      .where(eq(pipelineRuns.id, id))
      .returning();
    return rows[0];
  },

  async getReports(assemblyId: number): Promise<Report[]> {
    return db
      .select()
      .from(reports)
      .where(eq(reports.assemblyId, assemblyId))
      .orderBy(desc(reports.createdAt));
  },

  async createReport(data: InsertReport): Promise<Report> {
    const rows = await db.insert(reports).values(data).returning();
    return rows[0];
  },
};
