/**
 * Tests for axion-docs-check.ts
 * 
 * Validates documentation drift detection:
 * - Script inventory completeness
 * - Orphan script detection
 * - Contamination scanning
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = path.resolve(__dirname, '../../axion');
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Documentation Drift Check', () => {
  describe('axion-docs-check validation', () => {
    it('should pass with current documentation', () => {
      const result = execSync('npx tsx axion/scripts/axion-docs-check.ts --json', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });
      
      const json = JSON.parse(result.trim());
      
      expect(json.status).toBe('PASS');
      expect(json.issues.missing_scripts).toHaveLength(0);
      expect(json.issues.orphan_scripts).toHaveLength(0);
      expect(json.issues.missing_docs).toHaveLength(0);
    });
    
    it('should report correct script counts', () => {
      const result = execSync('npx tsx axion/scripts/axion-docs-check.ts --json', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });
      
      const json = JSON.parse(result.trim());
      
      // Should have all scripts mapped
      expect(json.summary.scripts_mapped).toBe(json.summary.scripts_exist);
      expect(json.summary.scripts_mapped).toBeGreaterThanOrEqual(29);
      
      // Web-invoked should be majority
      expect(json.summary.web_invoked).toBeGreaterThan(json.summary.internal_only);
    });
    
    it('should have required docs present', () => {
      const requiredDocs = [
        'docs/product/WEBAPP_FEATURE_MAPPING.md',
        'axion/docs/SYSTEM_UPGRADE_LOG.md',
        'axion/docs/INDEX.md'
      ];
      
      for (const doc of requiredDocs) {
        const fullPath = path.join(PROJECT_ROOT, doc);
        expect(fs.existsSync(fullPath), `Missing: ${doc}`).toBe(true);
      }
    });
  });
  
  describe('Contamination detection', () => {
    const WEBAPP_MAPPING = path.join(PROJECT_ROOT, 'docs/product/WEBAPP_FEATURE_MAPPING.md');
    
    it('should not contain banned dev-speak tokens', () => {
      const content = fs.readFileSync(WEBAPP_MAPPING, 'utf-8').toLowerCase();
      
      const bannedTokens = [
        'tests pass',
        'test suite',
        'test fixtures',
        'unit test',
        'integration test',
        'test coverage',
        'vitest',
        'jest'
      ];
      
      for (const token of bannedTokens) {
        expect(content.includes(token), `Found banned token: "${token}"`).toBe(false);
      }
    });
    
    it('should allow capability-focused language', () => {
      const content = fs.readFileSync(WEBAPP_MAPPING, 'utf-8').toLowerCase();
      
      // These are capability terms that should be allowed
      const allowedTerms = [
        'reason codes',  // UI renders reason codes
        'test viewer',   // Web app surface
        'test report',   // Artifact name
        'test runner'    // Feature name
      ];
      
      // At least some of these should be present (capability-focused)
      const found = allowedTerms.filter(term => content.includes(term));
      expect(found.length).toBeGreaterThan(0);
    });
  });
  
  describe('Script inventory coverage', () => {
    const WEBAPP_MAPPING = path.join(PROJECT_ROOT, 'docs/product/WEBAPP_FEATURE_MAPPING.md');
    const SCRIPTS_DIR = path.join(AXION_ROOT, 'scripts');
    
    it('should list all axion scripts', () => {
      const content = fs.readFileSync(WEBAPP_MAPPING, 'utf-8');
      const scripts = fs.readdirSync(SCRIPTS_DIR)
        .filter(f => f.startsWith('axion-') && f.endsWith('.ts'))
        .map(f => f.replace('.ts', ''));
      
      for (const script of scripts) {
        expect(content.includes(script), `Missing script in inventory: ${script}`).toBe(true);
      }
    });
  });
});
