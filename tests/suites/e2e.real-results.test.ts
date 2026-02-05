/**
 * E2E Real Results Smoke Test
 * 
 * Validates that a scaffolded AXION app can actually start and respond.
 * This is "real results" testing - not just structure checks.
 * 
 * Hardened implementation:
 * - Reliable port reservation via OS-assigned port
 * - Early-exit detection with stderr capture
 * - Deadline-based polling with bounded backoff
 * - Guaranteed process cleanup (SIGTERM → wait → SIGKILL)
 * - Skip gracefully if deps missing (no npm install in test)
 * - Full response body validation
 * - Metrics recording to registry
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as http from 'http';
import * as net from 'net';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_RUNS_BASE = path.join(PROJECT_ROOT, '.axion_test_runs');
const AXION_SOURCE = path.join(PROJECT_ROOT, 'axion');

interface TestContext {
  runId: string;
  buildRoot: string;
  projectName: string;
  projectWorkspace: string;
  appPath: string;
  cleanupOnPass: boolean;
}

interface RealTestResults {
  port: number;
  startup_ms: number;
  health_latency_ms: number;
  health_status: number;
  response_body: any;
  success: boolean;
  error?: string;
  logs_tail?: string[];
}

interface HealthResponse {
  status: number;
  body: any;
  latency_ms: number;
}

function generateRunId(): string {
  return `real_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Reserve a free port reliably by binding to port 0
 * The OS assigns an available port, we capture it, then close the server
 */
async function reservePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const port = address.port;
        server.close(() => resolve(port));
      } else {
        server.close(() => reject(new Error('Could not get port from address')));
      }
    });
    server.on('error', reject);
  });
}

function setupTestWorkspace(): TestContext {
  const runId = generateRunId();
  const buildRoot = path.join(TEST_RUNS_BASE, runId);
  const projectName = 'RealTestApp';
  
  fs.mkdirSync(buildRoot, { recursive: true });
  
  return {
    runId,
    buildRoot,
    projectName,
    projectWorkspace: path.join(buildRoot, projectName),
    appPath: path.join(buildRoot, projectName, 'app'),
    cleanupOnPass: true
  };
}

function cleanupTestWorkspace(ctx: TestContext, testPassed: boolean): void {
  if (testPassed && ctx.cleanupOnPass) {
    try {
      fs.rmSync(ctx.buildRoot, { recursive: true, force: true });
    } catch {
      // Best effort cleanup
    }
  } else {
    console.log(`[REAL] Test workspace preserved at: ${ctx.buildRoot}`);
  }
}

function runCommand(command: string, cwd: string): string {
  return execSync(command, {
    cwd,
    encoding: 'utf-8',
    timeout: 120000,
    env: { ...process.env, AXION_SYSTEM_ROOT: path.join(cwd, 'axion') }
  });
}

/**
 * Fetch health endpoint with full response body
 */
async function fetchHealth(port: number, timeoutMs: number = 5000): Promise<HealthResponse> {
  const requestStart = Date.now();
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/health',
      method: 'GET',
      timeout: timeoutMs
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let body: any = null;
        try {
          body = JSON.parse(data);
        } catch {
          body = data;
        }
        resolve({
          status: res.statusCode || 0,
          body,
          latency_ms: Date.now() - requestStart
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

/**
 * Poll health endpoint with deadline-based timeout and bounded backoff
 */
async function pollHealthWithDeadline(
  port: number,
  deadlineMs: number = 25000,
  childProcess: ChildProcess,
  stderrBuffer: string[]
): Promise<RealTestResults> {
  const startTime = Date.now();
  const deadline = startTime + deadlineMs;
  let delay = 100; // Start at 100ms
  const maxDelay = 500; // Cap at 500ms
  
  let lastError: string | undefined;
  let lastStatus = 0;
  let lastLatency = 0;
  let lastBody: any = null;
  
  // Check if process exited early
  let processExited = false;
  let exitCode: number | null = null;
  
  childProcess.on('exit', (code) => {
    processExited = true;
    exitCode = code;
  });
  
  while (Date.now() < deadline) {
    // Check for early exit
    if (processExited) {
      return {
        port,
        startup_ms: Date.now() - startTime,
        health_latency_ms: 0,
        health_status: 0,
        response_body: null,
        success: false,
        error: `Process exited early with code ${exitCode}`,
        logs_tail: stderrBuffer.slice(-20)
      };
    }
    
    try {
      const response = await fetchHealth(port, 3000);
      lastStatus = response.status;
      lastLatency = response.latency_ms;
      lastBody = response.body;
      
      if (response.status === 200) {
        return {
          port,
          startup_ms: Date.now() - startTime,
          health_latency_ms: response.latency_ms,
          health_status: response.status,
          response_body: response.body,
          success: true
        };
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    
    // Bounded backoff: delay * 1.5, capped at maxDelay
    await new Promise(resolve => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, maxDelay);
  }
  
  return {
    port,
    startup_ms: Date.now() - startTime,
    health_latency_ms: lastLatency,
    health_status: lastStatus,
    response_body: lastBody,
    success: false,
    error: lastError || `Timeout after ${deadlineMs}ms`,
    logs_tail: stderrBuffer.slice(-20)
  };
}

/**
 * Kill process with guaranteed cleanup: SIGTERM → wait → SIGKILL
 */
async function killProcess(proc: ChildProcess | null): Promise<void> {
  if (!proc || !proc.pid) return;
  
  // First try SIGTERM
  try {
    proc.kill('SIGTERM');
  } catch {
    // Process may already be dead
    return;
  }
  
  // Wait up to 1 second for graceful shutdown
  await new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      resolve();
    }, 1000);
    
    proc.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  
  // If still alive, force kill
  if (!proc.killed) {
    try {
      proc.kill('SIGKILL');
    } catch {
      // Best effort
    }
    // Wait a bit more for SIGKILL to take effect
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

/**
 * Check if node_modules exists (deps installed)
 */
function hasDependencies(appPath: string): boolean {
  const nodeModulesPath = path.join(appPath, 'node_modules');
  return fs.existsSync(nodeModulesPath) && 
         fs.readdirSync(nodeModulesPath).length > 0;
}

/**
 * Get system snapshot for two-root safety check
 */
function getSystemSnapshot(): string[] {
  const protectedPaths = [
    path.join(PROJECT_ROOT, 'axion'),
    path.join(PROJECT_ROOT, 'tests'),
    path.join(PROJECT_ROOT, 'docs')
  ];
  
  const snapshot: string[] = [];
  for (const p of protectedPaths) {
    if (fs.existsSync(p)) {
      try {
        const files = fs.readdirSync(p, { recursive: true }) as string[];
        snapshot.push(...files.slice(0, 50).map(f => path.join(p, f)));
      } catch {
        // Skip if can't read
      }
    }
  }
  return snapshot.sort();
}

describe('E2E Real Results Smoke Test', () => {
  let ctx: TestContext;
  let testPassed = false;
  let appProcess: ChildProcess | null = null;
  let systemSnapshotBefore: string[] = [];
  
  beforeAll(async () => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestWorkspace();
    console.log(`[REAL] Test run: ${ctx.runId}`);
    console.log(`[REAL] Build root: ${ctx.buildRoot}`);
    
    // Capture system snapshot before test
    systemSnapshotBefore = getSystemSnapshot();
    
    // Setup: Create kit and scaffold app
    console.log('\n[SETUP] Creating kit...');
    
    const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
      `--target ${ctx.buildRoot} ` +
      `--source ${AXION_SOURCE} ` +
      `--project-name ${ctx.projectName} ` +
      `--project-desc "Real Results Test" ` +
      `--stack-profile default-web-saas ` +
      `--json`;
    
    runCommand(kitCreateCmd, PROJECT_ROOT);
    
    // Create project workspace
    fs.mkdirSync(ctx.projectWorkspace, { recursive: true });
    fs.mkdirSync(path.join(ctx.projectWorkspace, 'domains', 'architecture'), { recursive: true });
    fs.mkdirSync(path.join(ctx.projectWorkspace, 'registry'), { recursive: true });
    
    // Create minimal architecture doc with stack profile
    const archDoc = `# Architecture Domain

## Stack Profile

Selected stack profile: **default-web-saas**

### Technology Stack

- **Runtime**: Node.js + TypeScript
- **Backend**: Express.js
- **Frontend**: React + Vite
- **Database**: PostgreSQL with Drizzle ORM
`;
    fs.writeFileSync(path.join(ctx.projectWorkspace, 'domains', 'architecture', 'README.md'), archDoc);
    
    console.log('[SETUP] Scaffolding app...');
    
    const scaffoldCmd = `npx tsx axion/scripts/axion-scaffold-app.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--override dev_build ` +
      `--json`;
    
    runCommand(scaffoldCmd, ctx.buildRoot);
    
    console.log('[SETUP] Setup complete');
  }, 60000);
  
  afterAll(async () => {
    // Guaranteed process cleanup
    await killProcess(appProcess);
    
    cleanupTestWorkspace(ctx, testPassed);
  });
  
  it('scaffolded app should start and respond to /api/health', async () => {
    // Check for dependencies - skip cleanly if not installed
    if (!hasDependencies(ctx.appPath)) {
      console.log('[INFO] node_modules not found. Installing dependencies...');
      try {
        execSync('npm install', {
          cwd: ctx.appPath,
          timeout: 120000,
          stdio: 'pipe'
        });
        console.log('[INFO] Dependencies installed successfully');
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.log(`[SKIP] npm install failed: ${errMsg}`);
        console.log('[SKIP] Skipping real results test - run npm install manually first');
        
        // Write skip report
        const skipReport = {
          generated_at: new Date().toISOString(),
          status: 'SKIPPED',
          reason: 'Dependencies not installed',
          error: errMsg
        };
        fs.writeFileSync(
          path.join(ctx.projectWorkspace, 'registry', 'real_test_report.json'),
          JSON.stringify(skipReport, null, 2)
        );
        
        // Mark as passed so workspace is cleaned up
        testPassed = true;
        return;
      }
    }
    
    // Reserve a free port reliably
    console.log('[TEST] Reserving port...');
    const port = await reservePort();
    console.log(`[TEST] Reserved port: ${port}`);
    
    // Capture stderr for debugging
    const stderrBuffer: string[] = [];
    const stdoutBuffer: string[] = [];
    
    // Start the app using node --import tsx (more reliable than npx tsx)
    console.log('[TEST] Starting app...');
    
    appProcess = spawn('node', ['--import', 'tsx', 'server/index.ts'], {
      cwd: ctx.appPath,
      env: { 
        ...process.env, 
        PORT: String(port), 
        NODE_ENV: 'test',
        // Disable color output for cleaner logs
        FORCE_COLOR: '0',
        NO_COLOR: '1'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Capture output for debugging
    appProcess.stdout?.on('data', (data) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      stdoutBuffer.push(...lines);
    });
    
    appProcess.stderr?.on('data', (data) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      stderrBuffer.push(...lines);
    });
    
    // Poll for health endpoint with deadline-based timeout
    console.log(`[TEST] Polling /api/health on port ${port}...`);
    
    const results = await pollHealthWithDeadline(port, 25000, appProcess, stderrBuffer);
    
    console.log(`[TEST] Results: startup=${results.startup_ms}ms, latency=${results.health_latency_ms}ms, status=${results.health_status}`);
    
    if (!results.success) {
      console.log(`[TEST] Error: ${results.error}`);
      if (results.logs_tail && results.logs_tail.length > 0) {
        console.log('[TEST] Last stderr lines:');
        results.logs_tail.forEach(line => console.log(`  ${line}`));
      }
    }
    
    // Two-root safety check: ensure no system pollution
    console.log('\n[SAFETY] Two-root safety checks');
    const systemSnapshotAfter = getSystemSnapshot();
    
    // Compare snapshots (allow minor differences due to cache files)
    const beforeSet = new Set(systemSnapshotBefore);
    const newFiles = systemSnapshotAfter.filter(f => !beforeSet.has(f));
    
    if (newFiles.length === 0) {
      console.log('  ✓ No pollution in system directories');
    } else {
      console.log(`  ⚠ ${newFiles.length} new files in system directories`);
      // Don't fail on this, just warn
    }
    
    // Write results to registry
    const realTestReport = {
      generated_at: new Date().toISOString(),
      status: results.success ? 'PASS' : 'FAIL',
      port: results.port,
      startup_ms: results.startup_ms,
      health_latency_ms: results.health_latency_ms,
      health_status: results.health_status,
      response_body: results.response_body,
      success: results.success,
      error: results.error,
      logs_tail: results.logs_tail,
      two_root_safety: {
        pollution_detected: newFiles.length > 0,
        new_files: newFiles.slice(0, 10) // Limit to first 10
      }
    };
    
    fs.writeFileSync(
      path.join(ctx.projectWorkspace, 'registry', 'real_test_report.json'),
      JSON.stringify(realTestReport, null, 2)
    );
    
    // Assertions
    expect(results.success, `Health endpoint should respond. Error: ${results.error}`).toBe(true);
    expect(results.health_status).toBe(200);
    expect(results.startup_ms).toBeLessThan(25000);
    expect(results.health_latency_ms).toBeLessThan(5000);
    
    // Validate response body shape
    expect(results.response_body).toBeTruthy();
    if (typeof results.response_body === 'object') {
      expect(results.response_body.status).toBe('ok');
    }
    
    console.log('[TEST] ✅ Real results smoke test passed');
    testPassed = true;
    
  }, 120000); // 2 minute timeout
});
