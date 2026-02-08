import { db } from "./db.js";
import { eq, desc, and } from "drizzle-orm";
import {
  assemblies, workspaces, pipelineRuns, moduleStatuses, reports,
  type InsertAssembly, type InsertWorkspace, type InsertPipelineRun, type InsertModuleStatus, type InsertReport,
  type Assembly, type Workspace, type PipelineRun, type ModuleStatus, type Report,
} from "../shared/schema.js";

export interface IStorage {
  createAssembly(data: InsertAssembly): Promise<Assembly>;
  getAssemblies(): Promise<Assembly[]>;
  getAssembly(id: string): Promise<Assembly | undefined>;
  updateAssembly(id: string, data: Partial<InsertAssembly & { state: string; step: string | null; progress: unknown; errors: string[] | null; logsTail: string | null; updatedAt: Date; revision: number; upgradeNotes: string | null; kitType: string }>): Promise<Assembly | undefined>;
  deleteAssembly(id: string): Promise<void>;

  getWorkspaces(): Promise<Workspace[]>;
  getWorkspace(projectName: string): Promise<Workspace | undefined>;
  upsertWorkspace(data: InsertWorkspace): Promise<Workspace>;
  deleteWorkspace(projectName: string): Promise<void>;

  createPipelineRun(data: InsertPipelineRun): Promise<PipelineRun>;
  getPipelineRuns(projectName: string, limit?: number): Promise<PipelineRun[]>;
  getAllPipelineRuns(limit?: number): Promise<PipelineRun[]>;

  upsertModuleStatus(data: InsertModuleStatus): Promise<ModuleStatus>;
  getModuleStatuses(projectName: string): Promise<ModuleStatus[]>;
  bulkUpsertModuleStatuses(projectName: string, statuses: Array<{ moduleName: string; stage: string; status: string }>): Promise<void>;

  createReport(data: InsertReport): Promise<Report>;
  getReports(projectName: string, reportType?: string): Promise<Report[]>;
  getLatestReport(projectName: string, reportType: string): Promise<Report | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createAssembly(data: InsertAssembly): Promise<Assembly> {
    const [assembly] = await db.insert(assemblies).values(data).returning();
    return assembly;
  }

  async getAssemblies(): Promise<Assembly[]> {
    return db.select().from(assemblies).orderBy(desc(assemblies.createdAt));
  }

  async getAssembly(id: string): Promise<Assembly | undefined> {
    const [assembly] = await db.select().from(assemblies).where(eq(assemblies.id, id));
    return assembly;
  }

  async updateAssembly(id: string, data: Partial<InsertAssembly & { state: string; step: string | null; progress: unknown; errors: string[] | null; logsTail: string | null; updatedAt: Date; revision: number; upgradeNotes: string | null; kitType: string }>): Promise<Assembly | undefined> {
    const [updated] = await db.update(assemblies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assemblies.id, id))
      .returning();
    return updated;
  }

  async deleteAssembly(id: string): Promise<void> {
    await db.delete(assemblies).where(eq(assemblies.id, id));
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
  }

  async getWorkspace(projectName: string): Promise<Workspace | undefined> {
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.projectName, projectName));
    return ws;
  }

  async upsertWorkspace(data: InsertWorkspace): Promise<Workspace> {
    const existing = await this.getWorkspace(data.projectName);
    if (existing) {
      const [updated] = await db.update(workspaces)
        .set(data)
        .where(eq(workspaces.projectName, data.projectName))
        .returning();
      return updated;
    }
    const [created] = await db.insert(workspaces).values(data).returning();
    return created;
  }

  async deleteWorkspace(projectName: string): Promise<void> {
    await db.delete(workspaces).where(eq(workspaces.projectName, projectName));
  }

  async createPipelineRun(data: InsertPipelineRun): Promise<PipelineRun> {
    const [run] = await db.insert(pipelineRuns).values(data).returning();
    return run;
  }

  async getPipelineRuns(projectName: string, limit = 50): Promise<PipelineRun[]> {
    return db.select().from(pipelineRuns)
      .where(eq(pipelineRuns.projectName, projectName))
      .orderBy(desc(pipelineRuns.createdAt))
      .limit(limit);
  }

  async getAllPipelineRuns(limit = 50): Promise<PipelineRun[]> {
    return db.select().from(pipelineRuns)
      .orderBy(desc(pipelineRuns.createdAt))
      .limit(limit);
  }

  async upsertModuleStatus(data: InsertModuleStatus): Promise<ModuleStatus> {
    const [existing] = await db.select().from(moduleStatuses)
      .where(and(
        eq(moduleStatuses.projectName, data.projectName),
        eq(moduleStatuses.moduleName, data.moduleName),
        eq(moduleStatuses.stage, data.stage),
      ));

    if (existing) {
      const [updated] = await db.update(moduleStatuses)
        .set({ status: data.status, updatedAt: new Date() })
        .where(eq(moduleStatuses.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(moduleStatuses).values(data).returning();
    return created;
  }

  async getModuleStatuses(projectName: string): Promise<ModuleStatus[]> {
    return db.select().from(moduleStatuses)
      .where(eq(moduleStatuses.projectName, projectName));
  }

  async bulkUpsertModuleStatuses(projectName: string, statuses: Array<{ moduleName: string; stage: string; status: string }>): Promise<void> {
    for (const s of statuses) {
      await this.upsertModuleStatus({
        projectName,
        moduleName: s.moduleName,
        stage: s.stage,
        status: s.status,
      });
    }
  }

  async createReport(data: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(data).returning();
    return report;
  }

  async getReports(projectName: string, reportType?: string): Promise<Report[]> {
    if (reportType) {
      return db.select().from(reports)
        .where(and(
          eq(reports.projectName, projectName),
          eq(reports.reportType, reportType),
        ))
        .orderBy(desc(reports.createdAt));
    }
    return db.select().from(reports)
      .where(eq(reports.projectName, projectName))
      .orderBy(desc(reports.createdAt));
  }

  async getLatestReport(projectName: string, reportType: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports)
      .where(and(
        eq(reports.projectName, projectName),
        eq(reports.reportType, reportType),
      ))
      .orderBy(desc(reports.createdAt))
      .limit(1);
    return report;
  }
}

export const storage = new DatabaseStorage();
