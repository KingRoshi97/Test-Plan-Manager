import { eq, desc, isNull, and, like, or, lte } from "drizzle-orm";
import { db } from "./db";
import { 
  users, assemblies, deliveries, deliveryEvents, projectPackages, apiKeys, auditLogs,
  type User, type InsertUser, 
  type Assembly, type InsertAssembly,
  type Delivery, type InsertDelivery,
  type DeliveryEvent, type InsertDeliveryEvent,
  type ProjectPackage, type InsertProjectPackage,
  type ApiKey, type InsertApiKey,
  type AuditLog, type InsertAuditLog
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

  async getProjectPackage(id: string): Promise<ProjectPackage | undefined> {
    const result = await db.select().from(projectPackages).where(eq(projectPackages.id, id));
    return result[0];
  }

  async getProjectPackagesByAssemblyId(assemblyId: string): Promise<ProjectPackage[]> {
    return db.select().from(projectPackages)
      .where(eq(projectPackages.assemblyId, assemblyId))
      .orderBy(desc(projectPackages.createdAt));
  }

  async createProjectPackage(insertPkg: InsertProjectPackage): Promise<ProjectPackage> {
    const id = `pkg_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const result = await db.insert(projectPackages).values({
      id,
      assemblyId: null,
      filename: insertPkg.filename,
      mimeType: insertPkg.mimeType,
      sizeBytes: insertPkg.sizeBytes,
      sha256: insertPkg.sha256,
      objectKey: insertPkg.objectKey,
      unpackedObjectKey: null,
      scanState: "queued",
      indexState: "queued",
      summaryJson: null,
      warningsJson: null,
      errorCode: null,
      errorMessage: null,
      correlationId: insertPkg.correlationId,
    }).returning();
    return result[0];
  }

  async updateProjectPackage(id: string, updates: Partial<ProjectPackage>): Promise<ProjectPackage | undefined> {
    const result = await db.update(projectPackages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projectPackages.id, id))
      .returning();
    return result[0];
  }

  async deleteProjectPackage(id: string): Promise<boolean> {
    const result = await db.delete(projectPackages).where(eq(projectPackages.id, id)).returning();
    return result.length > 0;
  }

  // API Keys
  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return result[0];
  }

  async getApiKeyByPrefix(prefix: string): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.keyPrefix, prefix));
    return result[0];
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return db.select().from(apiKeys)
      .where(isNull(apiKeys.revokedAt))
      .orderBy(desc(apiKeys.createdAt));
  }

  async createApiKey(insertKey: InsertApiKey): Promise<ApiKey> {
    const id = `key_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const result = await db.insert(apiKeys).values({
      id,
      name: insertKey.name,
      keyHash: insertKey.keyHash,
      keyPrefix: insertKey.keyPrefix,
      scopes: insertKey.scopes || null,
      expiresAt: insertKey.expiresAt || null,
    }).returning();
    return result[0];
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const result = await db.update(apiKeys)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return result[0];
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning();
    return result.length > 0;
  }

  // Audit Logs
  async getAuditLogs(options?: { limit?: number; offset?: number; action?: string; resourceType?: string }): Promise<AuditLog[]> {
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    
    let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
    
    // Apply filters if provided
    const conditions = [];
    if (options?.action) {
      conditions.push(eq(auditLogs.action, options.action as any));
    }
    if (options?.resourceType) {
      conditions.push(eq(auditLogs.resourceType, options.resourceType));
    }
    
    if (conditions.length > 0) {
      return db.select().from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);
    }
    
    return query;
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values({
      action: insertLog.action as any,
      resourceType: insertLog.resourceType,
      resourceId: insertLog.resourceId || null,
      apiKeyId: insertLog.apiKeyId || null,
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
      requestMethod: insertLog.requestMethod || null,
      requestPath: insertLog.requestPath || null,
      statusCode: insertLog.statusCode || null,
      correlationId: insertLog.correlationId || null,
      metadata: insertLog.metadata || null,
    }).returning();
    return result[0];
  }

  // Delivery Events
  async getDeliveryEvents(deliveryId: string): Promise<DeliveryEvent[]> {
    return db.select().from(deliveryEvents)
      .where(eq(deliveryEvents.deliveryId, deliveryId))
      .orderBy(desc(deliveryEvents.occurredAt));
  }

  async createDeliveryEvent(insertEvent: InsertDeliveryEvent): Promise<DeliveryEvent> {
    const id = `evt_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const result = await db.insert(deliveryEvents).values({
      id,
      deliveryId: insertEvent.deliveryId,
      eventType: insertEvent.eventType,
      detailsJson: (insertEvent.detailsJson as any) || null,
    }).returning();
    return result[0];
  }

  async getQueuedDeliveriesForRetry(): Promise<Delivery[]> {
    const now = new Date();
    return db.select().from(deliveries)
      .where(
        and(
          eq(deliveries.state, "queued"),
          or(
            isNull(deliveries.nextAttemptAt),
            lte(deliveries.nextAttemptAt, now)
          )
        )
      )
      .orderBy(deliveries.nextAttemptAt);
  }
}
