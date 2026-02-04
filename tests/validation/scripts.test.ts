import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { fileExists, readTextFile } from '../helpers/test-utils';

const AXION_ROOT = path.join(process.cwd(), 'axion');
const SCRIPTS_DIR = path.join(AXION_ROOT, 'scripts');

describe('AXION Scripts Validation', () => {
  describe('required scripts exist', () => {
    const requiredScripts = [
      'axion-kit-create.ts',
      'axion-run.ts',
      'axion-status.ts',
      'axion-doctor.ts',
      'axion-init.ts',
      'axion-build.ts',
      'axion-scaffold-app.ts',
      'axion-test.ts',
      'axion-lock.ts',
      'axion-verify-seams.ts'
    ];
    
    for (const script of requiredScripts) {
      it(`should have ${script}`, () => {
        expect(fileExists(path.join(SCRIPTS_DIR, script))).toBe(true);
      });
    }
  });
  
  describe('scripts have proper structure', () => {
    const scripts = fs.readdirSync(SCRIPTS_DIR)
      .filter(f => f.endsWith('.ts') && !f.includes('.test.'));
    
    for (const script of scripts) {
      describe(script, () => {
        const content = readTextFile(path.join(SCRIPTS_DIR, script));
        
        it('should have shebang or be importable', () => {
          expect(content).toBeTruthy();
          const hasShebang = content!.startsWith('#!/usr/bin/env');
          const hasImports = content!.includes('import ');
          expect(hasShebang || hasImports).toBe(true);
        });
        
        it('should not have merge conflicts', () => {
          expect(content).not.toMatch(/^<{7}/m);
          expect(content).not.toMatch(/^>{7}/m);
          expect(content).not.toMatch(/^={7}$/m);
        });
      });
    }
  });
  
  describe('lib directory', () => {
    const libDir = path.join(SCRIPTS_DIR, 'lib');
    
    it('should exist', () => {
      expect(fileExists(libDir)).toBe(true);
    });
    
    it('should have path-safety.ts', () => {
      expect(fileExists(path.join(libDir, 'path-safety.ts'))).toBe(true);
    });
  });
});
