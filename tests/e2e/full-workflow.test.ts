import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { createTestContext, runAxionCommand, parseJsonOutput, fileExists, readJsonFile, countFiles, TestContext } from '../helpers/test-utils';

describe('AXION End-to-End Workflow', () => {
  let ctx: TestContext;
  
  beforeEach(() => {
    ctx = createTestContext();
  });
  
  afterEach(() => {
    ctx.cleanup();
  });
  
  describe('complete kit creation workflow', () => {
    it('should create a fully functional kit', () => {
      const kitDir = path.join(ctx.tempDir, 'e2e-kit');
      
      const result = runAxionCommand('axion-kit-create.ts', [
        '--target', kitDir,
        '--project-name', 'E2ETest',
        '--project-desc', 'End to end test project',
        '--stack-profile', 'default-web-saas'
      ]);
      
      expect(result.success).toBe(true);
      
      const json = parseJsonOutput(result.stdout);
      expect(json?.status).toBe('success');
      expect(json?.files_copied).toBeGreaterThan(50);
      
      expect(fileExists(path.join(kitDir, 'manifest.json'))).toBe(true);
      expect(fileExists(path.join(kitDir, 'README_RUN.md'))).toBe(true);
      
      const axionScripts = path.join(kitDir, 'axion', 'scripts');
      const scriptCount = countFiles(axionScripts);
      expect(scriptCount).toBeGreaterThan(10);
      
      const manifest = readJsonFile<Record<string, unknown>>(path.join(kitDir, 'manifest.json'));
      expect(manifest?.project_name).toBe('E2ETest');
      expect(manifest?.stack_profile).toBe('default-web-saas');
      expect(manifest?.status).toBe('created');
      expect(manifest?.expected_commands).toBeTruthy();
      expect(manifest?.snapshot_revision).toBeTruthy();
    });
  });
  
  describe('kit isolation', () => {
    it('should create independent kits', () => {
      const kit1Dir = path.join(ctx.tempDir, 'kit-1');
      const kit2Dir = path.join(ctx.tempDir, 'kit-2');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kit1Dir,
        '--project-name', 'Project1'
      ]);
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kit2Dir,
        '--project-name', 'Project2'
      ]);
      
      const manifest1 = readJsonFile<Record<string, unknown>>(path.join(kit1Dir, 'manifest.json'));
      const manifest2 = readJsonFile<Record<string, unknown>>(path.join(kit2Dir, 'manifest.json'));
      
      expect(manifest1?.project_name).toBe('Project1');
      expect(manifest2?.project_name).toBe('Project2');
      
      const rpbs1 = fs.readFileSync(
        path.join(kit1Dir, 'axion', 'source_docs', 'product', 'RPBS_Product.md'),
        'utf-8'
      );
      const rpbs2 = fs.readFileSync(
        path.join(kit2Dir, 'axion', 'source_docs', 'product', 'RPBS_Product.md'),
        'utf-8'
      );
      
      expect(rpbs1).toContain('Project1');
      expect(rpbs2).toContain('Project2');
    });
  });
  
  describe('snapshot integrity', () => {
    it('should create identical snapshots for same source', () => {
      const kit1Dir = path.join(ctx.tempDir, 'snapshot-1');
      const kit2Dir = path.join(ctx.tempDir, 'snapshot-2');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kit1Dir
      ]);
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kit2Dir
      ]);
      
      const files1 = countFiles(path.join(kit1Dir, 'axion'));
      const files2 = countFiles(path.join(kit2Dir, 'axion'));
      
      expect(files1).toBe(files2);
    });
  });
  
  describe('README_RUN accuracy', () => {
    it('should generate README with correct project name', () => {
      const kitDir = path.join(ctx.tempDir, 'readme-test-kit');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kitDir,
        '--project-name', 'ReadmeTest'
      ]);
      
      const readme = fs.readFileSync(path.join(kitDir, 'README_RUN.md'), 'utf-8');
      
      expect(readme).toContain('ReadmeTest');
      expect(readme).toContain('AXION Build Runbook');
      expect(readme).toContain('npx tsx');
    });
  });
});
