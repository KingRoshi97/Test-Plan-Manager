import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { 
  users, assemblies, deliveries,
  type User, type InsertUser, 
  type Assembly, type InsertAssembly,
  type Delivery, type InsertDelivery
} from "@shared/schema";
import type { IStorage } from "./storage";
import { randomUUID } from "crypto";

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAssembly(id: string): Promise<Assembly | undefined> {
    const result = await db.select().from(assemblies).where(eq(assemblies.id, id));
    return result[0];
  }

  async getAssemblies(): Promise<Assembly[]> {
    return db.select().from(assemblies).orderBy(desc(assemblies.createdAt));
  }

  async createAssembly(insertAssembly: InsertAssembly): Promise<Assembly> {
    const id = `asmb_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const result = await db.insert(assemblies).values({
      id,
      projectName: insertAssembly.projectName || null,
      idea: insertAssembly.idea || null,
      context: insertAssembly.context || null,
      preset: insertAssembly.preset || null,
      domains: insertAssembly.domains || null,
      input: insertAssembly.input || null,
      state: "queued",
      step: null,
      progress: null,
      errors: null,
      kit: {
        available: false,
        zipBytes: 0,
        zipSha256: null,
        manifestSha256: null,
        agentPromptSha256: null,
      },
      kitPath: null,
      logsTail: null,
    }).returning();
    return result[0];
  }

  async updateAssembly(id: string, updates: Partial<Assembly>): Promise<Assembly | undefined> {
    const result = await db.update(assemblies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assemblies.id, id))
      .returning();
    return result[0];
  }

  async deleteAssembly(id: string): Promise<boolean> {
    const result = await db.delete(assemblies).where(eq(assemblies.id, id)).returning();
    return result.length > 0;
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    const result = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return result[0];
  }

  async getDeliveriesByAssemblyId(assemblyId: string): Promise<Delivery[]> {
    return db.select().from(deliveries)
      .where(eq(deliveries.assemblyId, assemblyId))
      .orderBy(desc(deliveries.createdAt));
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = `dlv_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const result = await db.insert(deliveries).values({
      id,
      assemblyId: insertDelivery.assemblyId,
      type: insertDelivery.type,
      label: insertDelivery.label || null,
      state: "queued",
      config: insertDelivery.config as any,
      attempts: 0,
      maxAttempts: 6,
      lastAttemptAt: null,
      result: null,
      lastError: null,
      attemptHistory: [],
    }).returning();
    return result[0];
  }

  async updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery | undefined> {
    const result = await db.update(deliveries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deliveries.id, id))
      .returning();
    return result[0];
  }

  async deleteDelivery(id: string): Promise<boolean> {
    const result = await db.delete(deliveries).where(eq(deliveries.id, id)).returning();
    return result.length > 0;
  }

  async getRun(id: string): Promise<Assembly | undefined> {
    return this.getAssembly(id);
  }

  async getRuns(): Promise<Assembly[]> {
    return this.getAssemblies();
  }

  async createRun(run: InsertAssembly): Promise<Assembly> {
    return this.createAssembly(run);
  }

  async updateRun(id: string, updates: Partial<Assembly>): Promise<Assembly | undefined> {
    return this.updateAssembly(id, updates);
  }

  async deleteRun(id: string): Promise<boolean> {
    return this.deleteAssembly(id);
  }
  
  async getHandoff(id: string): Promise<Delivery | undefined> {
    return this.getDelivery(id);
  }

  async getHandoffsByRunId(runId: string): Promise<Delivery[]> {
    return this.getDeliveriesByAssemblyId(runId);
  }

  async createHandoff(handoff: InsertDelivery): Promise<Delivery> {
    const delivery: InsertDelivery = {
      ...handoff,
      assemblyId: (handoff as any).runId || handoff.assemblyId,
    };
    return this.createDelivery(delivery);
  }

  async updateHandoff(id: string, updates: Partial<Delivery>): Promise<Delivery | undefined> {
    return this.updateDelivery(id, updates);
  }

  async deleteHandoff(id: string): Promise<boolean> {
    return this.deleteDelivery(id);
  }
}
