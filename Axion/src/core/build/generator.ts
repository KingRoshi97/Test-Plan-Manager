import * as fs from "fs";
import * as path from "path";
import { recordUsage } from "../usage/tracker.js";
import type { BuildPlan, BuildSlice, BuildFileTarget, StackProfile } from "./types.js";
import type { WorkspacePaths } from "./workspace.js";
import { writeRepoFile, ensureRepoSubdir } from "./workspace.js";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

let _client: any = null;

async function getClient(): Promise<any | null> {
  if (_client) return _client;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey) return null;
  try {
    const mod = await import("openai");
    const OpenAI = mod.default ?? mod;
    _client = new OpenAI({ apiKey, baseURL });
    return _client;
  } catch {
    return null;
  }
}

async function generateCode(messages: OpenAIMessage[], maxTokens = 4096, stage = "BUILD"): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_completion_tokens: maxTokens,
    });
    const usage = (response as any).usage;
    if (usage) {
      recordUsage({
        stage,
        model: "gpt-4o",
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
      });
    }
    return response.choices[0]?.message?.content ?? null;
  } catch (err: any) {
    console.log(`  [BUILD] AI call failed: ${err.message ?? err}`);
    return null;
  }
}

function extractCodeBlock(text: string): string {
  const fenced = text.match(/```(?:typescript|javascript|tsx|jsx|json|css|html|yaml|yml|markdown|md|sh|bash|dockerfile)?\s*\n([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

interface KitContext {
  projectName: string;
  specId: string;
  features: Array<{ feature_id: string; name: string; description: string }>;
  roles: Array<{ role_id: string; name: string; description: string }>;
  workflows: Array<{ workflow_id: string; name: string; steps: string[] }>;
  apiDocs: string;
  dataDocs: string;
  designDocs: string;
  archDocs: string;
  implDocs: string;
  stackProfile: StackProfile;
  routing: { type_preset?: string; build_target?: string };
}

function loadKitContext(runDir: string, plan: BuildPlan): KitContext {
  const kitRoot = path.join(runDir, "kit", "bundle", "agent_kit");
  const coreDir = path.join(kitRoot, "01_core_artifacts");

  let spec: any = {};
  try { spec = JSON.parse(fs.readFileSync(path.join(coreDir, "03_canonical_spec.json"), "utf-8")); } catch {}

  const features = spec.entities?.features ?? [];
  const roles = spec.entities?.roles ?? [];
  const workflows = spec.entities?.workflows ?? [];
  const projectName = spec.meta?.project_name ?? spec.run_id ?? "Project";
  const specId = spec.meta?.spec_id ?? "";
  const routing = spec.routing ?? {};

  function readSlotDocs(slotName: string): string {
    const slotDir = path.join(kitRoot, "10_app", slotName);
    if (!fs.existsSync(slotDir)) return "";
    const files = fs.readdirSync(slotDir).filter(f => f.endsWith(".md") && !f.startsWith("00_"));
    return files.map(f => {
      try { return fs.readFileSync(path.join(slotDir, f), "utf-8"); } catch { return ""; }
    }).filter(Boolean).join("\n\n---\n\n");
  }

  return {
    projectName,
    specId,
    features,
    roles,
    workflows,
    apiDocs: readSlotDocs("09_api_contracts"),
    dataDocs: readSlotDocs("08_data"),
    designDocs: readSlotDocs("02_design"),
    archDocs: readSlotDocs("03_architecture"),
    implDocs: readSlotDocs("04_implementation"),
    stackProfile: plan.stackProfile,
    routing,
  };
}

export interface GeneratorProgress {
  sliceId: string;
  sliceName: string;
  fileIndex: number;
  totalFiles: number;
  filePath: string;
  status: "generating" | "generated" | "failed" | "skipped";
}

export type ProgressCallback = (progress: GeneratorProgress) => void;

export async function generateRepo(
  runDir: string,
  plan: BuildPlan,
  paths: WorkspacePaths,
  onProgress?: ProgressCallback,
): Promise<{ success: boolean; filesGenerated: number; filesFailed: number; errors: string[] }> {
  const ctx = loadKitContext(runDir, plan);
  let filesGenerated = 0;
  let filesFailed = 0;
  const errors: string[] = [];

  for (const slice of plan.slices) {
    console.log(`  [BUILD] Slice: ${slice.name} (${slice.files.length} files, AI=${slice.requiresAI})`);
    slice.status = "in_progress";
    slice.startedAt = new Date().toISOString();

    for (let i = 0; i < slice.files.length; i++) {
      const file = slice.files[i];
      const progress: GeneratorProgress = {
        sliceId: slice.sliceId,
        sliceName: slice.name,
        fileIndex: i,
        totalFiles: slice.files.length,
        filePath: file.relativePath,
        status: "generating",
      };
      onProgress?.(progress);

      try {
        const content = await generateFile(ctx, slice, file);
        if (content !== null) {
          writeRepoFile(paths, file.relativePath, content);
          file.status = "generated";
          file.sizeBytes = Buffer.byteLength(content, "utf-8");
          filesGenerated++;
          progress.status = "generated";
        } else {
          file.status = "failed";
          filesFailed++;
          errors.push(`Failed to generate: ${file.relativePath}`);
          progress.status = "failed";
        }
      } catch (err: any) {
        file.status = "failed";
        filesFailed++;
        const msg = `Error generating ${file.relativePath}: ${err.message}`;
        errors.push(msg);
        console.log(`  [BUILD] ${msg}`);
        progress.status = "failed";
      }
      onProgress?.(progress);
    }

    const allOk = slice.files.every(f => f.status === "generated" || f.status === "skipped");
    slice.status = allOk ? "completed" : "failed";
    slice.completedAt = new Date().toISOString();
    console.log(`  [BUILD] Slice ${slice.name}: ${slice.status}`);
  }

  return { success: filesFailed === 0, filesGenerated, filesFailed, errors };
}

async function generateFile(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): Promise<string | null> {
  if (file.generationMethod === "deterministic") {
    return generateDeterministic(ctx, slice, file);
  }
  return generateWithAI(ctx, slice, file);
}

function generateDeterministic(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string | null {
  const p = file.relativePath;
  const role = file.role;

  if (p === "package.json") return genPackageJson(ctx);
  if (p === "tsconfig.json") return genTsConfig();
  if (p === ".env.example") return genEnvExample(ctx);
  if (p === ".gitignore") return genGitignore();
  if (p === "README.md") return genReadme(ctx);
  if (p === "docker-compose.yml") return genDockerCompose(ctx);
  if (p === ".github/workflows/ci.yml") return genCIConfig();

  if (role === "types" || role === "shared_types") return genTypesFromSpec(ctx, file);
  if (role === "api_types") return genApiTypes(ctx, file);
  if (role === "db_schema") return genDbSchema(ctx, file);
  if (role === "entity_model") return genEntityModel(ctx, file);

  if (role === "directory") return null;

  return `// ${file.relativePath}\n// Generated by Axion Build Mode\n// Role: ${role}\n`;
}

async function generateWithAI(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(ctx, slice, file);
  const userPrompt = buildUserPrompt(ctx, slice, file);

  const result = await generateCode(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    4096,
    `BUILD_${slice.sliceId}`,
  );

  if (!result) return null;
  return extractCodeBlock(result);
}

function buildSystemPrompt(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string {
  const lang = ctx.stackProfile.language === "typescript" ? "TypeScript" : "JavaScript";
  const framework = ctx.stackProfile.framework;

  return `You are a code generator for the Axion Build System. You generate production-quality ${lang} code for a ${framework} application.

RULES:
- Generate ONLY the file content. No explanations, no markdown fencing unless the file IS markdown.
- Follow the project's stack: ${framework}, ${lang}, ${ctx.stackProfile.runtime}
- Use the provided API contracts, data models, and specs as the source of truth
- Do NOT invent features, routes, or entities not in the spec
- Do NOT add dependencies not listed in the project config
- Use clean, idiomatic code with proper error handling
- Include necessary imports
- If information is missing, use a clear placeholder: "// TODO: [AXION] Requires spec clarification"

Project: ${ctx.projectName}
File: ${file.relativePath}
Role: ${file.role}`;
}

function buildUserPrompt(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string {
  const parts: string[] = [];

  parts.push(`Generate the file: ${file.relativePath}`);
  parts.push(`Role: ${file.role}`);
  parts.push(`Slice: ${slice.name}`);

  if (file.sourceRef) {
    parts.push(`Source reference: ${file.sourceRef}`);
  }

  parts.push("\n--- PROJECT CONTEXT ---");
  parts.push(`Features: ${ctx.features.map(f => `${f.feature_id}: ${f.name} - ${f.description}`).join("; ")}`);
  parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}`).join("; ")}`);

  if (slice.name === "api_routes" || file.role.includes("route") || file.role.includes("api")) {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(ctx.apiDocs.slice(0, 3000));
  }

  if (slice.name === "data_layer" || file.role.includes("model") || file.role.includes("schema") || file.role.includes("data")) {
    parts.push("\n--- DATA MODELS ---");
    parts.push(ctx.dataDocs.slice(0, 3000));
  }

  if (slice.name === "components" || file.role.includes("component") || file.role.includes("page")) {
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(ctx.designDocs.slice(0, 2000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(ctx.archDocs.slice(0, 1500));
  }

  if (slice.name === "integration" || file.role.includes("hook") || file.role.includes("client") || file.role.includes("util")) {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(ctx.archDocs.slice(0, 2000));
    parts.push("\n--- API CONTRACTS ---");
    parts.push(ctx.apiDocs.slice(0, 2000));
  }

  if (slice.name === "tests" || file.role.includes("test")) {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(ctx.apiDocs.slice(0, 2000));
  }

  return parts.join("\n");
}

function genPackageJson(ctx: KitContext): string {
  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};
  const scripts: Record<string, string> = {};

  if (ctx.stackProfile.framework.includes("react") || ctx.stackProfile.framework.includes("next")) {
    deps["react"] = "^18.2.0";
    deps["react-dom"] = "^18.2.0";
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
