#!/usr/bin/env node
/**
 * AXION App Scaffolder
 * 
 * Creates the actual application skeleton from locked documentation + selected stack profile.
 * Gate: Blocked unless docs are locked (or explicit --override dev_build)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-scaffold-app.ts
 *   node --import tsx axion/scripts/axion-scaffold-app.ts --output ./my-app
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const LOCK_MANIFEST_PATH = path.join(AXION_ROOT, 'registry', 'lock_manifest.json');
const STACK_PROFILES_PATH = path.join(AXION_ROOT, 'config', 'stack_profiles.json');
const ARCHITECTURE_README = path.join(AXION_ROOT, 'domains', 'architecture', 'README.md');
const DATABASE_README = path.join(AXION_ROOT, 'domains', 'database', 'README.md');
const CONTRACTS_README = path.join(AXION_ROOT, 'domains', 'contracts', 'README.md');

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
      lint: 'eslint . --ext .ts,.tsx',
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

registerRoutes(app);

const PORT = process.env.PORT || 5000;
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

  // TODO: Add routes based on locked API contracts documentation
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
  
  return createdFiles;
}

function main() {
  const args = process.argv.slice(2);
  const outputIdx = args.indexOf('--output');
  const overrideFlag = args.includes('--override');
  
  const outputPath = outputIdx !== -1 
    ? args[outputIdx + 1] 
    : path.join(process.cwd(), 'axion-app');
  
  console.log('\n[AXION] App Scaffolder\n');
  
  if (!isDocsLocked() && !overrideFlag) {
    const result: ScaffoldResult = {
      status: 'blocked_by',
      stage: 'scaffold-app',
      missing: ['locked docs'],
      hint: [
        'scaffold-app blocked unless docs are locked',
        'Run: node --import tsx axion/scripts/axion-run.ts --preset system --plan docs:release',
        'Or use --override flag for dev builds',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  if (!isDocsLocked() && overrideFlag) {
    console.log('[WARN] Running in dev_build mode (docs not locked)');
  }
  
  const profile = detectStackFromDocs();
  if (!profile) {
    const result: ScaffoldResult = {
      status: 'failed',
      stage: 'scaffold-app',
      hint: ['Could not detect stack profile from architecture docs'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  console.log(`Stack: ${profile.frontend.framework} + ${profile.backend.framework} + ${profile.database.engine}`);
  console.log(`Output: ${outputPath}`);
  console.log('');
  
  if (fs.existsSync(outputPath)) {
    console.log('[INFO] Output directory exists, will merge/overwrite files');
  }
  
  const filesCreated = createDirectoryStructure(outputPath, profile);
  
  console.log(`\n[SUCCESS] Created ${filesCreated.length} files\n`);
  
  const result: ScaffoldResult = {
    status: 'success',
    stage: 'scaffold-app',
    output_path: outputPath,
    files_created: filesCreated,
  };
  
  console.log(JSON.stringify(result, null, 2));
}

main();
