import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { createTestContext, runAxionCommand, parseJsonOutput, fileExists, readJsonFile, TestContext } from '../helpers/test-utils';

describe('AXION Pipeline Integration', () => {
  let ctx: TestContext;
  
  beforeEach(() => {
    ctx = createTestContext();
  });
  
  afterEach(() => {
    ctx.cleanup();
  });
  
  describe('kit creation to status check', () => {
    it('should create kit and report status', () => {
      const kitDir = path.join(ctx.tempDir, 'pipeline-test-kit');
      
      const createResult = runAxionCommand('axion-kit-create.ts', [
        '--target', kitDir,
        '--project-name', 'PipelineTest'
      ]);
      
      expect(createResult.success).toBe(true);
      
      const statusResult = runAxionCommand('axion-status.ts', [
        '--build-root', kitDir
      ], { cwd: kitDir });
      
      expect(statusResult.stdout).toBeTruthy();
    });
  });
  
  describe('manifest lifecycle', () => {
    it('should update manifest status through stages', () => {
      const kitDir = path.join(ctx.tempDir, 'manifest-lifecycle-kit');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kitDir,
        '--project-name', 'ManifestLifecycle'
      ]);
      
      const manifest = readJsonFile<Record<string, unknown>>(path.join(kitDir, 'manifest.json'));
      expect(manifest?.status).toBe('created');
    });
  });
  
  describe('directory structure validation', () => {
    it('should create complete AXION snapshot', () => {
      const kitDir = path.join(ctx.tempDir, 'structure-test-kit');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kitDir,
        '--project-name', 'StructureTest'
      ]);
      
      const expectedDirs = [
        'axion/scripts',
        'axion/templates',
        'axion/config',
        'axion/docs'
      ];
      
      for (const dir of expectedDirs) {
        expect(fileExists(path.join(kitDir, dir))).toBe(true);
      }
    });
    
    it('should copy config files correctly', () => {
      const kitDir = path.join(ctx.tempDir, 'config-copy-kit');
      
      runAxionCommand('axion-kit-create.ts', [
        '--target', kitDir
      ]);
      
      const configFiles = [
        'axion/config/domains.json',
        'axion/config/presets.json',
        'axion/config/stack_profiles.json'
      ];
      
      for (const file of configFiles) {
        expect(fileExists(path.join(kitDir, file))).toBe(true);
        
        const content = readJsonFile(path.join(kitDir, file));
        expect(content).toBeTruthy();
      }
    });
  });
});
