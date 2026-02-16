#!/usr/bin/env node
/**
 * AXION Build Plan
 * 
 * Reads locked docs and generates an ordered task graph (build_plan.json)
 * for coding agents to implement. This is the "Plan" step before "Execute".
 * 
 * Gate: Refuses unless scaffold exists (app_scaffold_report.json)
 * 
 * Reads:
 * - <PROJECT_NAME>/domains/** (locked module docs)
 * - <PROJECT_NAME>/registry/app_scaffold_report.json (gate check)
 * - <BUILD_ROOT>/axion/config/stack_profiles.json
 * 
 * Writes:
 * - <PROJECT_NAME>/registry/build_plan.json (ordered task list)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-build-plan.ts --build-root <path> --project-name <name>
 * 
 * Flags:
 *   --build-root <path>       Build root containing axion/ system folder
 *   --project-name <name>     Project name (workspace folder name)
 *   --force                   Skip scaffold gate
 *   --dry-run                 Show what would be done without changes
 *   --json                    Output only JSON
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

interface BuildPlanReceipt {
  ok: boolean;
  stage: string;
  errors: string[];
  warnings: string[];
  elapsedMs: number;
  dryRun: boolean;
  summary: {
    status: 'success' | 'failed' | 'blocked_by';
    plan_path?: string;
    task_count?: number;
    phases?: string[];
    reason_codes?: string[];
    hint?: string[];
  };
}

const receipt: BuildPlanReceipt = {
  ok: false,
  stage: 'build-plan',
  errors: [],
  warnings: [],
  elapsedMs: 0,
  dryRun,
  summary: {
    status: 'failed'
  }
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  } else {
    if (receipt.ok) {
      console.log(`\n[PASS] Build plan generated successfully (${receipt.elapsedMs}ms)\n`);
      if (receipt.summary.plan_path) {
        console.log(`  Plan: ${receipt.summary.plan_path}`);
      }
      if (receipt.summary.task_count !== undefined) {
        console.log(`  Tasks: ${receipt.summary.task_count}`);
      }
      if (receipt.summary.phases) {
        console.log(`  Phases: ${receipt.summary.phases.join(', ')}`);
      }
      if (receipt.dryRun) {
        console.log('  (dry-run — no files written)');
      }
    } else {
      console.log(`\n[FAIL] Build plan failed (${receipt.elapsedMs}ms)`);
      for (const e of receipt.errors) {
        console.log(`  ERROR: ${e}`);
      }
      if (receipt.summary.hint) {
        for (const h of receipt.summary.hint) {
          console.log(`  HINT: ${h}`);
        }
      }
    }
    for (const w of receipt.warnings) {
      console.log(`  WARN: ${w}`);
    }
  }
}

interface BuildTask {
  id: string;
  phase: string;
  title: string;
  description: string;
  source_module: string;
  dependencies: string[];
  files_to_create: string[];
  acceptance_criteria: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

interface BuildPlan {
  generated_at: string;
  project_name: string;
  stack_id: string;
  version: string;
  phases: string[];
  tasks: BuildTask[];
  total_tasks: number;
}

interface BuildPlanOptions {
  buildRoot: string;
  projectName: string;
  force: boolean;
  dryRun: boolean;
  jsonOutput: boolean;
}

function parseArgs(args: string[]): BuildPlanOptions {
  const options: BuildPlanOptions = {
    buildRoot: process.cwd(),
    projectName: '',
    force: false,
    dryRun: false,
    jsonOutput: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--build-root':
        options.buildRoot = args[++i] || options.buildRoot;
        break;
      case '--project-name':
        options.projectName = args[++i] || '';
        break;
      case '--force':
        options.force = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--json':
        options.jsonOutput = true;
        break;
    }
  }

  return options;
}

function checkScaffoldExists(workspaceRoot: string): boolean {
  const reportPath = path.join(workspaceRoot, 'registry', 'app_scaffold_report.json');
  return fs.existsSync(reportPath);
}

function readStackProfile(workspaceRoot: string): { stack_id: string; anchors: Record<string, string> } {
  const profilePath = path.join(workspaceRoot, 'registry', 'stack_profile.json');
  if (fs.existsSync(profilePath)) {
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    return {
      stack_id: profile.stack_id || 'default-web-saas',
      anchors: profile.conventions?.anchors || {},
    };
  }
  return { stack_id: 'default-web-saas', anchors: {} };
}

function readModuleDocs(workspaceRoot: string): Map<string, string> {
  const domainsDir = path.join(workspaceRoot, 'domains');
  const modules = new Map<string, string>();
  
  if (!fs.existsSync(domainsDir)) {
    return modules;
  }
  
  const entries = fs.readdirSync(domainsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const readmePath = path.join(domainsDir, entry.name, 'README.md');
      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf-8');
        modules.set(entry.name, content);
      }
    }
  }
  
  return modules;
}

function generateBuildPlan(projectName: string, moduleDocs: Map<string, string>, stackInfo: { stack_id: string; anchors: Record<string, string> }): BuildPlan {
  const tasks: BuildTask[] = [];
  let taskId = 1;
  
  // Phase 1: Core Infrastructure
  const phase1Tasks: BuildTask[] = [
    {
      id: `task-${taskId++}`,
      phase: 'infrastructure',
      title: 'Setup Database Schema',
      description: 'Implement database models and schema based on data module docs',
      source_module: 'database',
      dependencies: [],
      files_to_create: ['shared/schema.ts', 'drizzle.config.ts'],
      acceptance_criteria: [
        'All entity types defined with proper relationships',
        'Indexes created for frequently queried fields',
        'Migration runs successfully'
      ],
      status: 'pending'
    },
    {
      id: `task-${taskId++}`,
      phase: 'infrastructure',
      title: 'Setup Authentication',
      description: 'Implement auth flow based on auth module docs',
      source_module: 'auth',
      dependencies: ['task-1'],
      files_to_create: ['server/auth.ts', 'client/src/hooks/use-auth.ts'],
      acceptance_criteria: [
        'Login/logout flow works',
        'Session management implemented',
        'Protected routes enforced'
      ],
      status: 'pending'
    }
  ];
  
  // Phase 2: Backend Implementation
  const phase2Tasks: BuildTask[] = [
    {
      id: `task-${taskId++}`,
      phase: 'backend',
      title: 'Implement API Routes',
      description: 'Create REST API endpoints based on contracts module',
      source_module: 'contracts',
      dependencies: ['task-1', 'task-2'],
      files_to_create: ['server/routes.ts', 'server/storage.ts'],
      acceptance_criteria: [
        'All CRUD operations implemented',
        'Input validation using Zod',
        'Error handling with proper status codes'
      ],
      status: 'pending'
    },
    {
      id: `task-${taskId++}`,
      phase: 'backend',
      title: 'Implement Business Logic',
      description: 'Create service layer for business rules',
      source_module: 'backend',
      dependencies: ['task-3'],
      files_to_create: ['server/services/*.ts'],
      acceptance_criteria: [
        'Business rules from RPBS implemented',
        'Proper error handling',
        'Logging for key operations'
      ],
      status: 'pending'
    }
  ];
  
  // Phase 3: Frontend Implementation
  const phase3Tasks: BuildTask[] = [
    {
      id: `task-${taskId++}`,
      phase: 'frontend',
      title: 'Implement UI Components',
      description: 'Create reusable UI components based on frontend module',
      source_module: 'frontend',
      dependencies: [],
      files_to_create: ['client/src/components/*.tsx'],
      acceptance_criteria: [
        'Components follow design system',
        'Responsive design',
        'Accessibility compliance'
      ],
      status: 'pending'
    },
    {
      id: `task-${taskId++}`,
      phase: 'frontend',
      title: 'Implement Pages',
      description: 'Create page components with routing',
      source_module: 'frontend',
      dependencies: ['task-5'],
      files_to_create: ['client/src/pages/*.tsx'],
      acceptance_criteria: [
        'All routes defined',
        'Navigation works',
        'Loading states implemented'
      ],
      status: 'pending'
    },
    {
      id: `task-${taskId++}`,
      phase: 'frontend',
      title: 'Integrate API',
      description: 'Connect frontend to backend API using React Query',
      source_module: 'fullstack',
      dependencies: ['task-3', 'task-6'],
      files_to_create: ['client/src/lib/api.ts', 'client/src/hooks/use-*.ts'],
      acceptance_criteria: [
        'All API calls use React Query',
        'Proper caching strategy',
        'Error handling with toasts'
      ],
      status: 'pending'
    }
  ];
  
  // Phase 4: Testing & Polish
  const phase4Tasks: BuildTask[] = [
    {
      id: `task-${taskId++}`,
      phase: 'testing',
      title: 'Write Unit Tests',
      description: 'Create unit tests for critical functionality',
      source_module: 'testing',
      dependencies: ['task-4', 'task-7'],
      files_to_create: ['tests/*.test.ts'],
      acceptance_criteria: [
        'Core business logic tested',
        'API routes tested',
        'Coverage > 70%'
      ],
      status: 'pending'
    },
    {
      id: `task-${taskId++}`,
      phase: 'testing',
      title: 'E2E Testing',
      description: 'Create end-to-end tests for user flows',
      source_module: 'testing',
      dependencies: ['task-8'],
      files_to_create: ['tests/e2e/*.test.ts'],
      acceptance_criteria: [
        'Critical user flows tested',
        'Happy path covered',
        'Error scenarios tested'
      ],
      status: 'pending'
    }
  ];
  
  tasks.push(...phase1Tasks, ...phase2Tasks, ...phase3Tasks, ...phase4Tasks);
  
  const plan: BuildPlan = {
    generated_at: new Date().toISOString(),
    project_name: projectName,
    stack_id: stackInfo.stack_id,
    version: '1.0.0',
    phases: ['infrastructure', 'backend', 'frontend', 'testing'],
    tasks,
    total_tasks: tasks.length
  };
  
  return plan;
}

function writeBuildPlan(workspaceRoot: string, plan: BuildPlan, isDryRun: boolean): string {
  const planPath = path.join(workspaceRoot, 'registry', 'build_plan.json');
  
  if (!isDryRun) {
    const dir = path.dirname(planPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2), 'utf-8');
  }
  
  return planPath;
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!jsonMode) console.log('\n[AXION] Build Plan\n');

  if (!options.projectName) {
    receipt.ok = false;
    receipt.errors.push('PROJECT_NAME_MISSING');
    receipt.summary = {
      status: 'failed',
      reason_codes: ['PROJECT_NAME_MISSING'],
      hint: ['Provide --project-name <name> to specify the project workspace']
    };
    emitOutput();
    process.exit(1);
  }

  const buildRoot = path.resolve(options.buildRoot);
  const projectName = options.projectName;
  const workspaceRoot = path.join(buildRoot, projectName);

  if (!jsonMode) console.log(`[INFO] Build root: ${buildRoot}`);
  if (!jsonMode) console.log(`[INFO] Project name: ${projectName}`);
  if (!jsonMode) console.log(`[INFO] Workspace: ${workspaceRoot}`);

  if (!fs.existsSync(workspaceRoot)) {
    receipt.ok = false;
    receipt.errors.push('WORKSPACE_NOT_FOUND');
    receipt.summary = {
      status: 'failed',
      reason_codes: ['WORKSPACE_NOT_FOUND'],
      hint: [
        `Workspace not found at ${workspaceRoot}`,
        'Run prepare-root first'
      ]
    };
    emitOutput();
    process.exit(1);
  }

  if (!options.force && !checkScaffoldExists(workspaceRoot)) {
    receipt.ok = false;
    receipt.errors.push('SCAFFOLD_NOT_FOUND');
    receipt.summary = {
      status: 'blocked_by',
      reason_codes: ['SCAFFOLD_NOT_FOUND'],
      hint: [
        'App must be scaffolded before generating build plan',
        'Run scaffold-app first, or use --force to skip this gate'
      ]
    };
    emitOutput();
    process.exit(1);
  }

  const moduleDocs = readModuleDocs(workspaceRoot);
  if (!jsonMode) console.log(`[INFO] Found ${moduleDocs.size} module docs`);

  const stackInfo = readStackProfile(workspaceRoot);
  if (!jsonMode) console.log(`[INFO] Stack profile: ${stackInfo.stack_id}`);

  const plan = generateBuildPlan(projectName, moduleDocs, stackInfo);
  if (!jsonMode) console.log(`[INFO] Generated ${plan.total_tasks} tasks across ${plan.phases.length} phases`);

  const planPath = writeBuildPlan(workspaceRoot, plan, options.dryRun);
  if (!jsonMode) console.log(`[INFO] Build plan written to: ${planPath}`);

  receipt.ok = true;
  receipt.summary = {
    status: 'success',
    plan_path: planPath,
    task_count: plan.total_tasks,
    phases: plan.phases
  };

  emitOutput();
}

try {
  main();
} catch (err: unknown) {
  receipt.ok = false;
  receipt.errors.push(err instanceof Error ? err.message : String(err));
  receipt.summary.status = 'failed';
  emitOutput();
  process.exit(1);
}
