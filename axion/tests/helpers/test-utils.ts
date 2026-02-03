/**
 * AXION Test Utilities
 * 
 * Common helpers for test setup, teardown, and assertions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures', 'workspace');
const TEMP_WORKSPACES_PATH = path.join(__dirname, '..', 'temp');

export interface TestContext {
  workspacePath: string;
  testName: string;
  cleanup: () => void;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface BlockedByResponse {
  status: 'blocked_by';
  stage: string;
  module: string;
  missing: string[];
  hint: string[];
}

export interface SuccessResponse {
  status: 'success';
  stage: string;
  module: string;
  files_created: string[];
  marker_written: boolean;
}

export function createTestWorkspace(testName: string): TestContext {
  const uniqueId = crypto.randomBytes(4).toString('hex');
  const workspacePath = path.join(TEMP_WORKSPACES_PATH, `${testName}_${uniqueId}`);
  
  if (!fs.existsSync(TEMP_WORKSPACES_PATH)) {
    fs.mkdirSync(TEMP_WORKSPACES_PATH, { recursive: true });
  }
  
  copyDirectory(FIXTURES_PATH, workspacePath);
  
  return {
    workspacePath,
    testName,
    cleanup: () => {
      if (fs.existsSync(workspacePath)) {
        fs.rmSync(workspacePath, { recursive: true, force: true });
      }
    },
  };
}

function copyDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function runCommand(command: string): CommandResult {
  const options: ExecSyncOptions = {
    cwd: process.cwd(),
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  };
  
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  
  try {
    stdout = execSync(command, options) as string;
  } catch (error: any) {
    exitCode = error.status || 1;
    stdout = error.stdout || '';
    stderr = error.stderr || '';
  }
  
  return { exitCode, stdout, stderr };
}

export function runAxionCommand(
  workspace: string,
  command: string,
  args: string[] = []
): CommandResult {
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', `${command}.ts`);
  const fullCommand = `node --import tsx ${scriptPath} ${args.join(' ')}`;
  const options: ExecSyncOptions = {
    cwd: process.cwd(),
    env: { ...process.env, AXION_WORKSPACE: workspace },
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  };
  
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  
  try {
    stdout = execSync(fullCommand, options) as string;
  } catch (error: any) {
    exitCode = error.status || 1;
    stdout = error.stdout || '';
    stderr = error.stderr || '';
  }
  
  return { exitCode, stdout, stderr };
}

export function parseBlockedByResponse(stdout: string): BlockedByResponse | null {
  const jsonMatch = stdout.match(/\{[\s\S]*"status"\s*:\s*"blocked_by"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}

export function parseSuccessResponse(stdout: string): SuccessResponse | null {
  const jsonMatch = stdout.match(/\{[\s\S]*"status"\s*:\s*"success"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}

export function fileExists(workspace: string, relativePath: string): boolean {
  return fs.existsSync(path.join(workspace, relativePath));
}

export function readFile(workspace: string, relativePath: string): string {
  return fs.readFileSync(path.join(workspace, relativePath), 'utf-8');
}

export function writeFile(workspace: string, relativePath: string, content: string): void {
  const fullPath = path.join(workspace, relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
}

export function getStageMarker(workspace: string, module: string, stage: string): any {
  const markersPath = path.join(workspace, 'registry', 'stage_markers.json');
  if (!fs.existsSync(markersPath)) {
    return null;
  }
  const markers = JSON.parse(fs.readFileSync(markersPath, 'utf-8'));
  return markers.markers?.[module]?.[stage] || null;
}

export function getVerifyStatus(workspace: string, module: string): any {
  const statusPath = path.join(workspace, 'registry', 'verify_status.json');
  if (!fs.existsSync(statusPath)) {
    return null;
  }
  const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
  return status.modules?.[module] || null;
}

export function countPlaceholders(content: string): number {
  const matches = content.match(/\[TBD\]/g);
  return matches ? matches.length : 0;
}

export function countUnknowns(content: string): number {
  const matches = content.match(/UNKNOWN/g);
  return matches ? matches.length : 0;
}

export function hashFile(workspace: string, relativePath: string): string {
  const content = readFile(workspace, relativePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function listModuleDocs(workspace: string, module: string): string[] {
  const domainsPath = path.join(workspace, 'domains', module);
  if (!fs.existsSync(domainsPath)) {
    return [];
  }
  
  const files: string[] = [];
  const entries = fs.readdirSync(domainsPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entry.name);
    }
  }
  
  return files;
}

export function assertExitCode(result: CommandResult, expected: number, message?: string): void {
  if (result.exitCode !== expected) {
    throw new Error(
      `${message || 'Exit code mismatch'}: expected ${expected}, got ${result.exitCode}\n` +
      `stdout: ${result.stdout}\nstderr: ${result.stderr}`
    );
  }
}

export function assertContains(text: string, substring: string, message?: string): void {
  if (!text.includes(substring)) {
    throw new Error(
      `${message || 'Assertion failed'}: text does not contain "${substring}"\n` +
      `Actual: ${text.substring(0, 500)}...`
    );
  }
}

export function assertFileExists(workspace: string, relativePath: string, message?: string): void {
  if (!fileExists(workspace, relativePath)) {
    throw new Error(
      `${message || 'File not found'}: ${relativePath}`
    );
  }
}

export function assertFileNotExists(workspace: string, relativePath: string, message?: string): void {
  if (fileExists(workspace, relativePath)) {
    throw new Error(
      `${message || 'File should not exist'}: ${relativePath}`
    );
  }
}

export function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: any) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr}, got ${actualStr}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
      }
    },
    toContain(expected: any) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected string to contain ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      } else {
        throw new Error(`toContain requires array or string, got ${typeof actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (!(actual < expected)) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toHaveLength(expected: number) {
      if (actual?.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${actual?.length}`);
      }
    },
  };
}
