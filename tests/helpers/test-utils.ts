import * as fs from 'fs';
import * as path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import { randomUUID } from 'crypto';

export interface TestContext {
  tempDir: string;
  axionRoot: string;
  cleanup: () => void;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  success: boolean;
}

export function createTestContext(): TestContext {
  const tempDir = path.join(process.cwd(), 'tests', 'temp', `test-${randomUUID().slice(0, 8)}`);
  const axionRoot = path.join(process.cwd(), 'axion');
  
  fs.mkdirSync(tempDir, { recursive: true });
  
  return {
    tempDir,
    axionRoot,
    cleanup: () => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  };
}

export function runAxionCommand(
  script: string,
  args: string[],
  options: { cwd?: string; timeout?: number } = {}
): CommandResult {
  const cwd = options.cwd || process.cwd();
  const timeout = options.timeout || 30000;
  const scriptPath = path.join(process.cwd(), 'axion', 'scripts', script);
  
  const quotedArgs = args.map(arg => arg.includes(' ') ? `"${arg}"` : arg);
  const cmd = `npx tsx ${scriptPath} ${quotedArgs.join(' ')}`;
  
  try {
    const stdout = execSync(cmd, {
      cwd,
      timeout,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    } as ExecSyncOptions);
    
    return {
      exitCode: 0,
      stdout: stdout || '',
      stderr: '',
      success: true
    };
  } catch (error: unknown) {
    const execError = error as { status?: number; stdout?: Buffer | string; stderr?: Buffer | string };
    return {
      exitCode: execError.status || 1,
      stdout: String(execError.stdout || ''),
      stderr: String(execError.stderr || ''),
      success: false
    };
  }
}

export function parseJsonOutput(output: string): Record<string, unknown> | null {
  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    return null;
  }
  return null;
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readJsonFile<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function readTextFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export function countFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      count++;
    }
  }
  
  return count;
}

export function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

export function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
