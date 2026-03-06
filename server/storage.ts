import { db } from "./db.js";
import { assemblies, pipelineRuns, moduleStatuses, reports } from "../shared/schema.js";
import type { Assembly, InsertAssembly, PipelineRun, InsertPipelineRun, Report, InsertReport } from "../shared/schema.js";
import { eq, desc, sql, and, gte } from "drizzle-orm";

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

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [overall] = await db
      .select({
        totalRuns: sql<number>`count(*)::int`,
        completedRuns: sql<number>`count(*) filter (where ${pipelineRuns.status} = 'completed')::int`,
        failedRuns: sql<number>`count(*) filter (where ${pipelineRuns.status} = 'failed')::int`,
        avgDurationMs: sql<number>`coalesce(avg(extract(epoch from (${pipelineRuns.completedAt} - ${pipelineRuns.startedAt})) * 1000) filter (where ${pipelineRuns.status} = 'completed' and ${pipelineRuns.completedAt} is not null), 0)::int`,
        totalTokensUsed: sql<number>`coalesce(sum(case when ${pipelineRuns.tokenUsage}->>'total' ~ '^[0-9]+$' then (${pipelineRuns.tokenUsage}->>'total')::int else 0 end), 0)::int`,
        maxDurationMs: sql<number>`coalesce(max(extract(epoch from (${pipelineRuns.completedAt} - ${pipelineRuns.startedAt})) * 1000) filter (where ${pipelineRuns.completedAt} is not null), 0)::int`,
      })
      .from(pipelineRuns);

    const [todayStats] = await db
      .select({
        runsToday: sql<number>`count(*)::int`,
        completedToday: sql<number>`count(*) filter (where ${pipelineRuns.status} = 'completed')::int`,
        failedToday: sql<number>`count(*) filter (where ${pipelineRuns.status} = 'failed')::int`,
      })
      .from(pipelineRuns)
      .where(gte(pipelineRuns.startedAt, todayStart));

    const longestRunRows = await db
      .select({
        durationMs: sql<number>`extract(epoch from (${pipelineRuns.completedAt} - ${pipelineRuns.startedAt}))::int * 1000`,
        assemblyId: pipelineRuns.assemblyId,
      })
      .from(pipelineRuns)
      .where(sql`${pipelineRuns.completedAt} is not null`)
      .orderBy(sql`extract(epoch from (${pipelineRuns.completedAt} - ${pipelineRuns.startedAt})) desc`)
      .limit(1);

    let longestRun: { durationMs: number; projectName: string } | null = null;
    if (longestRunRows.length > 0) {
      const assembly = await db
        .select({ projectName: assemblies.projectName })
        .from(assemblies)
        .where(eq(assemblies.id, longestRunRows[0].assemblyId))
        .limit(1);
      longestRun = {
        durationMs: longestRunRows[0].durationMs,
        projectName: assembly[0]?.projectName || "Unknown",
      };
    }

    const recentRuns = await db
      .select({ status: pipelineRuns.status })
      .from(pipelineRuns)
      .orderBy(desc(pipelineRuns.startedAt))
      .limit(10);

    const recentTotal = recentRuns.length;
    const recentFailed = recentRuns.filter((r) => r.status === "failed").length;
    const recentFailureRate = recentTotal > 0 ? Math.round((recentFailed / recentTotal) * 100) : 0;

    const totalRuns = overall.totalRuns;
    const completedRuns = overall.completedRuns;
    const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;

    return {
      totalRuns,
      completedRuns,
      failedRuns: overall.failedRuns,
      successRate,
      avgDurationMs: overall.avgDurationMs,
      totalTokensUsed: overall.totalTokensUsed,
      runsToday: todayStats.runsToday,
      completedToday: todayStats.completedToday,
      failedToday: todayStats.failedToday,
      longestRun,
      recentFailureRate,
    };
  },
};
