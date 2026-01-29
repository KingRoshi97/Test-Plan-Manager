import { 
  type User, type InsertUser, 
  type Assembly, type InsertAssembly, type AssemblyState, type AssemblyStep, type Kit, type AssemblyProgress,
  type Delivery, type InsertDelivery, type DeliveryState, type DeliveryAttempt
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

  constructor() {
    this.users = new Map();
    this.assemblies = new Map();
    this.deliveries = new Map();
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
