import { 
  type User, type InsertUser, 
  type Run, type InsertRun, type RunState, type RunStep, type RunBundle, type RunProgress,
  type Handoff, type InsertHandoff, type HandoffState, type HandoffAttempt
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getRun(id: string): Promise<Run | undefined>;
  getRuns(): Promise<Run[]>;
  createRun(run: InsertRun): Promise<Run>;
  updateRun(id: string, updates: Partial<Run>): Promise<Run | undefined>;
  deleteRun(id: string): Promise<boolean>;
  
  getHandoff(id: string): Promise<Handoff | undefined>;
  getHandoffsByRunId(runId: string): Promise<Handoff[]>;
  createHandoff(handoff: InsertHandoff): Promise<Handoff>;
  updateHandoff(id: string, updates: Partial<Handoff>): Promise<Handoff | undefined>;
  deleteHandoff(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private runs: Map<string, Run>;
  private handoffs: Map<string, Handoff>;

  constructor() {
    this.users = new Map();
    this.runs = new Map();
    this.handoffs = new Map();
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

  async getRun(id: string): Promise<Run | undefined> {
    return this.runs.get(id);
  }

  async getRuns(): Promise<Run[]> {
    return Array.from(this.runs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createRun(insertRun: InsertRun): Promise<Run> {
    const id = `run_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date();
    const run: Run = {
      id,
      projectName: insertRun.projectName || null,
      idea: insertRun.idea,
      context: insertRun.context || null,
      preset: insertRun.preset || null,
      domains: insertRun.domains || null,
      state: "queued",
      step: null,
      progress: null,
      errors: null,
      bundle: {
        available: false,
        zipBytes: 0,
        zipSha256: null,
        manifestSha256: null,
        agentPromptSha256: null,
      },
      bundlePath: null,
      logsTail: null,
      createdAt: now,
      updatedAt: now,
    };
    this.runs.set(id, run);
    return run;
  }

  async updateRun(id: string, updates: Partial<Run>): Promise<Run | undefined> {
    const run = this.runs.get(id);
    if (!run) return undefined;
    
    const updatedRun: Run = {
      ...run,
      ...updates,
      updatedAt: new Date(),
    };
    this.runs.set(id, updatedRun);
    return updatedRun;
  }

  async deleteRun(id: string): Promise<boolean> {
    return this.runs.delete(id);
  }

  async getHandoff(id: string): Promise<Handoff | undefined> {
    return this.handoffs.get(id);
  }

  async getHandoffsByRunId(runId: string): Promise<Handoff[]> {
    return Array.from(this.handoffs.values())
      .filter(h => h.runId === runId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createHandoff(insertHandoff: InsertHandoff): Promise<Handoff> {
    const id = `ho_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date();
    const handoff: Handoff = {
      id,
      runId: insertHandoff.runId,
      type: insertHandoff.type,
      label: insertHandoff.label || null,
      state: "queued",
      config: insertHandoff.config as any,
      attempts: 0,
      maxAttempts: 6,
      lastAttemptAt: null,
      result: null,
      lastError: null,
      attemptHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    this.handoffs.set(id, handoff);
    return handoff;
  }

  async updateHandoff(id: string, updates: Partial<Handoff>): Promise<Handoff | undefined> {
    const handoff = this.handoffs.get(id);
    if (!handoff) return undefined;
    
    const updatedHandoff: Handoff = {
      ...handoff,
      ...updates,
      updatedAt: new Date(),
    };
    this.handoffs.set(id, updatedHandoff);
    return updatedHandoff;
  }

  async deleteHandoff(id: string): Promise<boolean> {
    return this.handoffs.delete(id);
  }
}

export const storage = new MemStorage();
