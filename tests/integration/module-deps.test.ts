import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { readJsonFile } from '../helpers/test-utils';

interface Module {
  name: string;
  slug: string;
  dependencies: string[];
  type?: string;
}

interface DomainsConfig {
  modules: Module[];
}

describe('Module Dependency Graph', () => {
  const domainsPath = path.join(process.cwd(), 'axion', 'config', 'domains.json');
  const domains = readJsonFile<DomainsConfig>(domainsPath);
  
  it('should load domains configuration', () => {
    expect(domains).toBeTruthy();
    expect(domains?.modules).toBeTruthy();
    expect(Array.isArray(domains?.modules)).toBe(true);
  });
  
  describe('dependency validation', () => {
    const modules = domains?.modules || [];
    const moduleSlugs = new Set(modules.map(m => m.slug));
    
    it('should have all dependencies reference existing modules', () => {
      for (const mod of modules) {
        for (const dep of mod.dependencies || []) {
          expect(moduleSlugs.has(dep)).toBe(true);
        }
      }
    });
    
    it('should have no circular dependencies at depth 1', () => {
      const moduleMap = new Map(modules.map(m => [m.slug, m]));
      
      for (const mod of modules) {
        for (const dep of mod.dependencies || []) {
          const depModule = moduleMap.get(dep);
          if (depModule) {
            expect(depModule.dependencies || []).not.toContain(mod.slug);
          }
        }
      }
    });
    
    it('should have foundation modules with minimal dependencies', () => {
      const foundationSlugs = ['architecture', 'systems', 'contracts'];
      
      for (const slug of foundationSlugs) {
        const mod = modules.find(m => m.slug === slug);
        if (mod) {
          const nonFoundationDeps = (mod.dependencies || []).filter(d => !foundationSlugs.includes(d));
          expect(nonFoundationDeps.length).toBe(0);
        }
      }
    });
  });
  
  describe('topological order', () => {
    const modules = domains?.modules || [];
    
    it('should be sortable topologically', () => {
      const moduleMap = new Map(modules.map(m => [m.slug, m]));
      const visited = new Set<string>();
      const sorted: string[] = [];
      
      function visit(slug: string, ancestors: Set<string>): boolean {
        if (ancestors.has(slug)) {
          return false;
        }
        if (visited.has(slug)) {
          return true;
        }
        
        ancestors.add(slug);
        const mod = moduleMap.get(slug);
        
        if (mod) {
          for (const dep of mod.dependencies || []) {
            if (!visit(dep, ancestors)) {
              return false;
            }
          }
        }
        
        ancestors.delete(slug);
        visited.add(slug);
        sorted.push(slug);
        return true;
      }
      
      let hasNoCycles = true;
      for (const mod of modules) {
        if (!visit(mod.slug, new Set())) {
          hasNoCycles = false;
          break;
        }
      }
      
      expect(hasNoCycles).toBe(true);
      expect(sorted.length).toBe(modules.length);
    });
  });
});
