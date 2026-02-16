#!/usr/bin/env node
/**
 * AXION App Scaffolder
 * 
 * Creates the actual application skeleton from locked documentation + selected stack profile.
 * Gate: Blocked unless docs are locked (or explicit --override dev_build)
 * 
 * Two-Root Model Support:
 * - System Root: <BUILD_ROOT>/axion/ (configs, templates)
 * - Workspace Root: <BUILD_ROOT>/<PROJECT_NAME>/ (outputs, app)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-scaffold-app.ts --build-root <path> --project-name <name>
 *   node --import tsx axion/scripts/axion-scaffold-app.ts --output ./my-app  (legacy mode)
 * 
 * Flags:
 *   --build-root <path>       Build root containing axion/ system folder (two-root mode)
 *   --project-name <name>     Project name (two-root mode)
 *   --output <path>           Output path for scaffolded app (legacy mode)
 *   --override                Skip lock gate for dev builds
 *   --dry-run                 Show what would be done without changes
 *   --json                    Output only JSON
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startTime = Date.now();
const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');

interface ScaffoldReceipt {
  ok: boolean;
  script: string;
  stage: string;
  dryRun: boolean;
  output_path: string | null;
  files_created: string[];
  stack_profile: string | null;
  errors: string[];
  warnings: string[];
  elapsedMs: number;
}

const receipt: ScaffoldReceipt = {
  ok: true,
  script: 'axion-scaffold-app',
  stage: 'scaffold-app',
  dryRun,
  output_path: null,
  files_created: [],
  stack_profile: null,
  errors: [],
  warnings: [],
  elapsedMs: 0,
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  } else {
    if (receipt.ok) {
      console.log(`\n[RECEIPT] ok=${receipt.ok} files=${receipt.files_created.length} elapsed=${receipt.elapsedMs}ms`);
    } else {
      console.log(`\n[RECEIPT] ok=${receipt.ok} errors=${receipt.errors.length} elapsed=${receipt.elapsedMs}ms`);
    }
  }
}

// Default paths (legacy mode) - will be overridden by two-root mode flags
let AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
let WORKSPACE_ROOT = AXION_ROOT;  // In legacy mode, same as AXION_ROOT
let LOCK_MANIFEST_PATH = path.join(AXION_ROOT, 'registry', 'lock_manifest.json');
let STACK_PROFILES_PATH = path.join(AXION_ROOT, 'config', 'stack_profiles.json');
let ARCHITECTURE_README = path.join(AXION_ROOT, 'domains', 'architecture', 'README.md');
let DATABASE_README = path.join(AXION_ROOT, 'domains', 'database', 'README.md');
let CONTRACTS_README = path.join(AXION_ROOT, 'domains', 'contracts', 'README.md');

// Setup paths for two-root mode
function setupTwoRootPaths(buildRoot: string, projectName: string): void {
  AXION_ROOT = path.join(buildRoot, 'axion');
  WORKSPACE_ROOT = path.join(buildRoot, projectName);
  LOCK_MANIFEST_PATH = path.join(WORKSPACE_ROOT, 'registry', 'lock_manifest.json');
  STACK_PROFILES_PATH = path.join(AXION_ROOT, 'config', 'stack_profiles.json');
  ARCHITECTURE_README = path.join(WORKSPACE_ROOT, 'domains', 'architecture', 'README.md');
  DATABASE_README = path.join(WORKSPACE_ROOT, 'domains', 'database', 'README.md');
  CONTRACTS_README = path.join(WORKSPACE_ROOT, 'domains', 'contracts', 'README.md');
}

interface StackProfileConventions {
  app_dir: string;
  server_entry: string;
  health_path: string;
  anchors: Record<string, string>;
}

interface StackProfile {
  id: string;
  label: string;
  frontend: {
    framework: string;
    language: string;
    styling: string;
    state_management: string;
  };
  backend: {
    runtime: string;
    language: string;
    framework: string;
    api_style: string;
  };
  database: {
    engine: string;
    orm: string;
  };
  deployment: {
    platform: string;
    ci_cd: string;
  };
}

interface ResolvedStackProfile {
  version: string;
  stack_id: string;
  language: string;
  runtime: string;
  package_manager: string;
  app: {
    type: string;
    framework: string;
    frontend: { framework: string };
    styling: string;
  };
  conventions: StackProfileConventions;
}

interface ScaffoldResult {
  status: 'success' | 'blocked_by' | 'failed';
  stage: string;
  output_path?: string;
  files_created?: string[];
  missing?: string[];
  hint?: string[];
}

function isDocsLocked(): boolean {
  return fs.existsSync(LOCK_MANIFEST_PATH);
}

function loadStackProfiles(): Record<string, StackProfile> {
  if (!fs.existsSync(STACK_PROFILES_PATH)) {
    return {};
  }
  const data = JSON.parse(fs.readFileSync(STACK_PROFILES_PATH, 'utf-8'));
  return data.profiles || {};
}

function buildResolvedProfile(profile: StackProfile): ResolvedStackProfile {
  return {
    version: '1.0.0',
    stack_id: profile.id === 'detected' ? 'default-web-saas' : profile.id,
    language: profile.backend.language.toLowerCase().includes('typescript') ? 'ts' : profile.backend.language.toLowerCase(),
    runtime: profile.backend.runtime.toLowerCase().includes('node') ? 'node' : profile.backend.runtime.toLowerCase(),
    package_manager: 'npm',
    app: {
      type: 'web',
      framework: profile.backend.framework.toLowerCase().replace('.js', ''),
      frontend: { framework: profile.frontend.framework.toLowerCase() },
      styling: profile.frontend.styling.toLowerCase().includes('tailwind') ? 'tailwind' : profile.frontend.styling.toLowerCase(),
    },
    conventions: {
      app_dir: 'app',
      server_entry: 'server/index.ts',
      health_path: '/api/health',
      anchors: {
        ROUTES: '<!-- AXION:ANCHOR:ROUTES -->',
        MIDDLEWARE: '<!-- AXION:ANCHOR:MIDDLEWARE -->',
        CLIENT_ROUTES: '<!-- AXION:ANCHOR:CLIENT_ROUTES -->',
        SERVER_CONFIG: '<!-- AXION:ANCHOR:SERVER_CONFIG -->',
      },
    },
  };
}

function writeStackProfile(workspaceRoot: string, resolved: ResolvedStackProfile, dryRun: boolean): void {
  const profilePath = path.join(workspaceRoot, 'registry', 'stack_profile.json');
  if (!dryRun) {
    const dir = path.dirname(profilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(profilePath, JSON.stringify(resolved, null, 2), 'utf-8');
  }
}

function detectStackFromDocs(): StackProfile | null {
  if (!fs.existsSync(ARCHITECTURE_README)) return null;
  
  const content = fs.readFileSync(ARCHITECTURE_README, 'utf-8');
  
  const profile: StackProfile = {
    id: 'detected',
    label: 'Detected from docs',
    frontend: {
      framework: 'React',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
      state_management: 'TanStack Query',
    },
    backend: {
      runtime: 'Node.js',
      language: 'TypeScript',
      framework: 'Express.js',
      api_style: 'REST',
    },
    database: {
      engine: 'PostgreSQL',
      orm: 'Drizzle ORM',
    },
    deployment: {
      platform: 'Replit',
      ci_cd: 'Replit',
    },
  };
  
  if (content.includes('React')) profile.frontend.framework = 'React';
  if (content.includes('Vue')) profile.frontend.framework = 'Vue';
  if (content.includes('Svelte')) profile.frontend.framework = 'Svelte';
  
  if (content.includes('Express')) profile.backend.framework = 'Express.js';
  if (content.includes('Fastify')) profile.backend.framework = 'Fastify';
  if (content.includes('Hono')) profile.backend.framework = 'Hono';
  
  if (content.includes('PostgreSQL')) profile.database.engine = 'PostgreSQL';
  if (content.includes('MySQL')) profile.database.engine = 'MySQL';
  if (content.includes('SQLite')) profile.database.engine = 'SQLite';
  
  if (content.includes('Drizzle')) profile.database.orm = 'Drizzle ORM';
  if (content.includes('Prisma')) profile.database.orm = 'Prisma';
  
  return profile;
}

function createDirectoryStructure(outputPath: string, profile: StackProfile): string[] {
  const dirs = [
    'client/src/components/ui',
    'client/src/pages',
    'client/src/hooks',
    'client/src/lib',
    'client/public',
    'server',
    'shared/schema',
  ];
  
  const createdFiles: string[] = [];
  
  for (const dir of dirs) {
    const fullPath = path.join(outputPath, dir);
    fs.mkdirSync(fullPath, { recursive: true });
  }
  
  const packageJson = {
    name: 'axion-app',
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'NODE_ENV=development tsx server/index.ts',
      build: 'vite build',
      start: 'NODE_ENV=production node dist/server/index.js',
      'db:push': 'drizzle-kit push',
      'db:studio': 'drizzle-kit studio',
      test: 'vitest run',
      lint: 'eslint .',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      express: '^5.0.0',
      'drizzle-orm': '^0.34.0',
      postgres: '^3.4.0',
      zod: '^3.23.0',
      react: '^18.3.0',
      'react-dom': '^18.3.0',
      '@tanstack/react-query': '^5.0.0',
      wouter: '^3.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      tsx: '^4.0.0',
      vite: '^5.0.0',
      '@vitejs/plugin-react': '^4.0.0',
      'drizzle-kit': '^0.26.0',
      vitest: '^2.0.0',
      eslint: '^9.0.0',
      '@eslint/js': '^9.0.0',
      '@types/node': '^22.0.0',
      '@types/express': '^5.0.0',
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
    },
  };
  
  fs.writeFileSync(
    path.join(outputPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  createdFiles.push('package.json');
  
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      outDir: './dist',
      rootDir: '.',
      baseUrl: '.',
      paths: {
        '@/*': ['client/src/*'],
        '@shared/*': ['shared/*'],
      },
    },
    include: ['client/src/**/*', 'server/**/*', 'shared/**/*'],
  };
  
  fs.writeFileSync(
    path.join(outputPath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );
  createdFiles.push('tsconfig.json');
  
  const drizzleConfig = `
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
`;
  
  fs.writeFileSync(path.join(outputPath, 'drizzle.config.ts'), drizzleConfig.trim());
  createdFiles.push('drizzle.config.ts');
  
  const schemaIndex = `
// Barrel export for all schema modules
export * from './tables';
`;
  
  fs.writeFileSync(path.join(outputPath, 'shared/schema/index.ts'), schemaIndex.trim());
  createdFiles.push('shared/schema/index.ts');
  
  const schemaTables = `
import { pgTable, serial, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define your tables here based on locked documentation
// Example:
// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   email: varchar('email', { length: 255 }).notNull().unique(),
//   createdAt: timestamp('created_at').defaultNow(),
// });
`;
  
  fs.writeFileSync(path.join(outputPath, 'shared/schema/tables.ts'), schemaTables.trim());
  createdFiles.push('shared/schema/tables.ts');
  
  const serverIndex = `
import express from 'express';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());
// <!-- AXION:ANCHOR:MIDDLEWARE -->

// <!-- AXION:ANCHOR:SERVER_CONFIG -->
registerRoutes(app);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
  
  fs.writeFileSync(path.join(outputPath, 'server/index.ts'), serverIndex.trim());
  createdFiles.push('server/index.ts');
  
  const serverRoutes = `
import type { Express } from 'express';

export function registerRoutes(app: Express) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // <!-- AXION:ANCHOR:ROUTES -->
}
`;
  
  fs.writeFileSync(path.join(outputPath, 'server/routes.ts'), serverRoutes.trim());
  createdFiles.push('server/routes.ts');
  
  const clientMain = `
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
`;
  
  fs.writeFileSync(path.join(outputPath, 'client/src/main.tsx'), clientMain.trim());
  createdFiles.push('client/src/main.tsx');
  
  const clientApp = `
import { Switch, Route } from 'wouter';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* <!-- AXION:ANCHOR:CLIENT_ROUTES --> */}
      <Route component={NotFound} />
    </Switch>
  );
}
`;
  
  fs.writeFileSync(path.join(outputPath, 'client/src/App.tsx'), clientApp.trim());
  createdFiles.push('client/src/App.tsx');
  
  const homePage = `
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-gray-600">Your app is scaffolded and ready for implementation.</p>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(path.join(outputPath, 'client/src/pages/Home.tsx'), homePage.trim());
  createdFiles.push('client/src/pages/Home.tsx');
  
  const notFoundPage = `
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600">Page not found</p>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(path.join(outputPath, 'client/src/pages/NotFound.tsx'), notFoundPage.trim());
  createdFiles.push('client/src/pages/NotFound.tsx');
  
  const indexCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  
  fs.writeFileSync(path.join(outputPath, 'client/src/index.css'), indexCss.trim());
  createdFiles.push('client/src/index.css');
  
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Axion App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`;
  
  fs.writeFileSync(path.join(outputPath, 'client/index.html'), indexHtml.trim());
  createdFiles.push('client/index.html');
  
  const readme = `
# Axion App

This application was scaffolded by AXION from locked documentation.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Stack

- Frontend: ${profile.frontend.framework} + ${profile.frontend.language}
- Backend: ${profile.backend.framework} + ${profile.backend.language}
- Database: ${profile.database.engine} + ${profile.database.orm}
- Deployment: ${profile.deployment.platform}

## Next Steps

1. Review the locked documentation in \`axion/domains/\`
2. Implement features based on the contracts module
3. Run \`npm run db:push\` to sync database schema
4. Run tests with \`npm test\`
`;
  
  fs.writeFileSync(path.join(outputPath, 'README.md'), readme.trim());
  createdFiles.push('README.md');

  const vitestConfig = `
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
});
`;

  fs.writeFileSync(path.join(outputPath, 'vitest.config.ts'), vitestConfig.trim());
  createdFiles.push('vitest.config.ts');

  const eslintConfig = `
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
  },
  {
    ignores: ['dist/', 'node_modules/', 'drizzle/', '**/*.ts', '**/*.tsx'],
  },
];
`;

  fs.writeFileSync(path.join(outputPath, 'eslint.config.js'), eslintConfig.trim());
  createdFiles.push('eslint.config.js');
  
  return createdFiles;
}

function writeScaffoldReport(
  workspaceRoot: string, 
  filesCreated: string[],
  profile: StackProfile,
  dryRun: boolean
): void {
  const reportPath = path.join(workspaceRoot, 'registry', 'app_scaffold_report.json');
  const report = {
    generated_at: new Date().toISOString(),
    stack_profile: profile.id,
    stack_label: profile.label,
    files_created: filesCreated,
    status: 'success'
  };
  
  if (!dryRun) {
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  }
}

function main() {
  const args = process.argv.slice(2);
  
  const outputIdx = args.indexOf('--output');
  const buildRootIdx = args.indexOf('--build-root');
  const projectNameIdx = args.indexOf('--project-name');
  const overrideFlag = args.includes('--override');
  
  const isTwoRootMode = buildRootIdx !== -1 && projectNameIdx !== -1;
  
  let outputPath: string;
  let projectName: string | undefined;
  
  if (isTwoRootMode) {
    const buildRoot = path.resolve(args[buildRootIdx + 1]);
    projectName = args[projectNameIdx + 1];
    
    setupTwoRootPaths(buildRoot, projectName);
    
    outputPath = path.join(WORKSPACE_ROOT, 'app');
    
    if (!jsonMode) {
      console.log('\n[AXION] App Scaffolder (Two-Root Mode)\n');
      console.log(`[INFO] Build root: ${buildRoot}`);
      console.log(`[INFO] Project: ${projectName}`);
      console.log(`[INFO] Workspace: ${WORKSPACE_ROOT}`);
    }
  } else {
    outputPath = outputIdx !== -1 
      ? args[outputIdx + 1] 
      : path.join(process.cwd(), 'axion-app');
    
    if (!jsonMode) {
      console.log('\n[AXION] App Scaffolder\n');
    }
  }
  
  receipt.output_path = outputPath;
  
  if (isTwoRootMode && !fs.existsSync(WORKSPACE_ROOT)) {
    fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
    if (!jsonMode) {
      console.log(`[INFO] Created workspace directory: ${WORKSPACE_ROOT}`);
    }
  }
  
  if (!isDocsLocked() && !overrideFlag) {
    receipt.ok = false;
    receipt.errors.push('scaffold-app blocked unless docs are locked');
    emitOutput();
    process.exit(1);
  }
  
  if (!isDocsLocked() && overrideFlag) {
    receipt.warnings.push('Running in dev_build mode (docs not locked)');
    if (!jsonMode) console.log('[WARN] Running in dev_build mode (docs not locked)');
  }
  
  const profile = detectStackFromDocs();
  if (!profile) {
    receipt.ok = false;
    receipt.errors.push('Could not detect stack profile from architecture docs');
    emitOutput();
    process.exit(1);
  }
  
  receipt.stack_profile = profile.id;
  
  if (!jsonMode) {
    console.log(`Stack: ${profile.frontend.framework} + ${profile.backend.framework} + ${profile.database.engine}`);
    console.log(`Output: ${outputPath}`);
    console.log('');
  }
  
  if (fs.existsSync(outputPath)) {
    if (!jsonMode) console.log('[INFO] Output directory exists, will merge/overwrite files');
  }
  
  let filesCreated: string[] = [];
  if (!dryRun) {
    filesCreated = createDirectoryStructure(outputPath, profile);
  } else {
    if (!jsonMode) console.log('[DRY-RUN] Would create directory structure');
    filesCreated = [
      'package.json', 'tsconfig.json', 'drizzle.config.ts', 'vite.config.ts',
      'tailwind.config.ts', 'postcss.config.js', 'theme.json', '.replit',
      'server/index.ts', 'server/routes.ts', 'server/storage.ts', 'server/vite.ts',
      'shared/schema.ts', 'client/index.html', 'client/src/main.tsx',
      'client/src/App.tsx', 'client/src/index.css', 'README.md'
    ];
  }
  
  receipt.files_created = filesCreated;
  
  if (isTwoRootMode) {
    writeScaffoldReport(WORKSPACE_ROOT, filesCreated, profile, dryRun);
    if (!jsonMode) console.log('[INFO] Created app_scaffold_report.json');

    const resolved = buildResolvedProfile(profile);
    writeStackProfile(WORKSPACE_ROOT, resolved, dryRun);
    if (!jsonMode) console.log('[INFO] Created registry/stack_profile.json');
  }
  
  if (!jsonMode) console.log(`\n[SUCCESS] Created ${filesCreated.length} files\n`);
  
  emitOutput();
}

try {
  main();
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  receipt.ok = false;
  receipt.errors.push(msg);
  emitOutput();
  process.exit(1);
}
