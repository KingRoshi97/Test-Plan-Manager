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
  const fencePattern = /```(?:[a-zA-Z0-9]*)\s*\n([\s\S]*?)```/g;
  let best = "";
  let match;
  while ((match = fencePattern.exec(text)) !== null) {
    if (match[1].length > best.length) {
      best = match[1];
    }
  }
  if (best) {
    return best.replace(/^```[a-zA-Z0-9]*\s*$/gm, "").trim();
  }
  return text.replace(/^```[a-zA-Z0-9]*\s*$/gm, "").trim();
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
  buildBrief: string | null;
  designIdentity: string | null;
  normalizedDesign: any | null;
  normalizedIntent: any | null;
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

  let buildBrief: string | null = null;
  try { buildBrief = fs.readFileSync(path.join(kitRoot, "00_BUILD_BRIEF.md"), "utf-8"); } catch {}

  let designIdentity: string | null = null;
  try { designIdentity = fs.readFileSync(path.join(kitRoot, "00_DESIGN_IDENTITY.md"), "utf-8"); } catch {}

  let normalizedDesign: any = null;
  let normalizedIntent: any = null;
  try {
    const nir = JSON.parse(fs.readFileSync(path.join(coreDir, "01_normalized_input_record.json"), "utf-8"));
    if (nir.design && typeof nir.design === "object" && Object.keys(nir.design).length > 0) normalizedDesign = nir.design;
    if (nir.intent && typeof nir.intent === "object" && Object.keys(nir.intent).length > 0) normalizedIntent = nir.intent;
  } catch {}

  console.log(`  [BUILD] Kit context loaded: ${features.length} features, ${roles.length} roles, ${workflows.length} workflows, ${workBreakdown.length} work units`);
  console.log(`  [BUILD] Doc slots: requirements=${totalDocs.requirements.length}, design=${totalDocs.design.length}, arch=${totalDocs.architecture.length}, impl=${totalDocs.implementation.length}, security=${totalDocs.security.length}, quality=${totalDocs.quality.length}, ops=${totalDocs.ops.length}, data=${totalDocs.data.length}, api=${totalDocs.api.length}, analytics=${totalDocs.analytics.length}, governance=${totalDocs.governance.length}, release=${totalDocs.release.length}`);
  console.log(`  [BUILD] Kit enrichment: buildBrief=${!!buildBrief}, designIdentity=${!!designIdentity}, design=${!!normalizedDesign}, intent=${!!normalizedIntent}`);
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
    buildBrief,
    designIdentity,
    normalizedDesign,
    normalizedIntent,
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

  return `// ${file.relativePath}\n// Generated by Axion Build Mode\n// Role: ${role}\n`;
}

const COMPLEX_ROLES = new Set(["feature_page", "auth_page", "app_entry", "layout_component", "feature_form", "feature_list", "feature_detail", "settings_page"]);

async function generateWithAI(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(ctx, slice, file);
  const userPrompt = buildUserPrompt(ctx, slice, file);
  const maxTokens = COMPLEX_ROLES.has(file.role) ? 8192 : 6144;

  console.log(`    [BUILD-AI] Calling LLM for ${file.relativePath} (role=${file.role}, maxTokens=${maxTokens})...`);
  const result = await generateCode(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens,
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

function buildFileManifest(ctx: KitContext, slice: BuildSlice): string {
  const lines: string[] = [];
  for (const page of ctx.allPages) {
    lines.push(`- ${page.path} (${page.role}) → default export: ${page.name}`);
  }
  for (const f of slice.files) {
    if (!lines.some(l => l.includes(f.relativePath))) {
      lines.push(`- ${f.relativePath} (${f.role})`);
    }
  }
  const infraFiles = [
    "src/main.tsx (entry_point — wraps App in BrowserRouter)",
    "src/App.tsx (app_entry — Routes only, NO Router)",
    "src/styles/globals.css (styles)",
    "src/lib/api/client.ts (api_client)",
    "src/lib/api/endpoints.ts (api_endpoints)",
    "src/lib/api/interceptors.ts (api_interceptor)",
    "src/lib/auth/AuthContext.tsx (auth_context)",
    "src/lib/auth/ProtectedRoute.tsx (route_guard)",
    "src/lib/auth/useAuth.ts (auth_hook)",
    "src/lib/validators/index.ts (validation)",
    "src/lib/store/index.ts (state_store)",
    "src/lib/utils/index.ts (utilities)",
    "src/components/ui/LoadingSpinner.tsx (ui_component)",
    "src/components/ui/ErrorBoundary.tsx (error_boundary)",
    "src/components/ui/EmptyState.tsx (ui_component)",
    "src/components/ui/Pagination.tsx (ui_component)",
  ];
  for (const inf of infraFiles) {
    const p = inf.split(" (")[0];
    if (!lines.some(l => l.includes(p))) {
      lines.push(`- ${inf}`);
    }
  }
  return lines.join("\n");
}

function normalizeHex(hex: string): string | null {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toLowerCase();
  if (/^#[0-9a-fA-F]{8}$/.test(hex)) return hex.slice(0, 7).toLowerCase();
  return null;
}

function extractBrandColors(ctx: KitContext): Record<string, string> | null {
  let raw: Record<string, string> | null = null;

  if (ctx.normalizedDesign?.brand_colors && typeof ctx.normalizedDesign.brand_colors === "object") {
    const src = ctx.normalizedDesign.brand_colors as Record<string, string>;
    if (Object.keys(src).length > 0) raw = src;
  }

  if (!raw && ctx.designIdentity) {
    const parsed: Record<string, string> = {};
    const hexPattern = /\|\s*(\w+)\s*\|\s*`(#[0-9a-fA-F]{3,8})`/g;
    let m;
    while ((m = hexPattern.exec(ctx.designIdentity)) !== null) {
      parsed[m[1]] = m[2];
    }
    if (Object.keys(parsed).length > 0) raw = parsed;
  }

  if (!raw) return null;

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const hex = normalizeHex(String(value));
    if (hex) normalized[key] = hex;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function extractDesignPreset(ctx: KitContext): string | null {
  if (ctx.normalizedDesign?.visual_preset) return String(ctx.normalizedDesign.visual_preset);
  if (ctx.designIdentity) {
    const m = ctx.designIdentity.match(/## Visual Preset\s*\n+\*\*Preset\*\*:\s*`?(\w+)`?/);
    if (m) return m[1];
  }
  return null;
}

function extractNavPattern(ctx: KitContext): string | null {
  if (ctx.normalizedDesign?.navigation_pref) return String(ctx.normalizedDesign.navigation_pref);
  if (ctx.designIdentity) {
    const m = ctx.designIdentity.match(/## Navigation Pattern\s*\n+\*\*Pattern\*\*:\s*`?(\w+)`?/);
    if (m) return m[1];
  }
  return null;
}

function extractProjectOverview(ctx: KitContext): string | null {
  if (ctx.buildBrief) {
    const m = ctx.buildBrief.match(/## What This App Does\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/);
    if (m) return m[1].trim().split("\n").slice(0, 3).join(" ").slice(0, 300);
  }
  if (ctx.normalizedIntent?.primary_goals) {
    const goals = ctx.normalizedIntent.primary_goals;
    if (Array.isArray(goals)) return goals.slice(0, 3).join(". ");
    if (typeof goals === "string") return goals.slice(0, 300);
  }
  return null;
}

function buildDesignDirective(ctx: KitContext): string {
  const parts: string[] = [];
  const colors = extractBrandColors(ctx);
  const preset = extractDesignPreset(ctx);
  const navPattern = extractNavPattern(ctx);

  if (!colors && !preset && !navPattern) return "";

  parts.push("\nDESIGN DIRECTION (apply to all generated UI):");

  if (colors) {
    const colorLines = Object.entries(colors).map(([role, hex]) => `  ${role}: ${hex}`).join("\n");
    parts.push(`Brand Colors:\n${colorLines}`);
    if (colors.primary) {
      parts.push("Use these brand colors via Tailwind classes: bg-primary-600, text-primary-700, ring-primary-500, etc.");
      parts.push("Do NOT default to generic blue (#3b82f6) or Tailwind blue-* classes. Use the primary-* palette defined in tailwind.config.ts.");
    }
    if (colors.secondary) parts.push("Secondary palette available: bg-secondary-600, text-secondary-700, etc.");
    if (colors.accent) parts.push("Accent palette available: bg-accent-500, text-accent-600, etc.");
  }

  if (preset) {
    const presetMap: Record<string, string> = {
      professional: "Clean lines, 4px inputs/8px cards radius, subtle shadows, 150-200ms transitions, system/Inter font",
      playful: "Rounded 12px buttons/16px cards, bouncy 300ms transitions, generous whitespace, Nunito/Poppins font",
      minimalist: "Sharp edges (0-2px radius), minimal decoration, tight spacing, 100ms fade only, monospace accents",
      bold: "High contrast, 8px standard/24px hero radius, confident 250ms transitions, heavy headings (700-900)",
      elegant: "Subtle 6px curves, generous margins, refined serif/sans-serif, 200ms ease transitions, muted palette",
      modern: "8px radius, clean shadows, 200ms transitions, 14px Inter/system font, balanced whitespace",
      corporate: "4px radius, structured grid, minimal animation, 14px system font, neutral grays",
    };
    const style = presetMap[preset.toLowerCase()] ?? `Apply "${preset}" visual style consistently`;
    parts.push(`Visual Preset: ${preset} — ${style}`);
  }

  if (navPattern) {
    const navMap: Record<string, string> = {
      sidebar: "Fixed left sidebar (240px expanded, 64px collapsed), logo top, nav items with icons, user at bottom",
      topnav: "Horizontal top bar (56-64px), logo left, nav centered/left, user right, hamburger on mobile",
      tabs: "Tab-based content switching, top-aligned, max 5-7 tabs, icons+labels",
      bottom_nav: "Bottom bar (56px) on mobile with 3-5 destinations, convert to sidebar on desktop",
      hybrid: "Sidebar (240px) for sections + top bar (56px) for global actions/search/user",
    };
    const navKey = navPattern.toLowerCase().replace(/[\s-]/g, "_");
    const navStyle = navMap[navKey] ?? `Use "${navPattern}" navigation pattern`;
    parts.push(`Navigation: ${navStyle}`);
  }

  return parts.join("\n");
}

function buildSystemPrompt(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget): string {
  const lang = ctx.stackProfile.language === "typescript" ? "TypeScript" : "JavaScript";
  const framework = ctx.stackProfile.framework;

  const uiComponents = [
    "LoadingSpinner (src/components/ui/LoadingSpinner)",
    "ErrorBoundary (src/components/ui/ErrorBoundary)",
    "EmptyState (src/components/ui/EmptyState)",
    "Pagination (src/components/ui/Pagination)",
  ];
  const availablePackages = [
    "react", "react-dom", "react-router-dom",
    "zod", "@tanstack/react-query", "clsx",
    "axios", "lucide-react", "date-fns", "react-hook-form",
  ];
  if (ctx.stackProfile.cssFramework?.includes("tailwind")) availablePackages.push("tailwindcss");

  const fileManifest = buildFileManifest(ctx, slice);
  const overview = extractProjectOverview(ctx);
  const designDirective = buildDesignDirective(ctx);

  let projectIdentity = `Project: ${ctx.projectName}`;
  if (overview) projectIdentity += `\nOverview: ${overview}`;

  return `You are a code generator for the Axion Build System. You generate production-quality ${lang} code for a ${framework} application.

${projectIdentity}
${designDirective}

CRITICAL RULES:
- Generate ONLY the raw file content. NEVER wrap output in markdown code fences (\`\`\`). No explanations.
- Follow the project's stack: ${framework}, ${lang}, ${ctx.stackProfile.runtime}
- Use the provided API contracts, data models, and specs as the source of truth
- Do NOT invent features, routes, or entities not in the spec
- ONLY import packages from the AVAILABLE PACKAGES list below. Do NOT use any package not in this list.
- When importing project files, use ONLY paths from the FILE MANIFEST below. Do not guess or invent import paths.
- All page and component files use default exports. Import them as: import ComponentName from "./path"
- Use clean, idiomatic code with proper error handling
- Include necessary imports
- IMPORTANT: BrowserRouter is already configured in src/main.tsx. Do NOT import or use BrowserRouter, HashRouter, or MemoryRouter in any component. App.tsx should only use <Routes> and <Route>.
- If information is missing, use a clear placeholder: "// TODO: [AXION] Requires spec clarification"

AVAILABLE PACKAGES (ONLY use these — do not import anything else):
${availablePackages.join(", ")}

AVAILABLE UI COMPONENTS (import from these paths):
${uiComponents.map(c => `- ${c}`).join("\n")}

AUTH INFRASTRUCTURE (when applicable):
- AuthProvider & useAuthContext from src/lib/auth/AuthContext
- ProtectedRoute from src/lib/auth/ProtectedRoute
- useAuth hook from src/lib/auth/useAuth

VALIDATION:
- Use zod for schema validation (import { z } from "zod")
- Per-feature validators in src/lib/validators/

FILE MANIFEST (all files in this project — use these exact paths for imports):
${fileManifest}

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
  const briefOverview = extractProjectOverview(ctx);
  if (briefOverview) parts.push(`Overview: ${briefOverview}`);
  parts.push(`Features: ${ctx.features.map(f => `${f.feature_id}: ${f.name} — ${f.description}`).join("\n  ")}`);
  parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}${r.description ? " — " + r.description : ""}`).join("; ")}`);
  if (ctx.workflows.length > 0) {
    parts.push(`Workflows: ${ctx.workflows.map(w => `${w.workflow_id}: ${w.name} (${w.steps.length} steps: ${w.steps.join(" → ")})`).join("\n  ")}`);
  }
  if (ctx.buildBrief) {
    const oosMatch = ctx.buildBrief.match(/## Out of Scope\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/);
    if (oosMatch) parts.push(`\nOUT OF SCOPE (do NOT implement these):\n${oosMatch[1].trim()}`);
    const techMatch = ctx.buildBrief.match(/## Technical Profile\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/);
    if (techMatch) parts.push(`\nTechnical Profile:\n${techMatch[1].trim().slice(0, 400)}`);
  } else if (ctx.normalizedIntent) {
    if (ctx.normalizedIntent.out_of_scope) {
      const oos = Array.isArray(ctx.normalizedIntent.out_of_scope) ? ctx.normalizedIntent.out_of_scope.join(", ") : String(ctx.normalizedIntent.out_of_scope);
      parts.push(`\nOUT OF SCOPE (do NOT implement these): ${oos}`);
    }
    if (ctx.normalizedIntent.primary_goals) {
      const goals = Array.isArray(ctx.normalizedIntent.primary_goals) ? ctx.normalizedIntent.primary_goals.join("; ") : String(ctx.normalizedIntent.primary_goals);
      parts.push(`Primary Goals: ${goals}`);
    }
  }

  const feat = file.sourceRef ? ctx.features.find(f => f.feature_id === file.sourceRef) : null;
  const featureTerms = feat ? [feat.name, feat.feature_id, ...feat.description.split(/\s+/).filter(w => w.length > 4)] : [];

  if (role === "app_entry") {
    parts.push("\n--- ROUTING MANIFEST ---");
    parts.push("Generate React Router routes for ALL of the following pages:");
    for (const page of ctx.allPages) {
      parts.push(`  <Route path="${page.routePath}" element={<${page.name} />} />`);
    }
    parts.push("\nImport all page components using default imports from the paths shown above.");
    parts.push("Use <Routes> and <Route> from react-router-dom. Do NOT import or use BrowserRouter — it is already in main.tsx.");
    parts.push("Wrap authenticated routes in a layout component (AppLayout) with Header and Sidebar.");
    parts.push("Login, Register, and ForgotPassword pages should NOT be wrapped in the layout.");
    const navPat = extractNavPattern(ctx);
    if (navPat) parts.push(`\nNavigation pattern: ${navPat}. Structure the layout wrapper accordingly.`);
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
    const layoutNav = extractNavPattern(ctx);
    if (layoutNav) parts.push(`Navigation pattern: ${layoutNav}`);
    const layoutColors = extractBrandColors(ctx);
    if (layoutColors?.primary) parts.push(`Primary brand color: ${layoutColors.primary} — use for active nav items, sidebar accent, header highlights`);
    if (layoutColors?.surface) parts.push(`Surface color: ${layoutColors.surface} — use for sidebar/header background`);
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
  } else if (role === "feature_form") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["form", "input", "validation", "design"], 4000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["form", "validation", "submit"], 3000));
    parts.push("\nGenerate a React form component with proper field validation, error messages, loading states, and submit handling.");
    parts.push("Use standard HTML form elements with Tailwind CSS classes. Import LoadingSpinner from src/components/ui/LoadingSpinner.");
    parts.push("Import validation from src/lib/validators/ if applicable.");
  } else if (role === "feature_list") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["list", "table", "grid", "browse"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "schema"], 3000));
    parts.push("\nGenerate a list/browse component with pagination, sorting, filtering, empty state handling, and loading skeleton.");
    parts.push("Use Pagination from src/components/ui/Pagination, EmptyState from src/components/ui/EmptyState, and LoadingSpinner from src/components/ui/LoadingSpinner.");
    parts.push("Build the table/list layout with standard HTML elements and Tailwind CSS classes.");
  } else if (role === "feature_detail") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["detail", "view", "page"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity"], 2000));
    parts.push("\nGenerate a detail view component showing a single item with all its fields, actions (edit, delete), and related data.");
    parts.push("Use LoadingSpinner from src/components/ui/LoadingSpinner and standard HTML/Tailwind for layout.");
  } else if (role === "feature_validation") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "validation"], 4000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["validation", "rule", "constraint"], 2000));
    parts.push("\nGenerate Zod validation schemas for this feature's data input/output. Export named schemas and inferred types.");
    parts.push("import { z } from 'zod';");
  } else if (role === "validation") {
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, ["data", "schema", "validation", "entity"], 3000));
    parts.push("\nGenerate a shared validation utilities file. Export common validators (email, password, required, minLength, etc.) and a validateForm helper.");
    parts.push("import { z } from 'zod';");
  } else if (role === "auth_hook") {
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "session", "token", "login", "IAM"], 5000));
    parts.push("\n--- ROLES ---");
    parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}`).join(", ")}`);
    parts.push("\nGenerate a useAuth React hook that wraps AuthContext. Provides: user, login, logout, register, isAuthenticated, isLoading, hasRole(role).");
    parts.push("Import from src/lib/auth/AuthContext and src/lib/api/client.");
  } else if (role === "auth_layout") {
    parts.push("\n--- DESIGN ---");
    parts.push(findRelevantDocs(ctx.designDocs, ["auth", "login", "form", "layout"], 3000));
    const authColors = extractBrandColors(ctx);
    if (authColors?.primary) parts.push(`Brand primary color: ${authColors.primary} — use for submit buttons, links, focus rings`);
    if (authColors?.background) parts.push(`Background: ${authColors.background}`);
    parts.push(`\nGenerate a centered auth layout for login/register/forgot-password pages for "${ctx.projectName}". Includes logo/brand mark, app name, and a centered card container for the form.`);
  } else if (role === "api_interceptor") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["API", "client", "interceptor", "middleware"], 3000));
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "token", "session"], 2000));
    parts.push("\nGenerate request/response interceptors for the API client. Handle: auth token injection from localStorage, 401 redirect to login, request/response logging, error normalization.");
  } else if (role === "state_store") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["state", "store", "architecture"], 3000));
    parts.push("\nGenerate a lightweight state management store. Use React Context + useReducer pattern or zustand. Export typed store hooks for global app state (user, theme, notifications).");
    parts.push(`Features to manage state for: ${ctx.features.map(f => f.name).join(", ")}`);
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

function hexToShades(hex: string): Record<string, string> {
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
