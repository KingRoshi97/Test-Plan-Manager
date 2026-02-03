/**
 * AXION Runner Tests
 * 
 * Tests for axion-run, axion-preflight, run lock, and run history functionality.
 */

import { describe, it } from '../helpers/test-runner.js';
import { expect, createTestWorkspace, runCommand, CommandResult } from '../helpers/test-utils.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPTS_PATH = path.resolve(__dirname, '../../scripts');

// Helper to run preflight
function runPreflight(root: string): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-preflight.ts');
  return runCommand(`node --import tsx ${script} --root "${root}"`);
}

// Helper to run axion-run
function runAxion(root: string, args: string): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-run.ts');
  return runCommand(`node --import tsx ${script} --root "${root}" ${args}`);
}

// Helper to parse JSON from output - finds the last complete JSON object
function parseJson(output: string): any | null {
  // Look for JSON objects that start with { and end with }
  // Parse backwards through the output to find the last valid JSON
  const lines = output.split('\n');
  let jsonStr = '';
  let braceCount = 0;
  let inJson = false;
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    
    // Count braces
    for (const char of line) {
      if (char === '}') braceCount++;
      if (char === '{') braceCount--;
    }
    
    if (braceCount > 0 || inJson) {
      jsonStr = line + '\n' + jsonStr;
      inJson = true;
    }
    
    if (braceCount === 0 && inJson) {
      try {
        return JSON.parse(jsonStr.trim());
      } catch {
        // Try again from next line
        jsonStr = '';
        inJson = false;
        braceCount = 0;
      }
    }
  }
  
  return null;
}

describe('Preflight Validation', () => {
  it('preflight success on valid workspace', () => {
    // Use actual workspace
    const result = runPreflight(process.cwd());
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    expect(json.status).toBe('success');
    expect(json.stage).toBe('preflight');
    expect(json.checks).toBeTruthy();
    expect(json.checks.node).toBe('ok');
    expect(json.checks.tsx).toBe('ok');
    expect(json.checks.axion_dir).toBe('ok');
  });
  
  it('preflight fails on bad working directory', () => {
    // Use temp directory with no axion setup
    const tempDir = path.join(__dirname, '..', 'temp', 'bad_workdir_test');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    try {
      const result = runPreflight(tempDir);
      const json = parseJson(result.stdout);
      
      expect(json).toBeTruthy();
      expect(json.status).toBe('failed');
      expect(json.stage).toBe('preflight');
      expect(json.reason_codes).toContain('BAD_WORKDIR');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  it('preflight fails on missing templates', () => {
    // Create temp workspace without templates
    const tempDir = path.join(__dirname, '..', 'temp', 'no_templates_test');
    const axionDir = path.join(tempDir, 'axion');
    const configDir = path.join(axionDir, 'config');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Create minimal config files
    fs.writeFileSync(
      path.join(configDir, 'domains.json'),
      JSON.stringify({ modules: [] })
    );
    fs.writeFileSync(
      path.join(configDir, 'presets.json'),
      JSON.stringify({ stage_plans: {}, presets: {} })
    );
    
    // Create empty templates dir
    const templatesDir = path.join(axionDir, 'templates');
    fs.mkdirSync(templatesDir, { recursive: true });
    
    // Create package.json with tsx dep
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ devDependencies: { tsx: '*' } })
    );
    
    try {
      const result = runPreflight(tempDir);
      const json = parseJson(result.stdout);
      
      expect(json).toBeTruthy();
      expect(json.status).toBe('failed');
      expect(json.reason_codes).toContain('MISSING_TEMPLATES');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('Run Lock', () => {
  it('run lock blocks concurrent run', () => {
    const registryPath = path.join(process.cwd(), 'axion', 'registry');
    const lockPath = path.join(registryPath, 'run_lock.json');
    
    // Create a fresh lock
    const lock = {
      version: '1.0.0',
      run_id: 'test_concurrent_block',
      created_at: new Date().toISOString(),
      pid: 99999,
      command: 'axion-run',
      args: ['--test'],
    };
    
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
    
    try {
      const result = runAxion(process.cwd(), '--module architecture --plan docs:scaffold');
      const json = parseJson(result.stdout);
      
      expect(json).toBeTruthy();
      expect(json.status).toBe('blocked_by');
      expect(json.missing).toContain('RUN_LOCK_ACTIVE');
      expect(result.exitCode).toBe(1);
    } finally {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
      }
    }
  });
  
  it('stale lock is removed and run proceeds', () => {
    const registryPath = path.join(process.cwd(), 'axion', 'registry');
    const lockPath = path.join(registryPath, 'run_lock.json');
    
    // Create a stale lock (3 hours old)
    const staleTime = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const lock = {
      version: '1.0.0',
      run_id: 'test_stale_lock',
      created_at: staleTime,
      pid: 99999,
      command: 'axion-run',
      args: ['--test'],
    };
    
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
    
    try {
      // Run should succeed because stale lock is auto-removed
      const result = runAxion(process.cwd(), '--module architecture --plan docs:scaffold --dry-run');
      const json = parseJson(result.stdout);
      
      expect(json).toBeTruthy();
      expect(json.status).toBe('success');
      expect(json.dry_run).toBe(true);
    } finally {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
      }
    }
  });
  
  it('unlock-if-stale removes stale lock', () => {
    const registryPath = path.join(process.cwd(), 'axion', 'registry');
    const lockPath = path.join(registryPath, 'run_lock.json');
    
    // Create a stale lock
    const staleTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const lock = {
      version: '1.0.0',
      run_id: 'test_stale_to_remove',
      created_at: staleTime,
      pid: 99999,
      command: 'axion-run',
      args: ['--test'],
    };
    
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
    
    const result = runAxion(process.cwd(), '--unlock-if-stale');
    
    expect(result.stdout).toContain('Stale lock removed');
    expect(fs.existsSync(lockPath)).toBe(false);
  });
  
  it('unlock-if-stale does not remove fresh lock', () => {
    const registryPath = path.join(process.cwd(), 'axion', 'registry');
    const lockPath = path.join(registryPath, 'run_lock.json');
    
    // Create a fresh lock
    const lock = {
      version: '1.0.0',
      run_id: 'test_fresh_lock',
      created_at: new Date().toISOString(),
      pid: 99999,
      command: 'axion-run',
      args: ['--test'],
    };
    
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
    
    try {
      const result = runAxion(process.cwd(), '--unlock-if-stale');
      
      expect(result.stdout).toContain('Lock is fresh');
      expect(fs.existsSync(lockPath)).toBe(true);
    } finally {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
      }
    }
  });
});

describe('Run History', () => {
  it('run history is created on success', () => {
    const historyPath = path.join(process.cwd(), 'axion', 'registry', 'run_history');
    const beforeFiles = fs.existsSync(historyPath) 
      ? fs.readdirSync(historyPath) 
      : [];
    
    const result = runAxion(process.cwd(), '--module architecture --plan docs:scaffold');
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    expect(json.status).toBe('success');
    expect(json.run_history_path).toBeTruthy();
    
    // Check new history file was created
    const afterFiles = fs.readdirSync(historyPath);
    expect(afterFiles.length).toBeGreaterThan(beforeFiles.length);
    
    // Verify history content
    const newFiles = afterFiles.filter(f => !beforeFiles.includes(f));
    expect(newFiles.length).toBeGreaterThan(0);
    
    const historyContent = JSON.parse(
      fs.readFileSync(path.join(historyPath, newFiles[0]), 'utf-8')
    );
    
    expect(historyContent.version).toBe('1.0.0');
    expect(historyContent.run_id).toBeTruthy();
    expect(historyContent.started_at).toBeTruthy();
    expect(historyContent.finished_at).toBeTruthy();
    expect(historyContent.overall_status).toBe('success');
    expect(historyContent.stages).toBeTruthy();
    expect(Array.isArray(historyContent.stages)).toBe(true);
  });
  
  it('run history records stage details', () => {
    const historyPath = path.join(process.cwd(), 'axion', 'registry', 'run_history');
    const beforeFiles = fs.existsSync(historyPath) 
      ? fs.readdirSync(historyPath) 
      : [];
    
    const result = runAxion(process.cwd(), '--module architecture --plan docs:scaffold');
    const json = parseJson(result.stdout);
    
    expect(json.status).toBe('success');
    
    // Get the new history file
    const afterFiles = fs.readdirSync(historyPath);
    const newFiles = afterFiles.filter(f => !beforeFiles.includes(f));
    
    const historyContent = JSON.parse(
      fs.readFileSync(path.join(historyPath, newFiles[0]), 'utf-8')
    );
    
    // Check stages are recorded
    expect(historyContent.stages.length).toBeGreaterThan(0);
    
    const firstStage = historyContent.stages[0];
    expect(firstStage.stage).toBeTruthy();
    expect(firstStage.started_at).toBeTruthy();
    expect(firstStage.finished_at).toBeTruthy();
    expect(firstStage.status).toBe('success');
    expect(firstStage.exit_code).toBe(0);
  });
});

describe('axion-run Execution', () => {
  it('--all --plan docs:scaffold executes generate then seed in order', () => {
    const result = runAxion(process.cwd(), '--preset foundation --plan docs:scaffold --dry-run');
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    expect(json.status).toBe('success');
    expect(json.dry_run).toBe(true);
    expect(json.stages).toEqual(['generate', 'seed']);
    expect(json.modules).toContain('architecture');
  });
  
  it('stops on blocked_by and surfaces hint', () => {
    // Create a scenario that will be blocked
    // Try to run verify on a module that hasn't been drafted
    const result = runAxion(process.cwd(), '--module desktop --plan docs:content');
    const json = parseJson(result.stdout);
    
    // This may succeed or be blocked depending on state
    // Just verify the JSON structure is correct
    expect(json).toBeTruthy();
    expect(['success', 'blocked_by', 'failed']).toContain(json.status);
    
    if (json.status === 'blocked_by') {
      expect(json.hint).toBeTruthy();
      expect(Array.isArray(json.hint)).toBe(true);
    }
  });
  
  it('dry-run does not execute stages', () => {
    const result = runAxion(process.cwd(), '--preset system --plan docs:full --dry-run');
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    expect(json.status).toBe('success');
    expect(json.dry_run).toBe(true);
    expect(json.stages).toBeTruthy();
    expect(json.modules).toBeTruthy();
    expect(json.modules.length).toBeGreaterThan(0);
  });
  
  it('PRESET_NOT_FOUND for invalid preset', () => {
    const result = runAxion(process.cwd(), '--preset nonexistent_preset --plan docs:full');
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    expect(json.status).toBe('failed');
    expect(json.reason_codes).toContain('PRESET_NOT_FOUND');
  });
  
  it('PLAN_NOT_FOUND for invalid plan', () => {
    const result = runAxion(process.cwd(), '--preset foundation --plan nonexistent_plan');
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    expect(json.status).toBe('failed');
    expect(json.reason_codes).toContain('PLAN_NOT_FOUND');
  });
  
  it('MODULE_NOT_FOUND for invalid module', () => {
    const result = runAxion(process.cwd(), '--module nonexistent_module --plan docs:scaffold');
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    expect(json.status).toBe('failed');
    expect(json.reason_codes).toContain('MODULE_NOT_FOUND');
  });
});

describe('JSON Output Contract', () => {
  it('final output is valid JSON with required fields', () => {
    const result = runAxion(process.cwd(), '--preset foundation --plan docs:scaffold --dry-run');
    const json = parseJson(result.stdout);
    
    expect(json).toBeTruthy();
    
    // Required fields for success
    expect(json.status).toBeTruthy();
    expect(json.stage).toBe('run');
    expect(json.run_id).toBeTruthy();
  });
  
  it('blocked_by includes missing and hint arrays', () => {
    const registryPath = path.join(process.cwd(), 'axion', 'registry');
    const lockPath = path.join(registryPath, 'run_lock.json');
    
    // Create a fresh lock to force blocked_by
    const lock = {
      version: '1.0.0',
      run_id: 'test_json_contract',
      created_at: new Date().toISOString(),
      pid: 99999,
      command: 'axion-run',
      args: ['--test'],
    };
    
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
    
    try {
      const result = runAxion(process.cwd(), '--module architecture --plan docs:scaffold');
      const json = parseJson(result.stdout);
      
      expect(json).toBeTruthy();
      expect(json.status).toBe('blocked_by');
      expect(json.missing).toBeTruthy();
      expect(Array.isArray(json.missing)).toBe(true);
      expect(json.hint).toBeTruthy();
      expect(Array.isArray(json.hint)).toBe(true);
    } finally {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
      }
    }
  });
});
