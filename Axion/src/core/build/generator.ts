/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUILD AGENT (BA) — Code Generator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ROLE: The BA executes the Agent Kit (produced by the IA pipeline S1–S10)
 * to generate working software using Claude. It reads the blueprint,
 * build plan, and GSE strategy plan, then produces files via deterministic
 * generators or LLM calls.
 *
 * BOUNDARY RULES:
 * - The BA does NOT perform IA functions: no spec analysis, no standards
 *   resolution, no template selection or rendering, no document generation.
 * - The BA does NOT perform BAQ functions: no certification, no quality
 *   scoring, no gate enforcement. BAQ evaluates BA outputs after the fact.
 * - The BA ONLY reads IA outputs (blueprint, kit, build plan) and produces
 *   source code files. It does not modify or interpret the Agent Kit.
 * - All LLM calls are for code generation only — not for analysis,
 *   planning, or quality assessment.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { recordUsage } from "../usage/tracker.js";
import type {
  BuildPlan, BuildSlice, BuildFileTarget, StackProfile,
  GenerationStrategyPlan, BuildUnit, GenerationStrategy, ContextCapsule,
  UnitGenerationResult, BlueprintFileEntry,
  DocFile, KitContext, GeneratorProgress, ProgressCallback,
  AIMessage, RemediationFileContext, FixUnitResult, GenerateCodeFn,
} from "./types.js";
import type { WorkspacePaths } from "./workspace.js";
import { writeRepoFile, ensureRepoSubdir } from "./workspace.js";
import {
  COMPLEX_ROLES, buildDesignDirective, buildFrozenSystemPrompt,
  buildSystemPrompt, buildUserPrompt, extractProjectOverview,
  extractBrandColors,
} from "./prompt-builders.js";
import { generateDeterministic, hexToShades } from "./deterministic-generators.js";
import { fixUnitsFromFindings as _fixUnitsFromFindings } from "./remediation.js";

export { generateDeterministic, hexToShades } from "./deterministic-generators.js";
export type { RemediationFileContext, FixFileResult, FixUnitResult, GeneratorProgress, ProgressCallback } from "./types.js";

function safeParseInt(envVal: string | undefined, fallback: number, min: number): number {
  if (!envVal) return fallback;
  const parsed = parseInt(envVal, 10);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
}

const BUILD_CONCURRENCY = safeParseInt(process.env.BUILD_CONCURRENCY, 5, 1);
const API_CALL_TIMEOUT_MS = safeParseInt(process.env.BUILD_API_TIMEOUT_MS, 90000, 5000);
const API_CALL_MAX_RETRIES = safeParseInt(process.env.BUILD_API_RETRIES, 1, 0);
const UNIT_TIMEOUT_MS = safeParseInt(process.env.BUILD_UNIT_TIMEOUT_MS, 300000, 30000);

const QUALITY_DETERMINISTIC_ROLES = new Set([
  "package_manifest", "ts_config", "build_config", "css_config", "html_entry",
  "env_template", "git_config", "lint_config", "format_config", "config_env",
  "entry_point", "styles", "style_entry",
  "db_schema_entity", "db_schema", "request_dto", "response_dto",
  "shared_contract", "test_fixture", "db_seed_entity", "db_seed",
  "form_schema", "loading_skeleton",
  "types", "shared_types", "api_types", "entity_types", "auth_types",
  "entity_model",
  "ci_config", "deploy_config", "docker_config",
  "test_utility",
  "directory",
]);

const TRIVIAL_AI_ROLES = new Set([
  "barrel_export", "model_index", "route_index", "type_barrel",
  "enum_types",
]);

const SHARED_INFRA_PATHS = [
  "src/main.tsx", "src/App.tsx", "src/styles/globals.css",
  "src/lib/api/client.ts", "src/lib/api/endpoints.ts", "src/lib/api/interceptors.ts",
  "src/lib/auth/context.tsx", "src/lib/auth/ProtectedRoute.tsx", "src/lib/auth/useAuth.ts",
  "src/lib/validators/index.ts", "src/lib/store/index.ts", "src/lib/utils/index.ts",
  "src/components/ui/LoadingSpinner.tsx", "src/components/ui/ErrorBoundary.tsx",
  "src/components/ui/EmptyState.tsx", "src/components/ui/Pagination.tsx",
];

let _client: any = null;

async function getClient(): Promise<any | null> {
  if (_client) return _client;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  if (!apiKey) {
    console.error("  [BUILD] FATAL: AI_INTEGRATIONS_ANTHROPIC_API_KEY is not set — cannot make API calls");
    return null;
  }
  try {
    const mod = await import("@anthropic-ai/sdk");
    const Anthropic = mod.default ?? mod;
    _client = new Anthropic({ apiKey, baseURL });
    console.log(`  [BUILD] Anthropic client initialized (baseURL=${baseURL ? "custom" : "default"})`);
    return _client;
  } catch (err: any) {
    console.error(`  [BUILD] FATAL: Failed to initialize Anthropic SDK: ${err.message}`);
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string, signal?: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error(`Aborted before start [${label}]`));
      return;
    }
    const timer = setTimeout(() => {
      reject(new Error(`Timed out after ${ms}ms [${label}]`));
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error(`Aborted [${label}]`));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (val) => { clearTimeout(timer); signal?.removeEventListener("abort", onAbort); resolve(val); },
      (err) => { clearTimeout(timer); signal?.removeEventListener("abort", onAbort); reject(err); },
    );
  });
}

export async function generateCode(messages: AIMessage[], maxTokens = 8192, stage = "BUILD", model = "claude-sonnet-4-6", signal?: AbortSignal): Promise<string | null> {
  if (signal?.aborted) return null;

  const client = await getClient();
  if (!client) {
    console.error(`  [BUILD] No API client available for ${stage} — returning null`);
    return null;
  }

  const systemMsg = messages.find(m => m.role === "system");
  const nonSystemMsgs = messages.filter(m => m.role !== "system").map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  for (let attempt = 0; attempt <= API_CALL_MAX_RETRIES; attempt++) {
    if (signal?.aborted) return null;

    const abortController = new AbortController();
    const timer = setTimeout(() => abortController.abort(), API_CALL_TIMEOUT_MS);
    const onExternalAbort = () => abortController.abort();
    signal?.addEventListener("abort", onExternalAbort, { once: true });

    try {
      if (attempt > 0) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`  [BUILD] Retry ${attempt}/${API_CALL_MAX_RETRIES} for ${stage} (${model}) after ${backoffMs}ms backoff`);
        await new Promise(r => setTimeout(r, backoffMs));
      }

      const response: any = await client.messages.create(
        {
          model,
          max_tokens: maxTokens,
          ...(systemMsg ? { system: systemMsg.content } : {}),
          messages: nonSystemMsgs,
        },
        { signal: abortController.signal },
      );

      clearTimeout(timer);
      signal?.removeEventListener("abort", onExternalAbort);

      const usage = response.usage;
      if (usage) {
        recordUsage({
          stage,
          model,
          promptTokens: usage.input_tokens ?? 0,
          completionTokens: usage.output_tokens ?? 0,
        });
      }
      const textParts = response.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.text);
      return textParts.length > 0 ? textParts.join("") : null;
    } catch (err: any) {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onExternalAbort);

      if (signal?.aborted) {
        console.log(`  [BUILD] Claude call aborted externally (${model}, ${stage})`);
        return null;
      }

      const isAbort = err.name === "AbortError" || abortController.signal.aborted;
      const isRateLimit = err.status === 429;
      const isOverloaded = err.status === 529;
      const isRetryable = isAbort || isRateLimit || isOverloaded;
      const reason = isAbort ? `API call timed out after ${API_CALL_TIMEOUT_MS}ms` : (err.message ?? String(err));

      console.log(`  [BUILD] Claude call failed (${model}, attempt ${attempt + 1}/${API_CALL_MAX_RETRIES + 1}): ${reason}${isRetryable ? " [retryable]" : ""}`);

      if (isRateLimit && attempt < API_CALL_MAX_RETRIES) {
        const retryAfter = safeParseInt(err.headers?.["retry-after"], 15, 1);
        console.log(`  [BUILD] Rate limited — waiting ${retryAfter}s before retry`);
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (isRetryable && attempt < API_CALL_MAX_RETRIES) {
        continue;
      }

      return null;
    }
  }

  return null;
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

function loadKitContext(runDir: string, plan: BuildPlan): KitContext {
  const kitRoot = path.join(runDir, "kit", "bundle", "agent_kit");
  const coreDir = path.join(kitRoot, "01_core_artifacts");

  let spec: any = {};
  try { spec = JSON.parse(fs.readFileSync(path.join(coreDir, "03_canonical_spec.json"), "utf-8")); } catch (err: any) { console.log(`  [BUILD] Failed to load canonical spec: ${err.message}`); }

  let wb: any = {};
  try { wb = JSON.parse(fs.readFileSync(path.join(coreDir, "04_work_breakdown.json"), "utf-8")); } catch (err: any) { console.log(`  [BUILD] Failed to load work breakdown: ${err.message}`); }

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
  try { buildBrief = fs.readFileSync(path.join(kitRoot, "00_BUILD_BRIEF.md"), "utf-8"); } catch (err: any) { console.log(`  [BUILD] Failed to load build brief: ${err.message}`); }

  let designIdentity: string | null = null;
  try { designIdentity = fs.readFileSync(path.join(kitRoot, "00_DESIGN_IDENTITY.md"), "utf-8"); } catch (err: any) { console.log(`  [BUILD] Failed to load design identity: ${err.message}`); }

  let normalizedDesign: any = null;
  let normalizedIntent: any = null;
  try {
    const nir = JSON.parse(fs.readFileSync(path.join(coreDir, "01_normalized_input_record.json"), "utf-8"));
    if (nir.design && typeof nir.design === "object" && Object.keys(nir.design).length > 0) normalizedDesign = nir.design;
    if (nir.intent && typeof nir.intent === "object" && Object.keys(nir.intent).length > 0) normalizedIntent = nir.intent;
  } catch (err: any) { console.log(`  [BUILD] Failed to load normalized input record: ${err.message}`); }

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

function parseMultiFileOutput(raw: string): Array<{ path: string; content: string }> | null {
  const filePattern = /===FILE:\s*(.+?)===\s*\n([\s\S]*?)(?=\n===FILE:|$)/g;
  const results: Array<{ path: string; content: string }> = [];
  let match;
  while ((match = filePattern.exec(raw)) !== null) {
    const filePath = match[1].trim();
    let content = match[2].trim();
    content = extractCodeBlock(content) || content;
    if (filePath && content) {
      results.push({ path: filePath, content });
    }
  }
  return results.length > 0 ? results : null;
}

function resolveModelForStrategy(strategy: GenerationStrategy): string {
  if (strategy.generation_mode === "deterministic" || strategy.generation_mode === "template") {
    return "none";
  }
  if (strategy.model_tier === "mini") return "claude-haiku-4-5";
  if (strategy.model_tier === "full") return "claude-sonnet-4-6";
  return "claude-sonnet-4-6";
}

function buildScopedManifest(
  unit: BuildUnit,
  allUnits: BuildUnit[],
  fileInventory: BlueprintFileEntry[],
  ctx: KitContext,
): string {
  const relevantFileIds = new Set<string>();

  for (const fid of unit.file_ids) relevantFileIds.add(fid);

  for (const depId of unit.dependency_unit_ids) {
    const depUnit = allUnits.find(u => u.id === depId);
    if (depUnit) {
      for (const fid of depUnit.file_ids) relevantFileIds.add(fid);
    }
  }

  const sharedUnit = allUnits.find(u => u.unit_type === "shared_unit");
  if (sharedUnit && sharedUnit.id !== unit.id) {
    for (const fid of sharedUnit.file_ids) relevantFileIds.add(fid);
  }

  const fileMap = new Map<string, BlueprintFileEntry>();
  for (const f of fileInventory) fileMap.set(f.file_id, f);

  const lines: string[] = [];

  for (const page of ctx.allPages) {
    lines.push(`- ${page.path} (${page.role}) → default export: ${page.name}`);
  }

  relevantFileIds.forEach(fid => {
    const f = fileMap.get(fid);
    if (f && !lines.some(l => l.includes(f.path))) {
      lines.push(`- ${f.path} (${f.role})`);
    }
  });

  for (const infraPath of SHARED_INFRA_PATHS) {
    if (!lines.some(l => l.includes(infraPath))) {
      const entry = fileInventory.find(f => f.path === infraPath);
      if (entry) {
        lines.push(`- ${entry.path} (${entry.role})`);
      } else {
        lines.push(`- ${infraPath}`);
      }
    }
  }

  return lines.join("\n");
}

function computeUnitCacheKey(
  unit: BuildUnit,
  strategy: GenerationStrategy,
  capsule: ContextCapsule | undefined,
  scopedManifest: string,
  frozenSystemPrompt: string,
): string {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(unit.file_ids));
  hash.update(JSON.stringify(strategy));
  hash.update(JSON.stringify(capsule ?? {}));
  hash.update(scopedManifest);
  hash.update(frozenSystemPrompt);
  return hash.digest("hex").slice(0, 16);
}

interface UnitCacheEntry {
  cache_key: string;
  unit_id: string;
  files_produced: Array<{ path: string; content: string }>;
  model_used: string;
  timestamp: string;
}

function loadUnitCache(runDir: string): Map<string, UnitCacheEntry> {
  const cacheDir = path.join(runDir, "build", "unit_cache");
  const cache = new Map<string, UnitCacheEntry>();
  if (!fs.existsSync(cacheDir)) return cache;

  try {
    const indexPath = path.join(cacheDir, "cache_index.json");
    if (fs.existsSync(indexPath)) {
      const entries: UnitCacheEntry[] = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      for (const entry of entries) {
        cache.set(entry.cache_key, entry);
      }
    }
  } catch {
  }

  const parentDir = path.dirname(runDir);
  if (fs.existsSync(parentDir)) {
    try {
      const dirs = fs.readdirSync(parentDir)
        .filter(d => d.startsWith("RUN-") && d !== path.basename(runDir))
        .sort()
        .reverse()
        .slice(0, 3);

      for (const dir of dirs) {
        const prevCachePath = path.join(parentDir, dir, "build", "unit_cache", "cache_index.json");
        if (fs.existsSync(prevCachePath)) {
          try {
            const entries: UnitCacheEntry[] = JSON.parse(fs.readFileSync(prevCachePath, "utf-8"));
            for (const entry of entries) {
              if (!cache.has(entry.cache_key)) {
                cache.set(entry.cache_key, entry);
              }
            }
          } catch {
          }
        }
      }
    } catch {
    }
  }

  return cache;
}

function saveUnitCache(runDir: string, entries: UnitCacheEntry[]): void {
  const cacheDir = path.join(runDir, "build", "unit_cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(path.join(cacheDir, "cache_index.json"), JSON.stringify(entries, null, 2));
}

function canUseDeterministic(file: BlueprintFileEntry): boolean {
  if (file.generation_method !== "deterministic") return false;
  return QUALITY_DETERMINISTIC_ROLES.has(file.role);
}

async function generateFile(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget, model?: string, signal?: AbortSignal): Promise<string | null> {
  if (file.generationMethod === "deterministic") {
    return generateDeterministic(ctx, slice, file);
  }
  return generateWithAI(ctx, slice, file, model, signal);
}

async function generateWithAI(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget, model?: string, signal?: AbortSignal): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(ctx, slice, file);
  const userPrompt = buildUserPrompt(ctx, slice, file);
  const maxTokens = COMPLEX_ROLES.has(file.role) ? 8192 : 6144;

  console.log(`    [BUILD-AI] Calling LLM for ${file.relativePath} (role=${file.role}, maxTokens=${maxTokens}${model ? `, model=${model}` : ""})...`);
  const result = await generateCode(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens,
    `BUILD_${slice.sliceId}`,
    model,
    signal,
  );

  if (!result) {
    console.log(`    [BUILD-AI] LLM returned empty for ${file.relativePath}`);
    return null;
  }
  const code = extractCodeBlock(result);
  console.log(`    [BUILD-AI] LLM response received for ${file.relativePath} (${code.length} chars)`);
  return code;
}

async function generateUnit(
  unit: BuildUnit,
  strategy: GenerationStrategy,
  capsule: ContextCapsule | undefined,
  frozenSystemPrompt: string,
  ctx: KitContext,
  plan: BuildPlan,
  fileInventory: BlueprintFileEntry[],
  paths: WorkspacePaths,
  allUnits?: BuildUnit[],
  scopedManifestOverride?: string,
  signal?: AbortSignal,
): Promise<UnitGenerationResult> {
  const inventoryPaths = new Set(fileInventory.map(f => f.path));
  const fileMap = new Map<string, BlueprintFileEntry>();
  for (const f of fileInventory) fileMap.set(f.file_id, f);

  const unitFiles = unit.file_ids
    .map(id => fileMap.get(id))
    .filter(Boolean) as BlueprintFileEntry[];

  const result: UnitGenerationResult = {
    unit_id: unit.id,
    files_produced: [],
    tokens_used: 0,
    model_used: "none",
    success: true,
    structural_violations: [],
  };

  if (strategy.generation_mode === "deterministic" || strategy.generation_mode === "template") {
    for (const entry of unitFiles) {
      const buildFileTarget: BuildFileTarget = {
        relativePath: entry.path,
        role: entry.role,
        sourceRef: entry.source_refs[0],
        generationMethod: "deterministic",
        status: "pending",
      };
      const dummySlice: BuildSlice = {
        sliceId: unit.id,
        name: unit.name,
        order: 0,
        requiresAI: false,
        files: [],
        status: "in_progress",
      };
      const content = generateDeterministic(ctx, dummySlice, buildFileTarget);
      if (content !== null) {
        if (!inventoryPaths.has(entry.path)) {
          result.structural_violations.push(`Rejected path not in inventory: ${entry.path}`);
        } else {
          result.files_produced.push({ path: entry.path, content });
        }
      }
    }
    result.model_used = "none";
    return result;
  }

  const deterministicFiles: BlueprintFileEntry[] = [];
  const aiFiles: BlueprintFileEntry[] = [];
  const trivialAiFiles: BlueprintFileEntry[] = [];

  for (const entry of unitFiles) {
    if (canUseDeterministic(entry)) {
      deterministicFiles.push(entry);
    } else if (TRIVIAL_AI_ROLES.has(entry.role)) {
      trivialAiFiles.push(entry);
    } else {
      aiFiles.push(entry);
    }
  }

  if (deterministicFiles.length > 0) {
    console.log(`    [BUILD-UNIT] ${deterministicFiles.length} files handled deterministically in ${unit.name}`);
    for (const entry of deterministicFiles) {
      const buildFileTarget: BuildFileTarget = {
        relativePath: entry.path,
        role: entry.role,
        sourceRef: entry.source_refs[0],
        generationMethod: "deterministic",
        status: "pending",
      };
      const dummySlice: BuildSlice = {
        sliceId: unit.id,
        name: unit.name,
        order: 0,
        requiresAI: false,
        files: [],
        status: "in_progress",
      };
      const content = generateDeterministic(ctx, dummySlice, buildFileTarget);
      if (content !== null) {
        if (!inventoryPaths.has(entry.path)) {
          result.structural_violations.push(`Rejected path not in inventory: ${entry.path}`);
        } else {
          result.files_produced.push({ path: entry.path, content });
        }
      }
    }
  }

  if (trivialAiFiles.length > 0) {
    console.log(`    [BUILD-UNIT] ${trivialAiFiles.length} trivial files routed to Haiku in ${unit.name}`);
    for (const entry of trivialAiFiles) {
      const buildFileTarget: BuildFileTarget = {
        relativePath: entry.path,
        role: entry.role,
        sourceRef: entry.source_refs[0],
        generationMethod: entry.generation_method,
        status: "pending",
      };
      const dummySlice: BuildSlice = {
        sliceId: unit.id,
        name: unit.name,
        order: 0,
        requiresAI: true,
        files: [],
        status: "in_progress",
      };
      try {
        const content = await generateFile(ctx, dummySlice, buildFileTarget, "claude-haiku-4-5", signal);
        if (content !== null) {
          result.files_produced.push({ path: entry.path, content });
        }
      } catch (err: any) {
        console.log(`    [BUILD-UNIT] Trivial file ${entry.path} failed: ${err.message}`);
        result.success = false;
      }
    }
  }

  if (aiFiles.length === 0) {
    result.model_used = deterministicFiles.length > 0 ? "deterministic+haiku" : "none";
    return result;
  }

  const modelName = resolveModelForStrategy(strategy);
  result.model_used = modelName;

  const fileTargets = aiFiles.map(f => `- ${f.path} (role: ${f.role})`).join("\n");

  let capsuleContext = "";
  if (capsule) {
    if (capsule.entity_slice) {
      capsuleContext += `\nEntity: ${capsule.entity_slice.name}\nFields: ${capsule.entity_slice.fields.join(", ")}\nRelationships: ${capsule.entity_slice.relationships.join(", ")}`;
    }
    if (capsule.endpoint_slice) {
      capsuleContext += `\nEndpoint: ${capsule.endpoint_slice.method} ${capsule.endpoint_slice.path}`;
    }
    if (capsule.auth_slice) {
      capsuleContext += `\nAuth required: ${capsule.auth_slice.auth_required}`;
      if (capsule.auth_slice.roles) capsuleContext += ` Roles: ${capsule.auth_slice.roles.join(", ")}`;
    }
    if (capsule.requirements_summary) {
      capsuleContext += `\n${capsule.requirements_summary}`;
    }
    if (capsule.fields_summary) {
      capsuleContext += `\n${capsule.fields_summary}`;
    }
  }

  const designDirective = buildDesignDirective(ctx);

  const scopedManifest = scopedManifestOverride ??
    (allUnits ? buildScopedManifest(unit, allUnits, fileInventory, ctx) : null);
  const manifestSection = scopedManifest
    ? `\nFILE MANIFEST (relevant files for imports):\n${scopedManifest}`
    : "";

  const userPrompt = `Generate the following files for unit "${unit.name}" (${unit.unit_type}):

${fileTargets}

CONTEXT:${capsuleContext}
${designDirective}
${manifestSection}

Features: ${ctx.features.map(f => `${f.feature_id}: ${f.name}`).join(", ")}
Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}`).join(", ")}

OUTPUT FORMAT: For each file, output exactly:
===FILE: <path>===
<file content>

Generate all ${aiFiles.length} files. Each file must be complete, production-quality code.`;

  const maxTokens = Math.min(aiFiles.length * 4096, 64000);
  console.log(`    [BUILD-UNIT] Calling ${modelName} for unit ${unit.name} (${aiFiles.length} AI files, ${deterministicFiles.length} deterministic, ${trivialAiFiles.length} trivial, maxTokens=${maxTokens})...`);

  const rawResult = await generateCode(
    [
      { role: "system", content: frozenSystemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens,
    `BUILD_UNIT_${unit.id}`,
    modelName,
    signal,
  );

  if (!rawResult) {
    console.log(`    [BUILD-UNIT] LLM returned empty for unit ${unit.name}, falling back to file-by-file`);
    return await generateUnitFileByFile(unit, aiFiles, ctx, plan, paths, inventoryPaths, modelName, result, signal);
  }

  const parsed = parseMultiFileOutput(rawResult);

  if (!parsed || parsed.length === 0) {
    console.log(`    [BUILD-UNIT] Multi-file parsing failed for unit ${unit.name}, falling back to file-by-file`);
    return await generateUnitFileByFile(unit, aiFiles, ctx, plan, paths, inventoryPaths, modelName, result, signal);
  }

  console.log(`    [BUILD-UNIT] Parsed ${parsed.length}/${aiFiles.length} AI files from unit response`);

  const producedPaths = new Set<string>();
  for (const produced of parsed) {
    if (!inventoryPaths.has(produced.path)) {
      result.structural_violations.push(`Rejected invented path: ${produced.path}`);
      console.log(`    [BUILD-UNIT] STRUCTURAL VIOLATION: ${produced.path} not in inventory`);
      continue;
    }
    producedPaths.add(produced.path);
    result.files_produced.push(produced);
  }

  const missingFiles = aiFiles.filter(f => !producedPaths.has(f.path));
  if (missingFiles.length > 0) {
    console.log(`    [BUILD-UNIT] ${missingFiles.length} files missing from unit response, generating individually`);
    for (const missing of missingFiles) {
      const buildFileTarget: BuildFileTarget = {
        relativePath: missing.path,
        role: missing.role,
        sourceRef: missing.source_refs[0],
        generationMethod: missing.generation_method,
        status: "pending",
      };
      const dummySlice: BuildSlice = {
        sliceId: unit.id,
        name: unit.name,
        order: 0,
        requiresAI: true,
        files: [],
        status: "in_progress",
      };
      try {
        const content = await generateFile(ctx, dummySlice, buildFileTarget, modelName, signal);
        if (content !== null) {
          result.files_produced.push({ path: missing.path, content });
        }
      } catch (err: any) {
        console.log(`    [BUILD-UNIT] Missing file ${missing.path} fallback failed: ${err.message}`);
        result.success = false;
      }
    }
  }

  return result;
}

async function generateUnitFileByFile(
  unit: BuildUnit,
  unitFiles: BlueprintFileEntry[],
  ctx: KitContext,
  _plan: BuildPlan,
  _paths: WorkspacePaths,
  inventoryPaths: Set<string>,
  modelName: string,
  result: UnitGenerationResult,
  signal?: AbortSignal,
): Promise<UnitGenerationResult> {
  result.model_used = modelName;
  for (const entry of unitFiles) {
    const buildFileTarget: BuildFileTarget = {
      relativePath: entry.path,
      role: entry.role,
      sourceRef: entry.source_refs[0],
      generationMethod: entry.generation_method,
      status: "pending",
    };
    const dummySlice: BuildSlice = {
      sliceId: unit.id,
      name: unit.name,
      order: 0,
      requiresAI: entry.generation_method === "ai_assisted",
      files: [],
      status: "in_progress",
    };
    try {
      const content = await generateFile(ctx, dummySlice, buildFileTarget, modelName, signal);
      if (content !== null) {
        if (!inventoryPaths.has(entry.path)) {
          result.structural_violations.push(`Rejected path not in inventory: ${entry.path}`);
        } else {
          result.files_produced.push({ path: entry.path, content });
        }
      } else {
        result.success = false;
      }
    } catch (err: any) {
      console.log(`    [BUILD-UNIT] File-by-file ${entry.path} failed: ${err.message}`);
      result.success = false;
    }
  }
  return result;
}

export async function generateRepo(
  runDir: string,
  plan: BuildPlan,
  paths: WorkspacePaths,
  onProgress?: ProgressCallback,
  strategyPlan?: GenerationStrategyPlan,
  signal?: AbortSignal,
): Promise<{ success: boolean; filesGenerated: number; filesFailed: number; errors: string[]; unitResults?: UnitGenerationResult[] }> {
  const ctx = loadKitContext(runDir, plan);

  if (!strategyPlan) {
    throw new Error("GSE strategy plan is required — legacy file-centric generation has been removed");
  }

  return generateRepoUnitCentric(runDir, plan, paths, ctx, strategyPlan, onProgress, signal);
}

async function generateRepoUnitCentric(
  runDir: string,
  plan: BuildPlan,
  paths: WorkspacePaths,
  ctx: KitContext,
  gsePlan: GenerationStrategyPlan,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<{ success: boolean; filesGenerated: number; filesFailed: number; errors: string[]; unitResults: UnitGenerationResult[] }> {
  const hasAIUnits = gsePlan.strategies.some(s => s.generation_mode !== "deterministic" && s.generation_mode !== "template");
  if (hasAIUnits) {
    const preflightClient = await getClient();
    if (!preflightClient) {
      console.error("  [BUILD-UNIT] FATAL: No API client available — aborting generation (AI units require API access)");
      const aiFileCount = gsePlan.build_units
        .filter(u => { const s = gsePlan.strategies.find(st => st.build_unit_id === u.id); return s && s.generation_mode !== "deterministic" && s.generation_mode !== "template"; })
        .reduce((sum, u) => sum + u.file_ids.length, 0);
      return { success: false, filesGenerated: 0, filesFailed: aiFileCount, errors: ["API client not available — check API key configuration"], unitResults: [] };
    }
    console.log("  [BUILD-UNIT] API client preflight check passed");
  } else {
    console.log("  [BUILD-UNIT] All units are deterministic/template — skipping API preflight");
  }

  const frozenSystemPrompt = buildFrozenSystemPrompt(ctx);
  console.log(`  [BUILD-UNIT] Frozen system prompt built (${frozenSystemPrompt.length} chars)`);
  console.log(`  [BUILD-UNIT] Parallel concurrency: ${BUILD_CONCURRENCY}`);

  const fileInventory: BlueprintFileEntry[] = [];
  const blueprintPath = path.join(runDir, "build", "repo_blueprint.json");
  try {
    const bp = JSON.parse(fs.readFileSync(blueprintPath, "utf-8"));
    fileInventory.push(...(bp.file_inventory ?? []));
  } catch {
    for (const slice of plan.slices) {
      for (const f of slice.files) {
        fileInventory.push({
          file_id: f.relativePath,
          path: f.relativePath,
          role: f.role,
          layer: "frontend",
          module_ref: "",
          subsystem_ref: "",
          generation_method: f.generationMethod,
          source_refs: f.sourceRef ? [f.sourceRef] : [],
          trace_refs: f.traceRef ? [f.traceRef] : [],
          description: "",
        });
      }
    }
  }

  const strategyMap = new Map<string, GenerationStrategy>();
  for (const s of gsePlan.strategies) strategyMap.set(s.build_unit_id, s);

  let filesGenerated = 0;
  let filesFailed = 0;
  const errors: string[] = [];
  const unitResults: UnitGenerationResult[] = [];
  let totalProcessed = 0;

  const unitCache = loadUnitCache(runDir);
  const newCacheEntries: UnitCacheEntry[] = [];
  let cacheHits = 0;

  if (unitCache.size > 0) {
    console.log(`  [BUILD-UNIT] Loaded ${unitCache.size} cache entries from previous runs`);
  }

  const pLimitMod = await import("p-limit") as any;
  const pLimit = pLimitMod.default ?? pLimitMod;
  const limit = pLimit(BUILD_CONCURRENCY);

  for (const wave of gsePlan.wave_plan.waves) {
    if (signal?.aborted) {
      console.log(`  [BUILD-UNIT] Aborted before wave ${wave.wave_id}`);
      errors.push("Build aborted");
      break;
    }

    const waveStart = Date.now();
    console.log(`  [BUILD-UNIT] Wave ${wave.wave_id} (${wave.unit_ids.length} units, concurrency=${BUILD_CONCURRENCY}, apiTimeout=${API_CALL_TIMEOUT_MS}ms, unitTimeout=${UNIT_TIMEOUT_MS}ms)`);

    const waveUnits: Array<{ unit: BuildUnit; strategy: GenerationStrategy }> = [];
    for (const unitId of wave.unit_ids) {
      const unit = gsePlan.build_units.find(u => u.id === unitId);
      if (!unit) continue;
      const strategy = strategyMap.get(unitId);
      if (!strategy) continue;
      waveUnits.push({ unit, strategy });
    }

    const wavePromises = waveUnits.map(({ unit, strategy }) =>
      limit(async () => {
        const scopedManifest = buildScopedManifest(unit, gsePlan.build_units, fileInventory, ctx);
        const cacheKey = computeUnitCacheKey(unit, strategy, unit.context_capsule, scopedManifest, frozenSystemPrompt);

        const cached = unitCache.get(cacheKey);
        if (cached) {
          console.log(`  [BUILD-UNIT] CACHE HIT: ${unit.name} (key=${cacheKey})`);
          cacheHits++;
          return {
            unit,
            unitResult: {
              unit_id: unit.id,
              files_produced: cached.files_produced,
              tokens_used: 0,
              model_used: `cached:${cached.model_used}`,
              success: true,
              structural_violations: [],
            } as UnitGenerationResult,
            cacheKey,
            fromCache: true,
          };
        }

        console.log(`  [BUILD-UNIT] Unit: ${unit.name} (${unit.unit_type}, ${strategy.generation_mode}, ${unit.file_ids.length} files)`);
        const unitStart = Date.now();

        const unitResult = await withTimeout(
          generateUnit(
            unit,
            strategy,
            unit.context_capsule,
            frozenSystemPrompt,
            ctx,
            plan,
            fileInventory,
            paths,
            gsePlan.build_units,
            scopedManifest,
            signal,
          ),
          UNIT_TIMEOUT_MS,
          `unit:${unit.name}`,
          signal,
        ).catch((err: any) => {
          console.log(`  [BUILD-UNIT] Unit ${unit.name} failed after ${((Date.now() - unitStart) / 1000).toFixed(1)}s: ${err.message}`);
          return {
            unit_id: unit.id,
            files_produced: [],
            tokens_used: 0,
            model_used: "failed",
            success: false,
            structural_violations: [`Unit timed out or failed: ${err.message}`],
          } as UnitGenerationResult;
        });

        const elapsed = ((Date.now() - unitStart) / 1000).toFixed(1);
        console.log(`  [BUILD-UNIT] Unit ${unit.name} completed in ${elapsed}s (${unitResult.files_produced.length} files)`);

        return { unit, unitResult, cacheKey, fromCache: false };
      })
    );

    const waveResults = await Promise.allSettled(wavePromises);

    for (const settled of waveResults) {
      if (settled.status === "rejected") {
        filesFailed++;
        errors.push(`Unit execution failed: ${settled.reason}`);
        continue;
      }

      const { unit, unitResult, cacheKey, fromCache } = settled.value;
      unitResults.push(unitResult);

      if (!fromCache && unitResult.success && unitResult.files_produced.length > 0) {
        newCacheEntries.push({
          cache_key: cacheKey,
          unit_id: unit.id,
          files_produced: unitResult.files_produced,
          model_used: unitResult.model_used,
          timestamp: new Date().toISOString(),
        });
      }

      for (const produced of unitResult.files_produced) {
        try {
          writeRepoFile(paths, produced.path, produced.content);
          filesGenerated++;
          totalProcessed++;

          const sliceFile = plan.slices.flatMap(s => s.files).find(f => f.relativePath === produced.path);
          if (sliceFile) {
            sliceFile.status = "generated";
            sliceFile.sizeBytes = Buffer.byteLength(produced.content, "utf-8");
          }

          onProgress?.({
            sliceId: unit.id,
            sliceName: unit.name,
            fileIndex: totalProcessed,
            totalFiles: plan.totalFiles,
            filePath: produced.path,
            status: "generated",
          });
        } catch (err: any) {
          filesFailed++;
          errors.push(`Error writing ${produced.path}: ${err.message}`);
        }
      }

      const expectedCount = unit.file_ids.length;
      const producedCount = unitResult.files_produced.length;
      if (producedCount < expectedCount) {
        const missing = expectedCount - producedCount;
        filesFailed += missing;
        errors.push(`Unit ${unit.name}: ${missing} files not produced`);
      }

      if (unitResult.structural_violations.length > 0) {
        console.log(`  [BUILD-UNIT] ${unitResult.structural_violations.length} structural violations in ${unit.name}`);
        for (const v of unitResult.structural_violations) {
          errors.push(`STRUCTURAL: ${v}`);
        }
      }
    }

    const waveElapsed = ((Date.now() - waveStart) / 1000).toFixed(1);
    console.log(`  [BUILD-UNIT] Wave ${wave.wave_id} completed in ${waveElapsed}s (${filesGenerated} total files so far)`);

    for (const slice of plan.slices) {
      if (slice.status === "completed" || slice.status === "failed") continue;
      const allDone = slice.files.every(f => f.status === "generated" || f.status === "skipped");
      if (allDone && slice.files.length > 0) {
        slice.status = "completed";
        slice.completedAt = new Date().toISOString();
        console.log(`  [BUILD-UNIT] Slice completed: ${slice.name}`);
      }
    }
  }

  if (newCacheEntries.length > 0) {
    saveUnitCache(runDir, newCacheEntries);
    console.log(`  [BUILD-UNIT] Saved ${newCacheEntries.length} cache entries for future builds`);
  }

  const aborted = signal?.aborted ?? false;
  console.log(`  [BUILD-UNIT] Unit-centric generation complete: ${filesGenerated} generated, ${filesFailed} failed, ${cacheHits} cache hits${aborted ? " (ABORTED)" : ""}`);
  return { success: !aborted && filesFailed === 0 && errors.length === 0, filesGenerated, filesFailed, errors, unitResults };
}

export async function fixUnitsFromFindings(
  repoDir: string,
  buildDir: string,
  gsePlan: GenerationStrategyPlan,
  unitIds: string[],
  fileRemediationContext: Map<string, RemediationFileContext[]>,
  onProgress?: ProgressCallback,
): Promise<{ success: boolean; filesFixed: number; filesUnchanged: number; filesFailed: number; errors: string[]; unitResults: FixUnitResult[]; backupDir?: string }> {
  return _fixUnitsFromFindings(repoDir, buildDir, gsePlan, unitIds, fileRemediationContext, generateCode, onProgress);
}
