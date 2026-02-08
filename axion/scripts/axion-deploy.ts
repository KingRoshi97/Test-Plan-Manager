#!/usr/bin/env node
/**
 * AXION Deploy
 * 
 * Environment configs + deploy pipeline.
 * Gate: Blocked unless tests PASS (or explicit override)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-deploy.ts
 *   node --import tsx axion/scripts/axion-deploy.ts --app-path ./axion-app
 *   node --import tsx axion/scripts/axion-deploy.ts --override
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
let STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');

interface DeployResult {
  status: 'success' | 'blocked_by' | 'failed';
  stage: string;
  app_path?: string;
  deployment_url?: string;
  missing?: string[];
  hint?: string[];
}

interface StageMarkers {
  [module: string]: {
    [stage: string]: {
      completed_at: string;
      status: 'success' | 'failed';
    };
  };
}

function loadStageMarkers(): StageMarkers {
  if (!fs.existsSync(STAGE_MARKERS_PATH)) return {};
  return JSON.parse(fs.readFileSync(STAGE_MARKERS_PATH, 'utf-8'));
}

function saveStageMarkers(markers: StageMarkers): void {
  fs.writeFileSync(STAGE_MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function areTestsPassing(): boolean {
  const markers = loadStageMarkers();
  const globalMarkers = markers['global'] || {};
  return globalMarkers['test']?.status === 'success';
}

function findAppPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'axion-app'),
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'src'),
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }
  
  return null;
}

function generateDeployConfig(appPath: string): void {
  const replitConfig = {
    run: 'npm run start',
    entrypoint: 'server/index.ts',
    modules: ['nodejs-20'],
    deployment: {
      run: ['sh', '-c', 'npm run start'],
      deploymentTarget: 'cloudrun',
    },
  };
  
  const replitPath = path.join(appPath, '.replit');
  if (!fs.existsSync(replitPath)) {
    fs.writeFileSync(replitPath, JSON.stringify(replitConfig, null, 2));
    console.log('[INFO] Created .replit config');
  }
  
  const nixConfig = `
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.typescript
  ];
}
`;
  
  const nixPath = path.join(appPath, 'replit.nix');
  if (!fs.existsSync(nixPath)) {
    fs.writeFileSync(nixPath, nixConfig.trim());
    console.log('[INFO] Created replit.nix config');
  }
  
  const envExample = `
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Session
SESSION_SECRET=your-secret-here

# Optional
NODE_ENV=production
PORT=5000
`;
  
  const envPath = path.join(appPath, '.env.example');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envExample.trim());
    console.log('[INFO] Created .env.example');
  }
}

function main() {
  const args = process.argv.slice(2);
  const appPathIdx = args.indexOf('--app-path');
  const buildRootIdx = args.indexOf('--build-root');
  const projectNameIdx = args.indexOf('--project-name');
  const overrideFlag = args.includes('--override');
  
  const buildRoot = buildRootIdx !== -1 ? args[buildRootIdx + 1] : null;
  const projectName = projectNameIdx !== -1 ? args[projectNameIdx + 1] : null;
  let appPath = appPathIdx !== -1 ? args[appPathIdx + 1] : null;
  
  // --build-root points directly to the workspace root (e.g. workspaces/<project>)
  if (buildRoot) {
    AXION_ROOT = path.join(buildRoot, 'axion');
    STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
    if (!appPath) {
      appPath = path.join(buildRoot, 'app');
    }
    console.log(`[INFO] Workspace mode: ${buildRoot}`);
  }
  
  console.log('\n[AXION] Deploy\n');
  
  if (!areTestsPassing() && !overrideFlag) {
    const result: DeployResult = {
      status: 'blocked_by',
      stage: 'deploy',
      missing: ['passing tests'],
      hint: [
        'deploy blocked unless tests PASS',
        'Run: node --import tsx axion/scripts/axion-test.ts',
        'Or use --override flag',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  if (!areTestsPassing() && overrideFlag) {
    console.log('[WARN] Deploying with test failures (override enabled)');
  }
  
  if (!appPath) {
    appPath = findAppPath();
  }
  
  if (!appPath || !fs.existsSync(appPath)) {
    const result: DeployResult = {
      status: 'failed',
      stage: 'deploy',
      hint: [
        'Could not find app directory',
        'Use --app-path to specify location',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  console.log(`App path: ${appPath}`);
  console.log('');
  
  generateDeployConfig(appPath);
  
  console.log('');
  console.log('[INFO] Deployment configuration generated.');
  console.log('[INFO] To deploy:');
  console.log('  1. Commit your changes');
  console.log('  2. Use Replit deployment or your preferred CI/CD');
  console.log('  3. Ensure environment variables are configured');
  console.log('');
  
  const markers = loadStageMarkers();
  markers['global'] = markers['global'] || {};
  markers['global']['deploy'] = {
    completed_at: new Date().toISOString(),
    status: 'success',
  };
  saveStageMarkers(markers);
  
  const deploymentUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : undefined;
  
  const result: DeployResult = {
    status: 'success',
    stage: 'deploy',
    app_path: appPath,
    deployment_url: deploymentUrl,
  };
  
  console.log(JSON.stringify(result, null, 2));
}

main();
