import { type User, type InsertUser, type Run, type InsertRun, type RunStatus } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private runs: Map<string, Run>;

  constructor() {
    this.users = new Map();
    this.runs = new Map();
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
    const id = randomUUID();
    const now = new Date();
    const run: Run = {
      id,
      idea: insertRun.idea,
      context: insertRun.context || null,
      status: "created",
      currentStep: null,
      bundlePath: null,
      errorMessage: null,
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
}

export const storage = new MemStorage();
