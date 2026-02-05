/**
 * release-check.test.ts
 * 
 * Validates axion-release-check.ts produces correct report schema
 * and handles failure formatting properly.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_DIR = path.join(PROJECT_ROOT, 'axion/registry');
const REPORT_PATH = path.join(REGISTRY_DIR, 'release_gate_report.json');

describe('Release Check Script', () => {
  describe('Report Schema Validation', () => {
    it('should produce valid JSON report with --filter on a fast check', () => {
      const result = spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution', '--json'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        }
      );

      expect(result.status, 'command should complete').toBeDefined();
      expect(result.stdout, 'should have stdout').toBeTruthy();

      const report = JSON.parse(result.stdout.trim());

      expect(report.version).toBe('1.0.0');
      expect(report.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(report.producer).toEqual({
        script: 'axion-release-check',
        revision: 1,
      });
      expect(typeof report.duration_ms).toBe('number');
      expect(typeof report.passed).toBe('boolean');
      expect(report.logs_dir).toMatch(/release_gate_logs/);
      expect(Array.isArray(report.checks)).toBe(true);
      expect(Array.isArray(report.failures)).toBe(true);
      expect(Array.isArray(report.next_commands)).toBe(true);
    });

    it('should include at least one check entry', () => {
      const result = spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution', '--json'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        }
      );

      const report = JSON.parse(result.stdout.trim());
      const runChecks = report.checks.filter((c: any) => !c.skipped);

      expect(runChecks.length).toBeGreaterThanOrEqual(1);

      const check = runChecks[0];
      expect(check.id).toBe('no-pollution');
      expect(check.name).toBe('No Pollution Check');
      expect(typeof check.required).toBe('boolean');
      expect(typeof check.passed).toBe('boolean');
      expect(typeof check.duration_ms).toBe('number');
      expect(check.log_path).toBeTruthy();
    });

    it('should write report to system registry using atomic writer', () => {
      spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        }
      );

      expect(fs.existsSync(REPORT_PATH)).toBe(true);

      const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
      expect(report.version).toBe('1.0.0');
      expect(report.producer.script).toBe('axion-release-check');
    });
  });

  describe('Failure Formatting', () => {
    it('should format failures with reason_code and log_path', () => {
      const result = spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution', '--json'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        }
      );

      const report = JSON.parse(result.stdout.trim());

      if (report.failures.length > 0) {
        const failure = report.failures[0];
        expect(failure.check_id).toBeTruthy();
        expect(failure.reason_code).toMatch(/CHECK_FAILED|TIMEOUT/);
        expect(failure.summary).toBeTruthy();
        expect(failure.log_path).toBeTruthy();
      }
    });

    it('should mark optional checks as skipped when --include-optional not set', () => {
      const result = spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution', '--json'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        }
      );

      const report = JSON.parse(result.stdout.trim());
      const realResults = report.checks.find((c: any) => c.id === 'real-results');

      expect(realResults).toBeDefined();
      expect(realResults.skipped).toBe(true);
      expect(realResults.required).toBe(false);
    });
  });

  describe('CLI Options', () => {
    it('should respect --filter to run only specified checks', () => {
      const result = spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution,docs-check', '--json'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 60000,
        }
      );

      const report = JSON.parse(result.stdout.trim());
      const runChecks = report.checks.filter((c: any) => !c.skipped);

      expect(runChecks.length).toBe(2);
      expect(runChecks.map((c: any) => c.id).sort()).toEqual(['docs-check', 'no-pollution']);
    });

    it('should output human-readable logs to stderr with --json flag', () => {
      const result = spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution', '--json'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        }
      );

      expect(result.stderr).toContain('AXION RELEASE GATE');
      expect(result.stderr).toContain('[no-pollution]');

      const parsed = JSON.parse(result.stdout.trim());
      expect(parsed.version).toBe('1.0.0');
    });
  });

  describe('Log Storage', () => {
    it('should create log files for each check run', () => {
      const result = spawnSync(
        'npx',
        ['tsx', 'axion/scripts/axion-release-check.ts', '--filter', 'no-pollution', '--json'],
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        }
      );

      const report = JSON.parse(result.stdout.trim());
      const noPollution = report.checks.find((c: any) => c.id === 'no-pollution' && !c.skipped);

      expect(noPollution).toBeDefined();
      expect(noPollution.log_path).toBeTruthy();
      expect(fs.existsSync(noPollution.log_path)).toBe(true);

      const logContent = fs.readFileSync(noPollution.log_path, 'utf-8');
      expect(logContent).toContain('=== No Pollution Check ===');
      expect(logContent).toContain('Command:');
      expect(logContent).toContain('Exit code:');
    });
  });
});
