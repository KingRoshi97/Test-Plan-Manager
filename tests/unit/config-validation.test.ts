import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { readJsonFile } from '../helpers/test-utils';

const AXION_ROOT = path.join(process.cwd(), 'axion');
const CONFIG_DIR = path.join(AXION_ROOT, 'config');

describe('AXION Configuration Files', () => {
  describe('domains.json', () => {
    const domainsPath = path.join(CONFIG_DIR, 'domains.json');
    
    it('should exist and be valid JSON', () => {
      expect(fs.existsSync(domainsPath)).toBe(true);
      const domains = readJsonFile(domainsPath);
      expect(domains).toBeTruthy();
    });
    
    it('should have required module definitions', () => {
      const domains = readJsonFile<Record<string, unknown>>(domainsPath);
      expect(domains).toBeTruthy();
      
      const requiredModuleSlugs = [
        'architecture', 'systems', 'contracts',
        'database', 'data', 'auth',
        'backend', 'integrations', 'state', 'frontend', 'fullstack',
        'testing', 'quality', 'security', 'devops', 'cloud', 'devex',
        'mobile', 'desktop'
      ];
      
      const modulesList = domains?.modules as Record<string, unknown>[] | undefined;
      if (modulesList && Array.isArray(modulesList)) {
        const moduleSlugs = modulesList.map((m: Record<string, unknown>) => m.slug);
        for (const required of requiredModuleSlugs) {
          expect(moduleSlugs).toContain(required);
        }
      }
    });
    
    it('should define dependencies for each module', () => {
      const domains = readJsonFile<Record<string, unknown>>(domainsPath);
      const modulesList = domains?.modules as Record<string, unknown>[] | undefined;
      
      if (modulesList && Array.isArray(modulesList)) {
        for (const mod of modulesList) {
          expect(mod).toHaveProperty('dependencies');
          expect(Array.isArray(mod.dependencies)).toBe(true);
        }
      }
    });
  });
  
  describe('presets.json', () => {
    const presetsPath = path.join(CONFIG_DIR, 'presets.json');
    
    it('should exist and be valid JSON', () => {
      expect(fs.existsSync(presetsPath)).toBe(true);
      const presets = readJsonFile(presetsPath);
      expect(presets).toBeTruthy();
    });
    
    it('should have system preset defined', () => {
      const presets = readJsonFile<Record<string, unknown>>(presetsPath);
      expect(presets).toBeTruthy();
      expect(presets?.presets).toBeTruthy();
      
      const presetsList = presets?.presets as Record<string, unknown>;
      expect(presetsList).toHaveProperty('system');
    });
  });
  
  describe('stack_profiles.json', () => {
    const stackPath = path.join(CONFIG_DIR, 'stack_profiles.json');
    
    it('should exist and be valid JSON', () => {
      expect(fs.existsSync(stackPath)).toBe(true);
      const stacks = readJsonFile(stackPath);
      expect(stacks).toBeTruthy();
    });
    
    it('should have default-web-saas profile', () => {
      const stacks = readJsonFile<Record<string, unknown>>(stackPath);
      expect(stacks).toBeTruthy();
      
      const profiles = stacks?.profiles as Record<string, unknown>;
      expect(profiles).toHaveProperty('default-web-saas');
    });
  });
  
  describe('coverage_map.json', () => {
    const coveragePath = path.join(CONFIG_DIR, 'coverage_map.json');
    
    it('should exist and be valid JSON', () => {
      expect(fs.existsSync(coveragePath)).toBe(true);
      const coverage = readJsonFile(coveragePath);
      expect(coverage).toBeTruthy();
    });
  });
});
