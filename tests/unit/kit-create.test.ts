import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { createTestContext, runAxionCommand, parseJsonOutput, fileExists, readJsonFile, countFiles, TestContext } from '../helpers/test-utils';

describe('axion-kit-create', () => {
  let ctx: TestContext;
  
  beforeEach(() => {
    ctx = createTestContext();
  });
  
  afterEach(() => {
    ctx.cleanup();
  });
  
  describe('argument validation', () => {
    it('should fail when --target is not provided', () => {
      const result = runAxionCommand('axion-kit-create.ts', []);
      
      expect(result.success).toBe(false);
      
      const json = parseJsonOutput(result.stdout);
      expect(json).toBeTruthy();
      expect(json?.status).toBe('failed');
      expect(json?.reason_codes).toContain('TARGET_MISSING');
    });
    
    it('should fail when source axion folder does not exist', () => {
      const result = runAxionCommand('axion-kit-create.ts', [
        '--target', path.join(ctx.tempDir, 'kit'),
        '--source', '/nonexistent/path'
      ]);
      
      expect(result.success).toBe(false);
      
      const json = parseJsonOutput(result.stdout);
      expect(json?.status).toBe('failed');
      expect(json?.reason_codes).toContain('SOURCE_NOT_FOUND');
    });
    
    it('should fail when --refuse-if-exists and target exists', () => {
      const targetDir = path.join(ctx.tempDir, 'existing-kit');
      fs.mkdirSync(targetDir, { recursive: true });
      
      const result = runAxionCommand('axion-kit-create.ts', [
        '--target', targetDir,
        '--refuse-if-exists'
      ]);
      
      expect(result.success).toBe(false);
      
      const json = parseJsonOutput(result.stdout);
      expect(json?.status).toBe('failed');
      expect(json?.reason_codes).toContain('TARGET_EXISTS');
    });
  });
  
  describe('kit creation', () => {
    it('should create a kit with required structure', () => {
      const targetDir = path.join(ctx.tempDir, 'new-kit');
      
      const result = runAxionCommand('axion-kit-create.ts', [
        '--target', targetDir,
        '--project-name', 'TestProject'
      ]);
      
      expect(result.success).toBe(true);
      
      const json = parseJsonOutput(result.stdout);
      expect(json?.status).toBe('success');
      expect(json?.stage).toBe('kit-create');
      
      expect(fileExists(path.join(targetDir, 'manifest.json'))).toBe(true);
      expect(fileExists(path.join(targetDir, 'README_RUN.md'))).toBe(true);
      expect(fileExists(path.join(targetDir, 'axion'))).toBe(true);
      expect(fileExists(path.join(targetDir, 'axion', 'scripts'))).toBe(true);
      expect(fileExists(path.join(targetDir, 'axion', 'templates'))).toBe(true);
      expect(fileExists(path.join(targetDir, 'axion', 'config'))).toBe(true);
    });
    
    it('should create manifest with correct metadata', () => {
      const targetDir = path.join(ctx.tempDir, 'manifest-test-kit');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', targetDir,
        '--project-name', 'ManifestTest',
        '--stack-profile', 'custom-profile'
      ]);
      
      const manifest = readJsonFile<Record<string, unknown>>(path.join(targetDir, 'manifest.json'));
      
      expect(manifest).toBeTruthy();
      expect(manifest?.version).toBe('1.0.0');
      expect(manifest?.project_name).toBe('ManifestTest');
      expect(manifest?.stack_profile).toBe('custom-profile');
      expect(manifest?.status).toBe('created');
      expect(manifest?.created_at).toBeTruthy();
      expect(manifest?.expected_commands).toBeTruthy();
    });
    
    it('should seed RPBS when project name is provided', () => {
      const targetDir = path.join(ctx.tempDir, 'rpbs-test-kit');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', targetDir,
        '--project-name', 'RPBSTest',
        '--project-desc', 'A test project description'
      ]);
      
      const rpbsPath = path.join(targetDir, 'axion', 'docs', 'product', 'RPBS_Product.md');
      expect(fileExists(rpbsPath)).toBe(true);
      
      const rpbsContent = fs.readFileSync(rpbsPath, 'utf-8');
      expect(rpbsContent).toContain('RPBSTest');
      expect(rpbsContent).toContain('A test project description');
    });
    
    it('should copy all required snapshot directories', () => {
      const targetDir = path.join(ctx.tempDir, 'snapshot-test-kit');
      
      const result = runAxionCommand('axion-kit-create.ts', [
        '--target', targetDir
      ]);
      
      const json = parseJsonOutput(result.stdout);
      expect(json?.files_copied).toBeGreaterThan(0);
      
      const snapshotDirs = ['config', 'scripts', 'templates', 'docs'];
      for (const dir of snapshotDirs) {
        const dirPath = path.join(targetDir, 'axion', dir);
        expect(fileExists(dirPath)).toBe(true);
      }
    });
  });
  
  describe('dry run mode', () => {
    it('should not create files in dry run mode', () => {
      const targetDir = path.join(ctx.tempDir, 'dry-run-kit');
      
      const result = runAxionCommand('axion-kit-create.ts', [
        '--target', targetDir,
        '--dry-run'
      ]);
      
      expect(result.success).toBe(true);
      
      const json = parseJsonOutput(result.stdout);
      expect(json?.dry_run).toBe(true);
      
      expect(fileExists(targetDir)).toBe(false);
    });
  });
  
  describe('idempotency', () => {
    it('should allow creating kit over existing directory without --refuse-if-exists', () => {
      const targetDir = path.join(ctx.tempDir, 'idempotent-kit');
      fs.mkdirSync(targetDir, { recursive: true });
      
      const result = runAxionCommand('axion-kit-create.ts', [
        '--target', targetDir,
        '--project-name', 'IdempotentTest'
      ]);
      
      expect(result.success).toBe(true);
      
      const json = parseJsonOutput(result.stdout);
      expect(json?.status).toBe('success');
    });
  });
});
