import * as path from "path";
import type { KitContext, BuildSlice, BuildFileTarget } from "./types.js";
import { extractBrandColors } from "./prompt-builders.js";

function resolveEntityFromRef(ctx: KitContext, sourceRef?: string): { name: string; fields: string[]; relationships: string[] } {
  const ref = sourceRef ?? "";
  const feat = ctx.features.find(f => ref.includes(f.feature_id)) ?? ctx.features[0];
  const entityName = feat ? feat.name.replace(/[^a-zA-Z0-9]/g, "") : path.basename(ref).replace(/[^a-zA-Z0-9]/g, "") || "Entity";
  return { name: entityName, fields: ["id", "createdAt", "updatedAt"], relationships: [] };
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function genDbSchemaEntity(ctx: KitContext, file: BuildFileTarget): string {
  const entity = resolveEntityFromRef(ctx, file.sourceRef);
  const tableName = toSnakeCase(entity.name) + "s";
  const varName = toCamelCase(entity.name) + "s";
  return `import { pgTable, serial, varchar, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const ${varName} = pgTable("${tableName}", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ${entity.name} = typeof ${varName}.$inferSelect;
export type New${entity.name} = typeof ${varName}.$inferInsert;
`;
}

function genRequestDto(_ctx: KitContext, file: BuildFileTarget): string {
  const entity = resolveEntityFromRef(_ctx, file.sourceRef);
  return `export interface Create${entity.name}Request {
  name: string;
  description?: string;
  status?: string;
}

export interface Update${entity.name}Request {
  name?: string;
  description?: string;
  status?: string;
}

export interface Get${entity.name}Request {
  id: string;
}

export interface List${entity.name}Request {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
}
`;
}

function genResponseDto(_ctx: KitContext, file: BuildFileTarget): string {
  const entity = resolveEntityFromRef(_ctx, file.sourceRef);
  return `export interface ${entity.name}Response {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ${entity.name}ListResponse {
  items: ${entity.name}Response[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ${entity.name}ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
`;
}

function genSharedContract(_ctx: KitContext, file: BuildFileTarget): string {
  const entity = resolveEntityFromRef(_ctx, file.sourceRef);
  const baseName = toCamelCase(entity.name);
  return `export type { ${entity.name} } from "../models/${baseName}";

export interface ${entity.name}Contract {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type ${entity.name}CreatePayload = Omit<${entity.name}Contract, "id" | "createdAt" | "updatedAt">;
export type ${entity.name}UpdatePayload = Partial<${entity.name}CreatePayload>;
`;
}

function genTestFixture(_ctx: KitContext, file: BuildFileTarget): string {
  const entity = resolveEntityFromRef(_ctx, file.sourceRef);
  const varName = toCamelCase(entity.name);
  return `export function create${entity.name}Fixture(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: overrides.id ?? "test-${varName}-1",
    name: overrides.name ?? "Test ${entity.name}",
    description: overrides.description ?? "Test ${entity.name} description",
    status: overrides.status ?? "active",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    ...overrides,
  };
}

export function create${entity.name}FixtureList(count: number = 3): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, i) =>
    create${entity.name}Fixture({
      id: \`test-${varName}-\${i + 1}\`,
      name: \`Test ${entity.name} \${i + 1}\`,
    })
  );
}
`;
}

function genDbSeedEntity(_ctx: KitContext, file: BuildFileTarget): string {
  const entity = resolveEntityFromRef(_ctx, file.sourceRef);
  const varName = toCamelCase(entity.name);
  return `export async function seed${entity.name}s(db: any): Promise<void> {
  const ${varName}Seeds = [
    {
      name: "Sample ${entity.name} 1",
      description: "Auto-generated seed data for ${entity.name}",
      status: "active",
    },
    {
      name: "Sample ${entity.name} 2",
      description: "Auto-generated seed data for ${entity.name}",
      status: "active",
    },
    {
      name: "Sample ${entity.name} 3",
      description: "Auto-generated seed data for ${entity.name}",
      status: "draft",
    },
  ];

  for (const seed of ${varName}Seeds) {
    await db.insert(seed);
  }

  console.log(\`[SEED] Inserted \${${varName}Seeds.length} ${entity.name} records\`);
}
`;
}

function genFormSchema(_ctx: KitContext, file: BuildFileTarget): string {
  const entity = resolveEntityFromRef(_ctx, file.sourceRef);
  return `import { z } from "zod";

export const create${entity.name}Schema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less"),
  description: z.string().max(2000, "Description must be 2000 characters or less").optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
});

export const update${entity.name}Schema = create${entity.name}Schema.partial();

export type Create${entity.name}FormData = z.infer<typeof create${entity.name}Schema>;
export type Update${entity.name}FormData = z.infer<typeof update${entity.name}Schema>;
`;
}

function genDeployConfig(): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  labels:
    app: app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
        - name: app
          image: app:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector:
    app: app
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
`;
}

function genDockerConfig(ctx: KitContext): string {
  const pm = ctx.stackProfile.packageManager || "npm";
  const installCmd = pm === "yarn" ? "yarn install --frozen-lockfile" : pm === "pnpm" ? "pnpm install --frozen-lockfile" : "npm ci";
  const buildCmd = pm === "yarn" ? "yarn build" : pm === "pnpm" ? "pnpm build" : "npm run build";
  return `FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN ${installCmd}

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${buildCmd}

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
`;
}

function genTestUtility(_ctx: KitContext, file: BuildFileTarget): string {
  return `export function createMockRequest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    params: {},
    query: {},
    body: {},
    headers: { "content-type": "application/json" },
    ...overrides,
  };
}

export function createMockResponse(): Record<string, unknown> {
  const res: Record<string, unknown> = {};
  const json = (data: unknown) => { res._json = data; return res; };
  const status = (code: number) => { res._status = code; return res; };
  const send = (data: unknown) => { res._sent = data; return res; };
  res.json = json;
  res.status = status;
  res.send = send;
  return res;
}

export async function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateTestId(prefix: string = "test"): string {
  return \`\${prefix}-\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}\`;
}
`;
}

function genLoadingSkeleton(_ctx: KitContext, file: BuildFileTarget): string {
  const componentName = path.basename(file.relativePath, ".tsx")
    .replace(/Skeleton$/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();

  return `interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export default function ${path.basename(file.relativePath, ".tsx")}({ rows = 3, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={\`animate-pulse space-y-4 \${className}\`}>
      <div className="h-6 w-1/3 rounded bg-gray-200" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
      ))}
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded bg-gray-200" />
        <div className="h-8 w-20 rounded bg-gray-200" />
      </div>
    </div>
  );
}
`;
}

function genPackageJson(ctx: KitContext): string {
  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};
  const scripts: Record<string, string> = {};

  if (ctx.stackProfile.framework.includes("react") || ctx.stackProfile.framework.includes("next")) {
    deps["react"] = "^18.2.0";
    deps["react-dom"] = "^18.2.0";
    deps["react-router-dom"] = "^6.20.0";
    devDeps["@types/react"] = "^18.2.0";
    devDeps["@types/react-dom"] = "^18.2.0";
  }

  if (ctx.stackProfile.framework.includes("express")) {
    deps["express"] = "^4.18.2";
    devDeps["@types/express"] = "^4.17.21";
  }

  if (ctx.stackProfile.framework.includes("next")) {
    deps["next"] = "^14.0.0";
    scripts["dev"] = "next dev";
    scripts["build"] = "next build";
    scripts["start"] = "next start";
  } else {
    devDeps["vite"] = "^5.0.0";
    scripts["dev"] = "vite";
    scripts["build"] = "vite build";
  }

  if (ctx.stackProfile.language === "typescript") {
    devDeps["typescript"] = "^5.3.0";
    devDeps["@types/node"] = "^20.0.0";
  }

  if (ctx.stackProfile.testFramework) {
    if (ctx.stackProfile.testFramework.includes("vitest")) {
      devDeps["vitest"] = "^1.0.0";
      scripts["test"] = "vitest run";
    } else {
      devDeps["jest"] = "^29.0.0";
      scripts["test"] = "jest";
    }
  }

  if (ctx.stackProfile.cssFramework?.includes("tailwind")) {
    devDeps["tailwindcss"] = "^3.4.0";
    devDeps["postcss"] = "^8.4.0";
    devDeps["autoprefixer"] = "^10.4.0";
  }

  deps["zod"] = "^3.22.0";
  deps["@tanstack/react-query"] = "^5.17.0";
  deps["clsx"] = "^2.1.0";
  deps["axios"] = "^1.6.0";
  deps["lucide-react"] = "^0.303.0";
  deps["date-fns"] = "^3.2.0";
  deps["react-hook-form"] = "^7.49.0";
  devDeps["@vitejs/plugin-react"] = "^4.2.0";

  const slug = ctx.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return JSON.stringify({
    name: slug || "axion-project",
    version: "0.1.0",
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  }, null, 2);
}

function genTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      outDir: "./dist",
      rootDir: "./src",
      jsx: "react-jsx",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      baseUrl: ".",
      paths: { "@/*": ["./src/*"] },
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"],
  }, null, 2);
}

function genViteConfig(): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
`;
}

export function hexToShades(hex: string): Record<string, string> {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number, w: number, t: number) => Math.round(c + (t - c) * w);
  const toHex = (rv: number, gv: number, bv: number) => `#${[rv, gv, bv].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
  return {
    50: toHex(mix(r, 0.95, 255), mix(g, 0.95, 255), mix(b, 0.95, 255)),
    100: toHex(mix(r, 0.88, 255), mix(g, 0.88, 255), mix(b, 0.88, 255)),
    200: toHex(mix(r, 0.75, 255), mix(g, 0.75, 255), mix(b, 0.75, 255)),
    300: toHex(mix(r, 0.55, 255), mix(g, 0.55, 255), mix(b, 0.55, 255)),
    400: toHex(mix(r, 0.3, 255), mix(g, 0.3, 255), mix(b, 0.3, 255)),
    500: hex,
    600: toHex(mix(r, 0.15, 0), mix(g, 0.15, 0), mix(b, 0.15, 0)),
    700: toHex(mix(r, 0.3, 0), mix(g, 0.3, 0), mix(b, 0.3, 0)),
    800: toHex(mix(r, 0.45, 0), mix(g, 0.45, 0), mix(b, 0.45, 0)),
    900: toHex(mix(r, 0.6, 0), mix(g, 0.6, 0), mix(b, 0.6, 0)),
  };
}

function genTailwindConfig(ctx: KitContext): string {
  const brandColors = extractBrandColors(ctx);
  let primaryShades: Record<string, string>;
  let secondaryShades: Record<string, string> | null = null;
  let accentShades: Record<string, string> | null = null;

  if (brandColors?.primary && /^#[0-9a-fA-F]{6}$/.test(brandColors.primary)) {
    primaryShades = hexToShades(brandColors.primary);
    if (brandColors.secondary && /^#[0-9a-fA-F]{6}$/.test(brandColors.secondary)) {
      secondaryShades = hexToShades(brandColors.secondary);
    }
    if (brandColors.accent && /^#[0-9a-fA-F]{6}$/.test(brandColors.accent)) {
      accentShades = hexToShades(brandColors.accent);
    }
  } else {
    primaryShades = {
      50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa",
      500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a",
    };
  }

  const indent = (obj: Record<string, string>, depth: number): string => {
    const pad = " ".repeat(depth * 2);
    return Object.entries(obj).map(([k, v]) => `${pad}${k}: "${v}",`).join("\n");
  };

  let colorsBlock = `        primary: {\n${indent(primaryShades, 5)}\n        },`;
  if (secondaryShades) colorsBlock += `\n        secondary: {\n${indent(secondaryShades, 5)}\n        },`;
  if (accentShades) colorsBlock += `\n        accent: {\n${indent(accentShades, 5)}\n        },`;

  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
${colorsBlock}
      },
    },
  },
  plugins: [],
};
`;
}

function genPostcssConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

function genIndexHtml(ctx: KitContext): string {
  const title = ctx.projectName || "App";
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function genEnvExample(ctx: KitContext): string {
  const lines = [
    "# Environment Variables",
    `# Project: ${ctx.projectName}`,
    "",
    "NODE_ENV=development",
    "PORT=3000",
    "",
  ];

  if (ctx.stackProfile.database) {
    lines.push(`DATABASE_URL=postgresql://user:password@localhost:5432/${ctx.projectName.toLowerCase().replace(/\s+/g, "_")}`);
    lines.push("");
  }

  const hasAuth = ctx.features.some(f =>
    f.name.toLowerCase().includes("auth") ||
    f.description.toLowerCase().includes("auth")
  ) || ctx.roles.length > 1;

  if (hasAuth) {
    lines.push("JWT_SECRET=your-secret-key");
    lines.push("SESSION_SECRET=your-session-secret");
    lines.push("");
  }

  return lines.join("\n");
}

function genGitignore(): string {
  return [
    "node_modules/",
    "dist/",
    ".env",
    ".env.local",
    "*.log",
    ".DS_Store",
    "coverage/",
    ".next/",
    ".turbo/",
    "",
  ].join("\n");
}

function genReadme(ctx: KitContext): string {
  const featureList = ctx.features.map(f => `- **${f.name}**: ${f.description}`).join("\n");
  return `# ${ctx.projectName}

> Generated by Axion Build Mode

## Features

${featureList}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start development server
npm run dev
\`\`\`

## Tech Stack

- **Framework**: ${ctx.stackProfile.framework}
- **Language**: ${ctx.stackProfile.language}
- **Runtime**: ${ctx.stackProfile.runtime}
${ctx.stackProfile.database ? `- **Database**: ${ctx.stackProfile.database}` : ""}
${ctx.stackProfile.cssFramework ? `- **CSS**: ${ctx.stackProfile.cssFramework}` : ""}

## Project Structure

\`\`\`
src/
  components/    # UI components
  pages/         # Page components / routes
  api/           # API route handlers
  models/        # Data models
  types/         # TypeScript type definitions
  utils/         # Utility functions
  hooks/         # Custom hooks
\`\`\`

## Roles

${ctx.roles.map(r => `- **${r.name}**: ${r.description}`).join("\n")}

---

*Generated by Axion Internal Build System*
`;
}

function genDockerCompose(ctx: KitContext): string {
  const services: string[] = ["  app:", "    build: .", "    ports:", '      - "3000:3000"', "    env_file:", "      - .env"];

  if (ctx.stackProfile.database?.includes("postgres")) {
    services.push(
      "",
      "  db:",
      "    image: postgres:16-alpine",
      "    environment:",
      "      POSTGRES_DB: app",
      "      POSTGRES_USER: user",
      "      POSTGRES_PASSWORD: password",
      "    ports:",
      '      - "5432:5432"',
      "    volumes:",
      "      - pgdata:/var/lib/postgresql/data",
    );
  }

  let volumes = "";
  if (ctx.stackProfile.database?.includes("postgres")) {
    volumes = "\nvolumes:\n  pgdata:\n";
  }

  return `version: "3.8"\n\nservices:\n${services.join("\n")}${volumes}`;
}

function genCIConfig(): string {
  return `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm test
`;
}

function genTypesFromSpec(ctx: KitContext, file: BuildFileTarget): string {
  const lines: string[] = [];

  for (const feat of ctx.features) {
    const name = feat.name.replace(/[^a-zA-Z0-9]/g, "");
    lines.push(`export interface ${name} {`);
    lines.push(`  id: string;`);
    lines.push(`  createdAt: Date;`);
    lines.push(`  updatedAt: Date;`);
    lines.push(`}`);
    lines.push("");
  }

  for (const role of ctx.roles) {
    const name = role.name.replace(/[^a-zA-Z0-9]/g, "");
    lines.push(`export type ${name}Role = "${role.role_id}";`);
  }

  lines.push("");
  lines.push(`export type UserRole = ${ctx.roles.map(r => `"${r.role_id}"`).join(" | ")};`);
  lines.push("");

  lines.push("export interface User {");
  lines.push("  id: string;");
  lines.push("  email: string;");
  lines.push("  name: string;");
  lines.push("  role: UserRole;");
  lines.push("  createdAt: Date;");
  lines.push("  updatedAt: Date;");
  lines.push("}");

  return lines.join("\n");
}

function genApiTypes(ctx: KitContext, file: BuildFileTarget): string {
  const lines: string[] = [];
  lines.push("export interface ApiResponse<T = unknown> {");
  lines.push("  success: boolean;");
  lines.push("  data?: T;");
  lines.push("  error?: string;");
  lines.push("  message?: string;");
  lines.push("}");
  lines.push("");
  lines.push("export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {");
  lines.push("  total: number;");
  lines.push("  page: number;");
  lines.push("  limit: number;");
  lines.push("}");

  return lines.join("\n");
}

function genDbSchema(ctx: KitContext, _file: BuildFileTarget): string {
  const lines: string[] = [];
  lines.push('import { pgTable, serial, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";');
  lines.push("");
  lines.push("export const users = pgTable('users', {");
  lines.push("  id: serial('id').primaryKey(),");
  lines.push("  email: varchar('email', { length: 255 }).notNull().unique(),");
  lines.push("  name: varchar('name', { length: 255 }).notNull(),");
  lines.push("  role: varchar('role', { length: 50 }).notNull().default('member'),");
  lines.push("  passwordHash: text('password_hash'),");
  lines.push("  active: boolean('active').notNull().default(true),");
  lines.push("  createdAt: timestamp('created_at').notNull().defaultNow(),");
  lines.push("  updatedAt: timestamp('updated_at').notNull().defaultNow(),");
  lines.push("});");

  for (const feat of ctx.features) {
    const tableName = feat.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const varName = tableName.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    lines.push("");
    lines.push(`export const ${varName} = pgTable('${tableName}', {`);
    lines.push("  id: serial('id').primaryKey(),");
    lines.push("  userId: serial('user_id').references(() => users.id),");
    lines.push(`  title: varchar('title', { length: 255 }),`);
    lines.push(`  data: text('data'),`);
    lines.push("  createdAt: timestamp('created_at').notNull().defaultNow(),");
    lines.push("  updatedAt: timestamp('updated_at').notNull().defaultNow(),");
    lines.push("});");
  }

  return lines.join("\n");
}

function genEntityModel(ctx: KitContext, file: BuildFileTarget): string {
  const featureRef = file.sourceRef ?? "";
  const feat = ctx.features.find(f => featureRef.includes(f.feature_id)) ?? ctx.features[0];
  if (!feat) return `// Entity model placeholder\nexport {};\n`;

  const name = feat.name.replace(/[^a-zA-Z0-9]/g, "");
  return `export interface ${name}Entity {
  id: number;
  userId: number;
  title: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create${name}Input {
  userId: number;
  title: string;
  data?: Record<string, unknown>;
}

export interface Update${name}Input {
  title?: string;
  data?: Record<string, unknown>;
}
`;
}

function genMainTsx(ctx: KitContext): string {
  if (ctx.stackProfile.framework.includes("react")) {
    return `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`;
  }
  return `import App from "./App";\n\nconst app = new App();\napp.start();\n`;
}

function genNotFoundPage(): string {
  return `import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <p className="mt-2 text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
`;
}

function genGlobalStyles(ctx: KitContext): string {
  if (ctx.stackProfile.cssFramework?.includes("tailwind")) {
    const brandColors = extractBrandColors(ctx);
    const hasBrand = !!brandColors?.primary;
    const bgClass = hasBrand && brandColors.background ? `bg-[${brandColors.background}]` : "bg-gray-50";
    const textClass = hasBrand && brandColors.text ? `text-[${brandColors.text}]` : "text-gray-900";
    const primaryBtn = hasBrand ? "bg-primary-600" : "bg-blue-600";
    const primaryBtnHover = hasBrand ? "hover:bg-primary-700" : "hover:bg-blue-700";
    const primaryRing = hasBrand ? "ring-primary-500" : "ring-blue-500";
    const primaryFocus = hasBrand ? "focus:ring-primary-600" : "focus:ring-blue-600";

    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply ${bgClass} ${textClass} antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply rounded-lg ${primaryBtn} px-4 py-2 text-sm font-semibold text-white shadow-sm ${primaryBtnHover} focus:outline-none focus:ring-2 focus:${primaryRing} focus:ring-offset-2 transition-colors;
  }

  .btn-secondary {
    @apply rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors;
  }

  .input-field {
    @apply block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${primaryFocus} sm:text-sm;
  }

  .card {
    @apply rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200;
  }
}
`;
  }
  return `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; color: #111827; }
`;
}

function genLoadingSpinner(ctx: KitContext): string {
  const brandColors = extractBrandColors(ctx);
  const spinnerColor = brandColors?.primary ? "border-t-primary-600" : "border-t-blue-600";
  return `interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className={\`flex items-center justify-center \${className}\`}>
      <div className={\`\${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 ${spinnerColor}\`} />
    </div>
  );
}
`;
}

function genTestSetup(ctx: KitContext): string {
  if (ctx.stackProfile.testFramework?.includes("vitest")) {
    return `import { afterEach } from "vitest";

afterEach(() => {
  // Cleanup after each test
});
`;
  }
  return `// Test setup\n`;
}

function genErrorBoundary(ctx: KitContext): string {
  const brandColors = extractBrandColors(ctx);
  const btnBg = brandColors?.primary ? "bg-primary-600" : "bg-blue-600";
  const btnHover = brandColors?.primary ? "hover:bg-primary-700" : "hover:bg-blue-700";
  return `import React, { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-500">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 rounded-lg ${btnBg} px-4 py-2 text-sm font-semibold text-white ${btnHover}"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
`;
}

function genEmptyState(): string {
  return `interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "No items found",
  description = "There's nothing to display here yet.",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={\`flex flex-col items-center justify-center py-12 text-center \${className}\`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
`;
}

function genPagination(ctx: KitContext): string {
  const brandColors = extractBrandColors(ctx);
  const activeBg = brandColors?.primary ? "bg-primary-600" : "bg-blue-600";
  return `interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className={\`flex items-center justify-center gap-1 \${className}\`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={\`ellipsis-\${i}\`} className="px-2 text-gray-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={\`rounded-lg px-3 py-2 text-sm font-medium \${
              page === currentPage
                ? "${activeBg} text-white"
                : "text-gray-700 hover:bg-gray-100"
            }\`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
}
`;
}

function genApiEndpoints(ctx: KitContext): string {
  const bt = "`";
  const lines: string[] = [];
  lines.push("const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';");
  lines.push("");
  lines.push("export const ENDPOINTS = {");
  lines.push("  auth: {");
  lines.push("    login: " + bt + "${API_BASE}/auth/login" + bt + ",");
  lines.push("    register: " + bt + "${API_BASE}/auth/register" + bt + ",");
  lines.push("    logout: " + bt + "${API_BASE}/auth/logout" + bt + ",");
  lines.push("    me: " + bt + "${API_BASE}/auth/me" + bt + ",");
  lines.push("    forgotPassword: " + bt + "${API_BASE}/auth/forgot-password" + bt + ",");
  lines.push("  },");

  for (const feat of ctx.features) {
    const slug = feat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const key = feat.name.replace(/[^a-zA-Z0-9]/g, "");
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    lines.push("  " + camelKey + ": {");
    lines.push("    list: " + bt + "${API_BASE}/" + slug + bt + ",");
    lines.push("    detail: (id: string | number) => " + bt + "${API_BASE}/" + slug + "/${id}" + bt + ",");
    lines.push("    create: " + bt + "${API_BASE}/" + slug + bt + ",");
    lines.push("    update: (id: string | number) => " + bt + "${API_BASE}/" + slug + "/${id}" + bt + ",");
    lines.push("    delete: (id: string | number) => " + bt + "${API_BASE}/" + slug + "/${id}" + bt + ",");
    lines.push("  },");
  }

  lines.push("} as const;");
  lines.push("");
  lines.push("export type EndpointKeys = keyof typeof ENDPOINTS;");
  return lines.join("\n");
}

function genAuthContext(): string {
  return `import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: \`Bearer \${token}\` } })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem("auth_token"))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error("Registration failed");
    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
  };

  const logout = async () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const hasRole = (role: string) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}

export default AuthContext;
`;
}

function genProtectedRoute(): string {
  return `import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
`;
}

function genForgotPasswordPage(): string {
  return `import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send reset email");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-600">If an account exists for {email}, we've sent password reset instructions.</p>
          <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="mt-2 text-sm text-gray-600">Enter your email and we'll send you a reset link.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Send Reset Link
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
`;
}

function genBarrelIndex(file: BuildFileTarget): string {
  const dir = path.dirname(file.relativePath);
  return `// Barrel index for ${dir}\n// Generated by Axion Build Mode\n// Re-export all modules from this directory\n// Source: ${file.sourceRef ?? "auto-generated"}\n\n// TODO: [AXION] Add re-exports as modules are implemented\n`;
}

export function generateDeterministic(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string | null {
  const p = file.relativePath;
  const role = file.role;

  if (p === "package.json") return genPackageJson(ctx);
  if (p === "tsconfig.json") return genTsConfig();
  if (p === "vite.config.ts") return genViteConfig();
  if (p === "tailwind.config.ts") return genTailwindConfig(ctx);
  if (p === "postcss.config.js") return genPostcssConfig();
  if (p === "index.html") return genIndexHtml(ctx);
  if (p === ".env.example") return genEnvExample(ctx);
  if (p === ".gitignore") return genGitignore();
  if (p === "README.md") return genReadme(ctx);
  if (p === "docker-compose.yml") return genDockerCompose(ctx);
  if (p === ".github/workflows/ci.yml") return genCIConfig();

  if (role === "types" || role === "shared_types") return genTypesFromSpec(ctx, file);
  if (role === "api_types") return genApiTypes(ctx, file);
  if (role === "db_schema") return genDbSchema(ctx, file);
  if (role === "entity_model") return genEntityModel(ctx, file);

  if (p === "src/main.tsx") return genMainTsx(ctx);
  if (p === "src/pages/NotFound.tsx") return genNotFoundPage();
  if (p === "src/pages/ForgotPassword.tsx") return genForgotPasswordPage();
  if (p === "src/styles/globals.css") return genGlobalStyles(ctx);
  if (p === "src/components/ui/LoadingSpinner.tsx") return genLoadingSpinner(ctx);
  if (p === "src/components/ui/ErrorBoundary.tsx") return genErrorBoundary(ctx);
  if (p === "src/components/ui/EmptyState.tsx") return genEmptyState();
  if (p === "src/components/ui/Pagination.tsx") return genPagination(ctx);
  if (p === "src/lib/api/endpoints.ts") return genApiEndpoints(ctx);
  if (p === "src/lib/auth/AuthContext.tsx") return genAuthContext();
  if (p === "src/lib/auth/ProtectedRoute.tsx") return genProtectedRoute();
  if (p === "tests/setup.ts") return genTestSetup(ctx);

  if (role === "directory") return null;

  if (role === "model_index" || role === "route_index" || role === "type_barrel" || role === "barrel_export") {
    return genBarrelIndex(file);
  }

  if (role === "entry_point" && file.relativePath.includes("server")) {
    return `// ${file.relativePath}\n// Generated by Axion Build Mode\n// Server entry point\n\nimport app from "./app";\n\nconst PORT = process.env.PORT || 3001;\n\napp.listen(PORT, () => {\n  console.log(\`[server] listening on port \${PORT}\`);\n});\n`;
  }

  if (role === "db_connection") {
    return `// ${file.relativePath}\n// Generated by Axion Build Mode\n// Database connection configuration\n\nimport { drizzle } from "drizzle-orm/node-postgres";\nimport { Pool } from "pg";\n\nconst pool = new Pool({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const db = drizzle(pool);\nexport default db;\n`;
  }

  if (role === "utility") {
    const name = path.basename(file.relativePath, ".ts");
    return `// ${file.relativePath}\n// Generated by Axion Build Mode\n// Utility: ${name}\n\nexport {};\n`;
  }

  if (role === "style_entry") {
    return `/* ${path.basename(file.relativePath)} */\n/* Generated by Axion Build Mode */\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
  }

  if (role === "config_env" || role === "env_config") {
    return genEnvExample({ projectName: "", features: [], roles: [], workflows: [], stackProfile: { framework: "", language: "typescript", runtime: "node", packageManager: "npm" } } as any);
  }

  if (role === "migration_file" || role === "migration") {
    const entityName = file.sourceRef ?? path.basename(file.relativePath, ".ts");
    return `// Migration: ${entityName}\n// Generated by Axion Build Mode\n// Source: ${file.sourceRef ?? "unknown"}\n\nimport { sql } from "drizzle-orm";\n\nexport async function up(db: any) {\n  // TODO: [AXION] Implement migration for ${entityName}\n}\n\nexport async function down(db: any) {\n  // TODO: [AXION] Implement rollback for ${entityName}\n}\n`;
  }

  if (role === "entity_types" || role === "auth_types" || role === "api_types") {
    return genTypesFromSpec({ projectName: "", features: [], roles: [], workflows: [], stackProfile: { framework: "", language: "typescript", runtime: "node", packageManager: "npm" } } as any, file);
  }

  if (role === "db_schema_entity") return genDbSchemaEntity(ctx, file);
  if (role === "request_dto") return genRequestDto(ctx, file);
  if (role === "response_dto") return genResponseDto(ctx, file);
  if (role === "shared_contract") return genSharedContract(ctx, file);
  if (role === "test_fixture") return genTestFixture(ctx, file);
  if (role === "db_seed_entity") return genDbSeedEntity(ctx, file);
  if (role === "form_schema") return genFormSchema(ctx, file);
  if (role === "ci_config") return genCIConfig();
  if (role === "deploy_config") return genDeployConfig();
  if (role === "docker_config") return genDockerConfig(ctx);
  if (role === "test_utility") return genTestUtility(ctx, file);
  if (role === "loading_skeleton") return genLoadingSkeleton(ctx, file);

  return `// ${file.relativePath}\n// Generated by Axion Build Mode\n// Role: ${role}\n// Source: ${file.sourceRef ?? "none"}\n`;
}
