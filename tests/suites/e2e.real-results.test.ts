/**
 * E2E Real Results Smoke Test
 * 
 * Validates that a scaffolded AXION app can actually start and respond.
 * This is "real results" testing - not just structure checks.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as http from 'http';

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
  startup_ms: number;
  health_response_ms: number;
  health_status: number;
  success: boolean;
}

function generateRunId(): string {
  return `real_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
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

async function pollHealth(port: number, timeoutMs: number = 30000): Promise<RealTestResults> {
  const startTime = Date.now();
  const startupStart = startTime;
  let startupMs = 0;
  let healthResponseMs = 0;
  let healthStatus = 0;
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const requestStart = Date.now();
      const response = await new Promise<{ status: number }>((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port,
          path: '/api/health',
          method: 'GET',
          timeout: 5000
        }, (res) => {
          resolve({ status: res.statusCode || 0 });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('timeout')));
        req.end();
      });
      
      healthResponseMs = Date.now() - requestStart;
      healthStatus = response.status;
      startupMs = Date.now() - startupStart;
      
      if (healthStatus === 200) {
        return {
          startup_ms: startupMs,
          health_response_ms: healthResponseMs,
          health_status: healthStatus,
          success: true
        };
      }
    } catch {
      // Server not ready yet, retry
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return {
    startup_ms: Date.now() - startupStart,
    health_response_ms: healthResponseMs,
    health_status: healthStatus,
    success: false
  };
}

describe('E2E Real Results Smoke Test', () => {
  let ctx: TestContext;
  let testPassed = false;
  let appProcess: ChildProcess | null = null;
  
  beforeAll(async () => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestWorkspace();
    console.log(`[REAL] Test run: ${ctx.runId}`);
    console.log(`[REAL] Build root: ${ctx.buildRoot}`);
    
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
    // Kill the app process if still running
    if (appProcess && !appProcess.killed) {
      appProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!appProcess.killed) {
        appProcess.kill('SIGKILL');
      }
    }
    
    cleanupTestWorkspace(ctx, testPassed);
  });
  
  it('scaffolded app should start and respond to /api/health', async () => {
    // Install dependencies
    console.log('\n[TEST] Installing dependencies...');
    
    try {
      execSync('npm install', {
        cwd: ctx.appPath,
        timeout: 120000,
        stdio: 'pipe'
      });
    } catch (error) {
      console.log('[WARN] npm install had issues, continuing...');
    }
    
    // Start the app
    console.log('[TEST] Starting app...');
    
    const port = 3000 + Math.floor(Math.random() * 1000);
    
    appProcess = spawn('npx', ['tsx', 'server/index.ts'], {
      cwd: ctx.appPath,
      env: { ...process.env, PORT: String(port), NODE_ENV: 'test' },
      stdio: 'pipe'
    });
    
    // Poll for health endpoint
    console.log(`[TEST] Polling /api/health on port ${port}...`);
    
    const results = await pollHealth(port, 30000);
    
    console.log(`[TEST] Results: startup=${results.startup_ms}ms, response=${results.health_response_ms}ms, status=${results.health_status}`);
    
    // Write results to registry
    const realTestReport = {
      generated_at: new Date().toISOString(),
      ...results
    };
    
    fs.writeFileSync(
      path.join(ctx.projectWorkspace, 'registry', 'real_test_report.json'),
      JSON.stringify(realTestReport, null, 2)
    );
    
    // Assertions
    expect(results.success, 'Health endpoint should respond').toBe(true);
    expect(results.health_status).toBe(200);
    expect(results.startup_ms).toBeLessThan(30000);
    expect(results.health_response_ms).toBeLessThan(5000);
    
    console.log('[TEST] ✅ Real results smoke test passed');
    testPassed = true;
    
  }, 120000); // 2 minute timeout
});
