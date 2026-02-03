/**
 * AXION Preset Resolution Tests
 * 
 * Validates dependency closure algorithm, canonical ordering, and guard enforcement.
 */

import { describe, it } from '../helpers/test-runner.js';
import { expect } from '../helpers/test-utils.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(__dirname, '../../config/domains.json');
const PRESETS_PATH = path.resolve(__dirname, '../../config/presets.json');

interface Module {
  name: string;
  slug: string;
  dependencies?: string[];
}

interface Config {
  modules: Module[];
  canonical_order: string[];
  stages: string[];
}

interface Preset {
  modules: string[];
  include_dependencies: boolean;
  guards?: {
    disallow_lock?: boolean;
    lock_requires_verify_pass?: boolean;
  };
}

interface PresetsConfig {
  stage_plans: Record<string, string[]>;
  presets: Record<string, Preset>;
}

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadPresets(): PresetsConfig {
  return JSON.parse(fs.readFileSync(PRESETS_PATH, 'utf-8'));
}

function detectCycle(modules: Module[]): string[] | null {
  const depsOf = new Map<string, string[]>();
  for (const m of modules) {
    depsOf.set(m.slug, m.dependencies || []);
  }
  
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const cyclePath: string[] = [];
  
  function dfs(node: string): string[] | null {
    if (visiting.has(node)) {
      const cycleStart = cyclePath.indexOf(node);
      return [...cyclePath.slice(cycleStart), node];
    }
    if (visited.has(node)) return null;
    
    visiting.add(node);
    cyclePath.push(node);
    
    for (const dep of depsOf.get(node) || []) {
      const cycle = dfs(dep);
      if (cycle) return cycle;
    }
    
    cyclePath.pop();
    visiting.delete(node);
    visited.add(node);
    return null;
  }
  
  for (const m of modules) {
    const cycle = dfs(m.slug);
    if (cycle) return cycle;
  }
  
  return null;
}

function computeDependencyClosure(seeds: string[], modules: Module[]): Set<string> {
  const depsOf = new Map<string, string[]>();
  for (const m of modules) {
    depsOf.set(m.slug, m.dependencies || []);
  }
  
  const resolved = new Set<string>();
  const stack = [...seeds];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (resolved.has(current)) continue;
    resolved.add(current);
    
    for (const dep of depsOf.get(current) || []) {
      if (!resolved.has(dep)) {
        stack.push(dep);
      }
    }
  }
  
  return resolved;
}

function resolveModules(seeds: string[], includeDeps: boolean, config: Config): string[] {
  let resolved: Set<string>;
  if (includeDeps) {
    resolved = computeDependencyClosure(seeds, config.modules);
  } else {
    resolved = new Set(seeds);
  }
  return config.canonical_order.filter(slug => resolved.has(slug));
}

describe('AXION Preset Resolution Tests', () => {
  it('config has no cycles in dependency graph', () => {
    const config = loadConfig();
    const cycle = detectCycle(config.modules);
    expect(cycle).toBe(null);
  });
  
  it('canonical_order is valid topological order', () => {
    const config = loadConfig();
    const indexMap = new Map<string, number>();
    config.canonical_order.forEach((slug, i) => indexMap.set(slug, i));
    
    for (const m of config.modules) {
      const moduleIndex = indexMap.get(m.slug)!;
      for (const dep of m.dependencies || []) {
        const depIndex = indexMap.get(dep)!;
        expect(depIndex < moduleIndex).toBe(true);
      }
    }
  });
  
  it('mobile preset resolves correct closure in canonical order', () => {
    const config = loadConfig();
    const resolved = resolveModules(['mobile'], true, config);
    
    const expected = ['architecture', 'systems', 'contracts', 'state', 'frontend', 'mobile'];
    expect(resolved).toEqual(expected);
  });
  
  it('backend-api preset resolves correct closure', () => {
    const config = loadConfig();
    const resolved = resolveModules(['backend'], true, config);
    
    const expected = ['architecture', 'systems', 'contracts', 'database', 'auth', 'backend'];
    expect(resolved).toEqual(expected);
  });
  
  it('fullstack preset resolves both frontend and backend chains', () => {
    const config = loadConfig();
    const resolved = resolveModules(['fullstack'], true, config);
    
    expect(resolved).toContain('architecture');
    expect(resolved).toContain('contracts');
    expect(resolved).toContain('database');
    expect(resolved).toContain('auth');
    expect(resolved).toContain('backend');
    expect(resolved).toContain('state');
    expect(resolved).toContain('frontend');
    expect(resolved).toContain('fullstack');
    
    expect(resolved.indexOf('architecture')).toBe(0);
    expect(resolved.indexOf('fullstack')).toBe(resolved.length - 1);
  });
  
  it('ops preset resolves large dependency tree', () => {
    const config = loadConfig();
    const resolved = resolveModules(['devops', 'cloud', 'devex'], true, config);
    
    expect(resolved).toContain('backend');
    expect(resolved).toContain('testing');
    expect(resolved).toContain('quality');
    expect(resolved).toContain('devops');
    expect(resolved).toContain('cloud');
    expect(resolved).toContain('devex');
  });
  
  it('mobile-only (no deps) resolves only mobile', () => {
    const config = loadConfig();
    const resolved = resolveModules(['mobile'], false, config);
    
    expect(resolved).toEqual(['mobile']);
  });
  
  it('multiple seeds merge their closures', () => {
    const config = loadConfig();
    const resolved = resolveModules(['mobile', 'desktop'], true, config);
    
    expect(resolved).toContain('mobile');
    expect(resolved).toContain('desktop');
    expect(resolved).toContain('frontend');
    expect(resolved).toContain('state');
    
    expect(resolved.indexOf('mobile') < resolved.indexOf('desktop')).toBe(true);
  });
  
  it('presets.json has valid module references', () => {
    const config = loadConfig();
    const presets = loadPresets();
    const validSlugs = new Set(config.canonical_order);
    
    for (const [name, preset] of Object.entries(presets.presets)) {
      for (const slug of preset.modules) {
        expect(validSlugs.has(slug)).toBe(true);
      }
    }
  });
  
  it('prelock preset has disallow_lock guard', () => {
    const presets = loadPresets();
    const prelock = presets.presets['prelock'];
    
    expect(prelock).toBeTruthy();
    expect(prelock.guards?.disallow_lock).toBe(true);
  });
  
  it('all stage plans have valid stages', () => {
    const config = loadConfig();
    const presets = loadPresets();
    const validStages = new Set(config.stages);
    
    for (const [name, stages] of Object.entries(presets.stage_plans)) {
      for (const stage of stages) {
        expect(validStages.has(stage)).toBe(true);
      }
    }
  });
});
