import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');
const DOCTOR_SCRIPT = 'npx tsx axion/scripts/axion-doctor.ts';

interface DoctorResult {
  status: string;
  checks: Array<{
    id: string;
    status: string;
    details?: string;
    reason_code?: string;
  }>;
  active_build?: {
    path: string | null;
    active_build_root: string | null;
    project_name: string | null;
  };
  pollution?: {
    status: string;
    violations: string[];
  };
  run_lock?: {
    status: string;
    stale: boolean;
    age_minutes: number | null;
  };
}

function runDoctor(args: string = ''): DoctorResult {
  try {
    const output = execSync(`${DOCTOR_SCRIPT} --json ${args}`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(output.trim());
  } catch (err: any) {
    if (err.stdout) {
      return JSON.parse(err.stdout.toString().trim());
    }
    throw err;
  }
}

function findCheck(result: DoctorResult, id: string) {
  return result.checks.find(c => c.id === id);
}

describe('Doctor Extensions', () => {
  describe('ACTIVE_BUILD_PRESENT', () => {
    it('should WARN when no ACTIVE_BUILD.json exists', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'active_build/missing');
      const result = runDoctor(`--root ${fixturePath}`);
      const check = findCheck(result, 'ACTIVE_BUILD_PRESENT');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('WARN');
      expect(check!.details).toContain('No ACTIVE_BUILD.json found');
    });

    it('should FAIL when ACTIVE_BUILD.json is invalid JSON', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'active_build/invalid_json');
      const result = runDoctor(`--root ${fixturePath}`);
      const check = findCheck(result, 'ACTIVE_BUILD_PRESENT');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('FAIL');
      expect(check!.reason_code).toBe('ARTIFACT_CORRUPT');
    });
  });

  describe('ACTIVE_BUILD_TARGET_EXISTS', () => {
    it('should SKIP when no active build configured', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'active_build/missing');
      const result = runDoctor(`--root ${fixturePath}`);
      const check = findCheck(result, 'ACTIVE_BUILD_TARGET_EXISTS');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('SKIP');
    });

    it('should FAIL when active build points to missing root', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'active_build/points_to_missing_root');
      const result = runDoctor(`--root ${fixturePath}`);
      const check = findCheck(result, 'ACTIVE_BUILD_TARGET_EXISTS');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('FAIL');
      expect(check!.reason_code).toBe('ACTIVE_BUILD_ROOT_MISSING');
    });
  });

  describe('SYSTEM_ROOT_POLLUTION', () => {
    it('should FAIL when axion/ contains forbidden outputs', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'pollution/axion_contains_domains');
      const result = runDoctor(`--root ${fixturePath}`);
      const check = findCheck(result, 'SYSTEM_ROOT_POLLUTION');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('FAIL');
      expect(check!.reason_code).toBe('SYSTEM_ROOT_POLLUTED');
      expect(result.pollution).toBeDefined();
      expect(result.pollution!.status).toBe('polluted');
      expect(result.pollution!.violations.length).toBeGreaterThan(0);
    });

    it('should PASS when no pollution detected', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'active_build/missing');
      const result = runDoctor(`--root ${fixturePath}`);
      const check = findCheck(result, 'SYSTEM_ROOT_POLLUTION');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('PASS');
    });
  });

  describe('RUN_LOCK_STALE', () => {
    let tempDir: string;
    
    beforeAll(() => {
      tempDir = fs.mkdtempSync('/tmp/doctor-test-');
      fs.mkdirSync(path.join(tempDir, 'axion'), { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, 'manifest.json'),
        JSON.stringify({ project_name: 'TestProject' })
      );
      fs.mkdirSync(path.join(tempDir, 'TestProject/registry'), { recursive: true });
    });
    
    afterAll(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should PASS when no run lock present', () => {
      const result = runDoctor(`--root ${tempDir}`);
      const check = findCheck(result, 'RUN_LOCK_STALE');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('PASS');
      expect(result.run_lock?.status).toBe('none');
    });

    it('should WARN when run lock is stale', () => {
      const lockPath = path.join(tempDir, 'TestProject/registry/run_lock.json');
      fs.writeFileSync(lockPath, JSON.stringify({
        acquired_at: '2020-01-01T00:00:00Z',
        pid: 99999
      }));
      
      const result = runDoctor(`--root ${tempDir}`);
      const check = findCheck(result, 'RUN_LOCK_STALE');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('WARN');
      expect(check!.reason_code).toBe('RUN_LOCK_STALE');
      expect(result.run_lock?.stale).toBe(true);
      
      fs.unlinkSync(lockPath);
    });

    it('should FAIL under --strict when run lock is stale', () => {
      const lockPath = path.join(tempDir, 'TestProject/registry/run_lock.json');
      fs.writeFileSync(lockPath, JSON.stringify({
        acquired_at: '2020-01-01T00:00:00Z',
        pid: 99999
      }));
      
      const result = runDoctor(`--root ${tempDir} --strict`);
      const check = findCheck(result, 'RUN_LOCK_STALE');
      
      expect(check).toBeDefined();
      expect(check!.status).toBe('FAIL');
      
      fs.unlinkSync(lockPath);
    });
  });

  describe('JSON Output Extensions', () => {
    it('should include active_build in output when present', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'active_build/points_to_missing_root');
      const result = runDoctor(`--root ${fixturePath}`);
      
      expect(result.active_build).toBeDefined();
      expect(result.active_build!.active_build_root).toBe('/nonexistent/path/that/does/not/exist');
      expect(result.active_build!.project_name).toBe('GhostProject');
    });

    it('should include pollution status in output', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'pollution/axion_contains_domains');
      const result = runDoctor(`--root ${fixturePath}`);
      
      expect(result.pollution).toBeDefined();
      expect(result.pollution!.status).toBe('polluted');
      expect(Array.isArray(result.pollution!.violations)).toBe(true);
    });

    it('should include run_lock info in output', () => {
      const fixturePath = path.join(FIXTURES_DIR, 'active_build/missing');
      const result = runDoctor(`--root ${fixturePath}`);
      
      expect(result.run_lock).toBeDefined();
      expect(result.run_lock!.status).toBe('none');
      expect(result.run_lock!.stale).toBe(false);
    });
  });
});
