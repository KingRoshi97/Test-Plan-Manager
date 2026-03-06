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

interface DocFile {
  name: string;
  content: string;
}

interface KitContext {
  projectName: string;
  specId: string;
  features: Array<{ feature_id: string; name: string; description: string }>;
  roles: Array<{ role_id: string; name: string; description: string }>;
  workflows: Array<{ workflow_id: string; name: string; steps: string[] }>;
  workBreakdown: Array<{ unit_id: string; title: string; type: string; deliverables: string[]; scope_refs: string[] }>;
  requirementsDocs: DocFile[];
  designDocs: DocFile[];
  archDocs: DocFile[];
  implDocs: DocFile[];
  securityDocs: DocFile[];
  qualityDocs: DocFile[];
  opsDocs: DocFile[];
  dataDocs: DocFile[];
  apiDocs: DocFile[];
  analyticsDocs: DocFile[];
  governanceDocs: DocFile[];
  releaseDocs: DocFile[];
  allPages: Array<{ path: string; routePath: string; name: string; role: string; sourceRef?: string }>;
  stackProfile: StackProfile;
  routing: { type_preset?: string; build_target?: string };
}

function loadKitContext(runDir: string, plan: BuildPlan): KitContext {
  const kitRoot = path.join(runDir, "kit", "bundle", "agent_kit");
  const coreDir = path.join(kitRoot, "01_core_artifacts");

  let spec: any = {};
  try { spec = JSON.parse(fs.readFileSync(path.join(coreDir, "03_canonical_spec.json"), "utf-8")); } catch {}

  let wb: any = {};
  try { wb = JSON.parse(fs.readFileSync(path.join(coreDir, "04_work_breakdown.json"), "utf-8")); } catch {}

  const features = spec.entities?.features ?? [];
  const roles = spec.entities?.roles ?? [];
  const workflows = spec.entities?.workflows ?? [];
  const workBreakdown = wb.units ?? [];
  const projectName = spec.meta?.project_name ?? spec.run_id ?? "Project";
  const specId = spec.meta?.spec_id ?? "";
  const routing = spec.routing ?? {};

  function readSlotDocs(slotName: string): DocFile[] {
    const slotDir = path.join(kitRoot, "10_app", slotName);
    if (!fs.existsSync(slotDir)) return [];
    const fileNames = fs.readdirSync(slotDir).filter((f: string) => f.endsWith(".md") && !f.startsWith("00_"));
    return fileNames.map((f: string) => {
      try {
        return { name: f, content: fs.readFileSync(path.join(slotDir, f), "utf-8") };
      } catch { return null; }
    }).filter(Boolean) as DocFile[];
  }

  const allPages: KitContext["allPages"] = [];
  for (const slice of plan.slices) {
    for (const file of slice.files) {
      if (file.relativePath.startsWith("src/pages/") && file.relativePath.endsWith(".tsx")) {
        const name = path.basename(file.relativePath, ".tsx");
        const routePath = name === "Home" ? "/" : name === "NotFound" ? "*" : `/${name.replace(/([A-Z])/g, (m, c, i) => i === 0 ? c.toLowerCase() : `-${c.toLowerCase()}`)}`;
        allPages.push({ path: file.relativePath, routePath, name, role: file.role, sourceRef: file.sourceRef });
      }
    }
  }

  const totalDocs = {
    requirements: readSlotDocs("01_requirements"),
    design: readSlotDocs("02_design"),
    architecture: readSlotDocs("03_architecture"),
    implementation: readSlotDocs("04_implementation"),
    security: readSlotDocs("05_security"),
    quality: readSlotDocs("06_quality"),
    ops: readSlotDocs("07_ops"),
    data: readSlotDocs("08_data"),
    api: readSlotDocs("09_api_contracts"),
    release: readSlotDocs("10_release"),
    governance: readSlotDocs("11_governance"),
    analytics: readSlotDocs("12_analytics"),
  };

  console.log(`  [BUILD] Kit context loaded: ${features.length} features, ${roles.length} roles, ${workflows.length} workflows, ${workBreakdown.length} work units`);
  console.log(`  [BUILD] Doc slots: requirements=${totalDocs.requirements.length}, design=${totalDocs.design.length}, arch=${totalDocs.architecture.length}, impl=${totalDocs.implementation.length}, security=${totalDocs.security.length}, quality=${totalDocs.quality.length}, ops=${totalDocs.ops.length}, data=${totalDocs.data.length}, api=${totalDocs.api.length}, analytics=${totalDocs.analytics.length}, governance=${totalDocs.governance.length}, release=${totalDocs.release.length}`);
  console.log(`  [BUILD] Pages planned: ${allPages.map(p => p.name).join(", ")}`);

  return {
    projectName,
    specId,
    features,
    roles,
    workflows,
    workBreakdown,
    requirementsDocs: totalDocs.requirements,
    designDocs: totalDocs.design,
    archDocs: totalDocs.architecture,
    implDocs: totalDocs.implementation,
    securityDocs: totalDocs.security,
    qualityDocs: totalDocs.quality,
    opsDocs: totalDocs.ops,
    dataDocs: totalDocs.data,
    apiDocs: totalDocs.api,
    analyticsDocs: totalDocs.analytics,
    governanceDocs: totalDocs.governance,
    releaseDocs: totalDocs.release,
    allPages,
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
      const method = file.generationMethod === "ai_assisted" ? "AI" : "DET";
      console.log(`  [BUILD] [${filesGenerated + filesFailed + 1}/${plan.totalFiles}] Generating ${file.relativePath} (${method}, role=${file.role})`);
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
          console.log(`  [BUILD] [${filesGenerated + filesFailed}/${plan.totalFiles}] ✓ ${file.relativePath} (${file.sizeBytes} bytes)`);
        } else {
          file.status = "failed";
          filesFailed++;
          errors.push(`Failed to generate: ${file.relativePath}`);
          progress.status = "failed";
          console.log(`  [BUILD] [${filesGenerated + filesFailed}/${plan.totalFiles}] ✗ ${file.relativePath} — generation returned null`);
        }
      } catch (err: any) {
        file.status = "failed";
        filesFailed++;
        const msg = `Error generating ${file.relativePath}: ${err.message}`;
        errors.push(msg);
        console.log(`  [BUILD] [${filesGenerated + filesFailed}/${plan.totalFiles}] ✗ ${msg}`);
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

  if (p === "src/main.tsx") return genMainTsx(ctx);
  if (p === "src/pages/NotFound.tsx") return genNotFoundPage();
  if (p === "src/styles/globals.css") return genGlobalStyles(ctx);
  if (p === "src/components/ui/LoadingSpinner.tsx") return genLoadingSpinner();
  if (p === "tests/setup.ts") return genTestSetup(ctx);

  if (role === "directory") return null;

  return `// ${file.relativePath}\n// Generated by Axion Build Mode\n// Role: ${role}\n`;
}

async function generateWithAI(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(ctx, slice, file);
  const userPrompt = buildUserPrompt(ctx, slice, file);

  console.log(`    [BUILD-AI] Calling LLM for ${file.relativePath} (role=${file.role})...`);
  const result = await generateCode(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    6144,
    `BUILD_${slice.sliceId}`,
  );

  if (!result) {
    console.log(`    [BUILD-AI] LLM returned empty for ${file.relativePath}`);
    return null;
  }
  const code = extractCodeBlock(result);
  console.log(`    [BUILD-AI] LLM response received for ${file.relativePath} (${code.length} chars)`);
  return code;
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

function joinDocs(docs: DocFile[], maxChars: number): string {
  let result = "";
  for (const doc of docs) {
    const entry = `### ${doc.name}\n${doc.content}\n\n---\n\n`;
    if (result.length + entry.length > maxChars) {
      const remaining = maxChars - result.length;
      if (remaining > 200) result += entry.slice(0, remaining) + "\n[truncated]";
      break;
    }
    result += entry;
  }
  return result;
}

function findRelevantDocs(docs: DocFile[], searchTerms: string[], maxChars: number): string {
  const scored = docs.map(doc => {
    const lower = (doc.name + " " + doc.content.slice(0, 500)).toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
      if (lower.includes(term.toLowerCase())) score += 1;
    }
    return { doc, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter(s => s.score > 0).map(s => s.doc);
  if (relevant.length === 0) return joinDocs(docs.slice(0, 5), maxChars);
  return joinDocs(relevant, maxChars);
}

function buildUserPrompt(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string {
  const parts: string[] = [];
  const role = file.role;

  parts.push(`Generate the file: ${file.relativePath}`);
  parts.push(`Role: ${role}`);
  parts.push(`Slice: ${slice.name}`);

  if (file.sourceRef) {
    parts.push(`Source reference: ${file.sourceRef}`);
  }

  parts.push("\n--- PROJECT CONTEXT ---");
  parts.push(`Project: ${ctx.projectName}`);
  parts.push(`Features: ${ctx.features.map(f => `${f.feature_id}: ${f.name} — ${f.description}`).join("\n  ")}`);
  parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}${r.description ? " — " + r.description : ""}`).join("; ")}`);
  if (ctx.workflows.length > 0) {
    parts.push(`Workflows: ${ctx.workflows.map(w => `${w.workflow_id}: ${w.name} (${w.steps.length} steps: ${w.steps.join(" → ")})`).join("\n  ")}`);
  }

  const feat = file.sourceRef ? ctx.features.find(f => f.feature_id === file.sourceRef) : null;
  const featureTerms = feat ? [feat.name, feat.feature_id, ...feat.description.split(/\s+/).filter(w => w.length > 4)] : [];

  if (role === "app_entry") {
    parts.push("\n--- ROUTING MANIFEST ---");
    parts.push("Generate React Router routes for ALL of the following pages:");
    for (const page of ctx.allPages) {
      parts.push(`  <Route path="${page.routePath}" element={<${page.name} />} />`);
    }
    parts.push("\nImport all page components. Use <Routes> from react-router-dom.");
    parts.push("Wrap authenticated routes in a layout component (AppLayout) with Header and Sidebar.");
    parts.push("Login and Register pages should NOT be wrapped in the layout.");
    parts.push("\n--- FEATURES ---");
    parts.push(ctx.features.map(f => `- ${f.name}: ${f.description}`).join("\n"));
    parts.push("\n--- DESIGN SYSTEM ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["design system", "navigation", "layout", "DSYS", "IXD"], 3000));
  } else if (role === "feature_page" || role === "feature_component") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
      const relatedWU = ctx.workBreakdown.filter(wu => wu.scope_refs?.some(ref => ref.includes(feat.feature_id)));
      if (relatedWU.length > 0) {
        parts.push(`Work Units: ${relatedWU.map(wu => `${wu.unit_id}: ${wu.title} — deliverables: ${wu.deliverables.join(", ")}`).join("\n  ")}`);
      }
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["design", "UI", "component"], 4000));
    parts.push("\n--- IMPLEMENTATION GUIDANCE ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["frontend", "component", "page"], 3000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["requirement", "user"], 2000));
    if (role === "feature_page") {
      parts.push("\nGenerate a full React page component with proper state management, data fetching hooks, and UI rendering.");
      parts.push("Use the UI components from src/components/ui/ (Button, Card, Input, Modal, Table).");
      parts.push("Import the feature component from src/components/features/ if needed.");
    }
  } else if (role === "auth_page") {
    parts.push("\n--- SECURITY & AUTH ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "login", "IAM", "session", "token", "permission"], 5000));
    parts.push("\n--- ROLES & PERMISSIONS ---");
    parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}${r.description ? " — " + r.description : ""}`).join("\n  ")}`);
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["login", "auth", "form", "sign"], 2000));
    if (file.relativePath.includes("Login")) {
      parts.push("\nGenerate a login page with email/password form, validation, error handling, and a link to the register page.");
    } else {
      parts.push("\nGenerate a registration page with name/email/password fields, validation, terms acceptance, and a link to the login page.");
    }
  } else if (role === "settings_page") {
    parts.push("\n--- SECURITY & GOVERNANCE ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["settings", "admin", "config", "permission"], 3000));
    parts.push(findRelevantDocs(ctx.governanceDocs, ["governance", "compliance", "policy"], 2000));
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["settings", "admin", "configuration"], 2000));
  } else if (role === "layout_component") {
    parts.push("\n--- NAVIGATION & LAYOUT ---");
    const pageNames = ctx.allPages.filter(p => p.role !== "error_page").map(p => `${p.name} (${p.routePath})`);
    parts.push(`Pages to navigate to: ${pageNames.join(", ")}`);
    parts.push("\n--- DESIGN SYSTEM ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["navigation", "layout", "sidebar", "header", "design system", "DSYS", "IXD"], 4000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, ["navigation", "layout", "menu", "workflow"], 2000));
  } else if (role === "ui_component") {
    parts.push("\n--- DESIGN SYSTEM ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["design system", "component", "DSYS", "button", "card", "input", "modal", "table", "accessibility", "A11Y"], 5000));
    parts.push("\nGenerate a reusable, well-typed React component with proper props interface, Tailwind CSS styling, and accessibility attributes.");
  } else if (role === "api_route" || role === "route_index" || role === "workflow_middleware" || role === "middleware") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route", "REST"], 5000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model"], 2000));
    if (role === "workflow_middleware") {
      const wf = ctx.workflows.find(w => w.workflow_id === file.sourceRef);
      if (wf) {
        parts.push(`\n--- WORKFLOW ---`);
        parts.push(`Workflow: ${wf.name} (${wf.workflow_id})`);
        parts.push(`Steps: ${wf.steps.join(" → ")}`);
      }
    }
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "middleware", "permission", "rate limit"], 2000));
  } else if (role === "db_schema" || role === "entity_model" || role === "model_index") {
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model", "entity"], 5000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["data", "requirement"], 2000));
  } else if (role === "test" || role === "test_setup") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint"], 3000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "quality", "coverage", "assertion"], 2000));
    if (feat) {
      parts.push(`\nWrite comprehensive tests for the ${feat.name} feature including happy path, error cases, and edge cases.`);
    }
  } else if (role === "hook" || role === "api_client" || role === "utilities") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["architecture", "service", "hook", "client"], 3000));
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "contract"], 3000));
  } else if (role === "page") {
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["home", "landing", "overview", "navigation"], 3000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, ["overview", "home", "landing"], 2000));
    parts.push("\nThis is the landing/home page. It should provide an overview of the application and quick navigation to key features.");
    const featureLinks = ctx.allPages.filter(p => p.role !== "error_page" && p.name !== "Home" && p.name !== "Login" && p.name !== "Register");
    if (featureLinks.length > 0) {
      parts.push(`Feature pages to link to: ${featureLinks.map(p => `${p.name} (${p.routePath})`).join(", ")}`);
    }
  } else {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["architecture"], 2000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, ["implementation"], 2000));
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
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 59 130 246;
    --color-secondary: 100 116 139;
  }

  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
  }

  .btn-secondary {
    @apply rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors;
  }

  .input-field {
    @apply block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm;
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

function genLoadingSpinner(): string {
  return `interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className={\`flex items-center justify-center \${className}\`}>
      <div className={\`\${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600\`} />
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
