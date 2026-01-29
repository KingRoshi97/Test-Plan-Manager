import { 
  type User, type InsertUser, 
  type Assembly, type InsertAssembly, type AssemblyState, type AssemblyStep, type Kit, type AssemblyProgress,
  type Delivery, type InsertDelivery, type DeliveryState, type DeliveryAttempt,
  type DeliveryEvent, type InsertDeliveryEvent,
  type ProjectPackage, type InsertProjectPackage, type ProjectSummary, type ProjectWarning,
  type ApiKey, type InsertApiKey,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAssembly(id: string): Promise<Assembly | undefined>;
  getAssemblies(): Promise<Assembly[]>;
  createAssembly(assembly: InsertAssembly): Promise<Assembly>;
  updateAssembly(id: string, updates: Partial<Assembly>): Promise<Assembly | undefined>;
  deleteAssembly(id: string): Promise<boolean>;
  
  getDelivery(id: string): Promise<Delivery | undefined>;
  getDeliveriesByAssemblyId(assemblyId: string): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery | undefined>;
  deleteDelivery(id: string): Promise<boolean>;
  
  getProjectPackage(id: string): Promise<ProjectPackage | undefined>;
  getProjectPackagesByAssemblyId(assemblyId: string): Promise<ProjectPackage[]>;
  createProjectPackage(pkg: InsertProjectPackage): Promise<ProjectPackage>;
  updateProjectPackage(id: string, updates: Partial<ProjectPackage>): Promise<ProjectPackage | undefined>;
  deleteProjectPackage(id: string): Promise<boolean>;
  attachProjectPackageToAssembly(packageId: string, assemblyId: string): Promise<ProjectPackage | undefined>;
  
  // API Keys
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getApiKeyByPrefix(prefix: string): Promise<ApiKey | undefined>;
  getApiKeys(): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: string): Promise<boolean>;
  
  // Audit Logs
  getAuditLogs(options?: { limit?: number; offset?: number; action?: string; resourceType?: string }): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  // Delivery Events
  getDeliveryEvents(deliveryId: string): Promise<DeliveryEvent[]>;
  createDeliveryEvent(event: InsertDeliveryEvent): Promise<DeliveryEvent>;
  getQueuedDeliveriesForRetry(): Promise<Delivery[]>;

  // Backward compatibility aliases
  getRun(id: string): Promise<Assembly | undefined>;
  getRuns(): Promise<Assembly[]>;
  createRun(run: InsertAssembly): Promise<Assembly>;
  updateRun(id: string, updates: Partial<Assembly>): Promise<Assembly | undefined>;
  deleteRun(id: string): Promise<boolean>;
  
  getHandoff(id: string): Promise<Delivery | undefined>;
  getHandoffsByRunId(runId: string): Promise<Delivery[]>;
  createHandoff(handoff: InsertDelivery): Promise<Delivery>;
  updateHandoff(id: string, updates: Partial<Delivery>): Promise<Delivery | undefined>;
  deleteHandoff(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assemblies: Map<string, Assembly>;
  private deliveries: Map<string, Delivery>;
  private projectPackages: Map<string, ProjectPackage>;

  constructor() {
    this.users = new Map();
    this.assemblies = new Map();
    this.deliveries = new Map();
    this.projectPackages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAssembly(id: string): Promise<Assembly | undefined> {
    return this.assemblies.get(id);
  }

  async getAssemblies(): Promise<Assembly[]> {
    return Array.from(this.assemblies.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createAssembly(insertAssembly: InsertAssembly): Promise<Assembly> {
    const id = `asmb_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date();
    const assembly: Assembly = {
      id,
      projectName: insertAssembly.projectName || null,
      idea: insertAssembly.idea || null,
      context: insertAssembly.context || null,
      preset: insertAssembly.preset || null,
      category: insertAssembly.category || null,
      mode: insertAssembly.mode || null,
      presetId: insertAssembly.presetId || null,
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
      projectPackageId: insertAssembly.projectPackageId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.assemblies.set(id, assembly);
    return assembly;
  }

  async updateAssembly(id: string, updates: Partial<Assembly>): Promise<Assembly | undefined> {
    const assembly = this.assemblies.get(id);
    if (!assembly) return undefined;
    
    const updatedAssembly: Assembly = {
      ...assembly,
      ...updates,
      updatedAt: new Date(),
    };
    this.assemblies.set(id, updatedAssembly);
    return updatedAssembly;
  }

  async deleteAssembly(id: string): Promise<boolean> {
    return this.assemblies.delete(id);
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async getDeliveriesByAssemblyId(assemblyId: string): Promise<Delivery[]> {
    return Array.from(this.deliveries.values())
      .filter(d => d.assemblyId === assemblyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = `dlv_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date();
    const delivery: Delivery = {
      id,
      assemblyId: insertDelivery.assemblyId,
      type: insertDelivery.type,
      label: insertDelivery.label || null,
      state: "queued",
      config: insertDelivery.config as any,
      attempts: 0,
      maxAttempts: 6,
      lastAttemptAt: null,
      nextAttemptAt: null,
      result: null,
      lastError: null,
      attemptHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (!delivery) return undefined;
    
    const updatedDelivery: Delivery = {
      ...delivery,
      ...updates,
      updatedAt: new Date(),
    };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async deleteDelivery(id: string): Promise<boolean> {
    return this.deliveries.delete(id);
  }

  async getProjectPackage(id: string): Promise<ProjectPackage | undefined> {
    return this.projectPackages.get(id);
  }

  async getProjectPackagesByAssemblyId(assemblyId: string): Promise<ProjectPackage[]> {
    return Array.from(this.projectPackages.values())
      .filter(p => p.assemblyId === assemblyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createProjectPackage(insertPkg: InsertProjectPackage): Promise<ProjectPackage> {
    const id = `pkg_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date();
    const pkg: ProjectPackage = {
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
      createdAt: now,
      updatedAt: now,
    };
    this.projectPackages.set(id, pkg);
    return pkg;
  }

  async updateProjectPackage(id: string, updates: Partial<ProjectPackage>): Promise<ProjectPackage | undefined> {
    const pkg = this.projectPackages.get(id);
    if (!pkg) return undefined;
    
    const updatedPkg: ProjectPackage = {
      ...pkg,
      ...updates,
      updatedAt: new Date(),
    };
    this.projectPackages.set(id, updatedPkg);
    return updatedPkg;
  }

  async deleteProjectPackage(id: string): Promise<boolean> {
    return this.projectPackages.delete(id);
  }

  async attachProjectPackageToAssembly(packageId: string, assemblyId: string): Promise<ProjectPackage | undefined> {
    const pkg = this.projectPackages.get(packageId);
    if (!pkg) return undefined;
    
    // Update both sides of the relationship
    const assembly = this.assemblies.get(assemblyId);
    if (assembly) {
      const updatedAssembly = { ...assembly, projectPackageId: packageId, updatedAt: new Date() };
      this.assemblies.set(assemblyId, updatedAssembly);
    }
    
    const updated = { ...pkg, assemblyId, updatedAt: new Date() };
    this.projectPackages.set(packageId, updated);
    return updated;
  }

  // API Keys (stub implementation for MemStorage)
  private apiKeys: Map<string, ApiKey> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }

  async getApiKeyByPrefix(prefix: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(k => k.keyPrefix === prefix);
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter(k => !k.revokedAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createApiKey(insertKey: InsertApiKey): Promise<ApiKey> {
    const id = `key_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date();
    const key: ApiKey = {
      id,
      name: insertKey.name,
      keyHash: insertKey.keyHash,
      keyPrefix: insertKey.keyPrefix,
      scopes: insertKey.scopes || null,
      lastUsedAt: null,
      expiresAt: insertKey.expiresAt || null,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.apiKeys.set(id, key);
    return key;
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const key = this.apiKeys.get(id);
    if (!key) return undefined;
    const updatedKey = { ...key, ...updates, updatedAt: new Date() };
    this.apiKeys.set(id, updatedKey);
    return updatedKey;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  async getAuditLogs(options?: { limit?: number; offset?: number; action?: string; resourceType?: string }): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (options?.action) {
      logs = logs.filter(l => l.action === options.action);
    }
    if (options?.resourceType) {
      logs = logs.filter(l => l.resourceType === options.resourceType);
    }
    
    const offset = options?.offset || 0;
    const limit = options?.limit || 100;
    return logs.slice(offset, offset + limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = `log_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const log: AuditLog = {
      id,
      action: insertLog.action as AuditLog["action"],
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
      createdAt: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  // Delivery Events
  private deliveryEvents: Map<string, DeliveryEvent> = new Map();

  async getDeliveryEvents(deliveryId: string): Promise<DeliveryEvent[]> {
    return Array.from(this.deliveryEvents.values())
      .filter(e => e.deliveryId === deliveryId)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  async createDeliveryEvent(insertEvent: InsertDeliveryEvent): Promise<DeliveryEvent> {
    const id = `evt_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const event: DeliveryEvent = {
      id,
      deliveryId: insertEvent.deliveryId,
      eventType: insertEvent.eventType,
      occurredAt: new Date(),
      detailsJson: (insertEvent.detailsJson as any) || null,
    };
    this.deliveryEvents.set(id, event);
    return event;
  }

  async getQueuedDeliveriesForRetry(): Promise<Delivery[]> {
    const now = new Date();
    return Array.from(this.deliveries.values())
      .filter(d => d.state === "queued" && (!d.nextAttemptAt || new Date(d.nextAttemptAt) <= now))
      .sort((a, b) => {
        if (!a.nextAttemptAt) return -1;
        if (!b.nextAttemptAt) return 1;
        return new Date(a.nextAttemptAt).getTime() - new Date(b.nextAttemptAt).getTime();
      });
  }

  // Backward compatibility aliases
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
    // Map runId to assemblyId for backward compatibility
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

import { DbStorage } from "./db-storage";

export const storage: IStorage = new DbStorage();
