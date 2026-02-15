import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { listDirs, fileExists, readTextFile } from '../helpers/test-utils';

const AXION_ROOT = path.join(process.cwd(), 'axion');
const TEMPLATES_DIR = path.join(AXION_ROOT, 'templates');

describe('AXION Templates Validation', () => {
  const templateDirs = listDirs(TEMPLATES_DIR);
  
  describe('template directory structure', () => {
    it('should have template directories', () => {
      expect(templateDirs.length).toBeGreaterThan(0);
    });
    
    it('should have core templates', () => {
      expect(fileExists(path.join(TEMPLATES_DIR, 'core'))).toBe(true);
    });
  });
  
  describe('module templates', () => {
    const moduleDirs = templateDirs.filter(d => !d.startsWith('_') && d !== 'core');
    
    it('should have module template directories or only core', () => {
      expect(templateDirs.length).toBeGreaterThan(0);
    });

    for (const dir of moduleDirs) {
      describe(`${dir} template`, () => {
        const templateDir = path.join(TEMPLATES_DIR, dir);
        
        it('should have a template file', () => {
          const files = fs.readdirSync(templateDir);
          const hasTemplate = files.some(f => f.endsWith('.md') || f.endsWith('.template.md'));
          expect(hasTemplate).toBe(true);
        });
      });
    }
  });
  
  describe('core templates', () => {
    const coreDir = path.join(TEMPLATES_DIR, 'core');
    
    it('should exist', () => {
      expect(fileExists(coreDir)).toBe(true);
    });
    
    it('should have template files', () => {
      const files = fs.readdirSync(coreDir);
      expect(files.length).toBeGreaterThan(0);
    });
  });
  
  describe('template content validation', () => {
    it('should have AGENT_PROMPT template', () => {
      const promptPath = path.join(TEMPLATES_DIR, 'AGENT_PROMPT.template.md');
      expect(fileExists(promptPath)).toBe(true);
      
      const content = readTextFile(promptPath);
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(100);
    });
    
    it('should have _INDEX.md', () => {
      const indexPath = path.join(TEMPLATES_DIR, '_INDEX.md');
      expect(fileExists(indexPath)).toBe(true);
    });
  });
});
