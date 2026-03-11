import * as fs from "fs";
import * as path from "path";
import { recordUsage } from "../usage/tracker.js";
import type {
  BuildPlan, BuildSlice, BuildFileTarget, StackProfile,
  GenerationStrategyPlan, BuildUnit, GenerationStrategy, ContextCapsule,
  UnitGenerationResult, BlueprintFileEntry,
} from "./types.js";
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

async function generateCode(messages: OpenAIMessage[], maxTokens = 4096, stage = "BUILD", model = "gpt-4o"): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      max_completion_tokens: maxTokens,
    });
    const usage = (response as any).usage;
    if (usage) {
      recordUsage({
        stage,
        model,
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
      });
    }
    return response.choices[0]?.message?.content ?? null;
  } catch (err: any) {
    console.log(`  [BUILD] AI call failed (${model}): ${err.message ?? err}`);
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

function buildFrozenSystemPrompt(ctx: KitContext): string {
  const lang = ctx.stackProfile.language === "typescript" ? "TypeScript" : "JavaScript";
  const framework = ctx.stackProfile.framework;

  const availablePackages = [
    "react", "react-dom", "react-router-dom",
    "zod", "@tanstack/react-query", "clsx",
    "axios", "lucide-react", "date-fns", "react-hook-form",
  ];
  if (ctx.stackProfile.cssFramework?.includes("tailwind")) availablePackages.push("tailwindcss");

  const overview = extractProjectOverview(ctx);
  let projectIdentity = `Project: ${ctx.projectName}`;
  if (overview) projectIdentity += `\nOverview: ${overview}`;

  return `You are a code generator for the Axion Build System. You generate production-quality ${lang} code for a ${framework} application.

${projectIdentity}

CRITICAL RULES:
- Generate ONLY raw file content. No markdown fences. No explanations.
- Stack: ${framework}, ${lang}, ${ctx.stackProfile.runtime}
- Use provided API contracts, data models, and specs as source of truth
- Do NOT invent features, routes, or entities not in the spec
- ONLY import from AVAILABLE PACKAGES below
- All page/component files use default exports
- Use clean, idiomatic code with proper error handling
- BrowserRouter is in src/main.tsx. Do NOT import or use BrowserRouter in any component.
- Missing info placeholder: "// TODO: [AXION] Requires spec clarification"

AVAILABLE PACKAGES: ${availablePackages.join(", ")}

AUTH: AuthProvider & useAuthContext from src/lib/auth/AuthContext, ProtectedRoute from src/lib/auth/ProtectedRoute
VALIDATION: zod for schemas (import { z } from "zod")`;
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
  if (strategy.model_tier === "mini") return "gpt-4o-mini";
  if (strategy.model_tier === "full") return "gpt-4o";
  return "gpt-4o";
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

  const modelName = resolveModelForStrategy(strategy);
  result.model_used = modelName;

  const fileTargets = unitFiles.map(f => `- ${f.path} (role: ${f.role})`).join("\n");

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

  const userPrompt = `Generate the following files for unit "${unit.name}" (${unit.unit_type}):

${fileTargets}

CONTEXT:${capsuleContext}
${designDirective}

Features: ${ctx.features.map(f => `${f.feature_id}: ${f.name}`).join(", ")}
Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}`).join(", ")}

OUTPUT FORMAT: For each file, output exactly:
===FILE: <path>===
<file content>

Generate all ${unitFiles.length} files. Each file must be complete, production-quality code.`;

  const maxTokens = Math.min(unitFiles.length * 4096, 16384);
  console.log(`    [BUILD-UNIT] Calling ${modelName} for unit ${unit.name} (${unitFiles.length} files, maxTokens=${maxTokens})...`);

  const rawResult = await generateCode(
    [
      { role: "system", content: frozenSystemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens,
    `BUILD_UNIT_${unit.id}`,
    modelName,
  );

  if (!rawResult) {
    console.log(`    [BUILD-UNIT] LLM returned empty for unit ${unit.name}, falling back to file-by-file`);
    return await generateUnitFileByFile(unit, unitFiles, ctx, plan, paths, inventoryPaths, modelName, result);
  }

  const parsed = parseMultiFileOutput(rawResult);

  if (!parsed || parsed.length === 0) {
    console.log(`    [BUILD-UNIT] Multi-file parsing failed for unit ${unit.name}, falling back to file-by-file`);
    return await generateUnitFileByFile(unit, unitFiles, ctx, plan, paths, inventoryPaths, modelName, result);
  }

  console.log(`    [BUILD-UNIT] Parsed ${parsed.length}/${unitFiles.length} files from unit response`);

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

  const missingFiles = unitFiles.filter(f => !producedPaths.has(f.path));
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
        const content = await generateFile(ctx, dummySlice, buildFileTarget, modelName);
        if (content !== null) {
          result.files_produced.push({ path: missing.path, content });
        }
      } catch {
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
      const content = await generateFile(ctx, dummySlice, buildFileTarget, modelName);
      if (content !== null) {
        if (!inventoryPaths.has(entry.path)) {
          result.structural_violations.push(`Rejected path not in inventory: ${entry.path}`);
        } else {
          result.files_produced.push({ path: entry.path, content });
        }
      } else {
        result.success = false;
      }
    } catch {
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
): Promise<{ success: boolean; filesGenerated: number; filesFailed: number; errors: string[]; unitResults?: UnitGenerationResult[] }> {
  const ctx = loadKitContext(runDir, plan);

  if (strategyPlan) {
    return generateRepoUnitCentric(runDir, plan, paths, ctx, strategyPlan, onProgress);
  }

  return generateRepoFileCentric(plan, paths, ctx, onProgress);
}

async function generateRepoFileCentric(
  plan: BuildPlan,
  paths: WorkspacePaths,
  ctx: KitContext,
  onProgress?: ProgressCallback,
): Promise<{ success: boolean; filesGenerated: number; filesFailed: number; errors: string[] }> {
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

async function generateRepoUnitCentric(
  runDir: string,
  plan: BuildPlan,
  paths: WorkspacePaths,
  ctx: KitContext,
  gsePlan: GenerationStrategyPlan,
  onProgress?: ProgressCallback,
): Promise<{ success: boolean; filesGenerated: number; filesFailed: number; errors: string[]; unitResults: UnitGenerationResult[] }> {
  const frozenSystemPrompt = buildFrozenSystemPrompt(ctx);
  console.log(`  [BUILD-UNIT] Frozen system prompt built (${frozenSystemPrompt.length} chars)`);

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

  for (const wave of gsePlan.wave_plan.waves) {
    console.log(`  [BUILD-UNIT] Wave ${wave.wave_id} (${wave.unit_ids.length} units)`);

    for (const unitId of wave.unit_ids) {
      const unit = gsePlan.build_units.find(u => u.id === unitId);
      if (!unit) continue;

      const strategy = strategyMap.get(unitId);
      if (!strategy) continue;

      console.log(`  [BUILD-UNIT] Unit: ${unit.name} (${unit.unit_type}, ${strategy.generation_mode}, ${unit.file_ids.length} files)`);

      const unitResult = await generateUnit(
        unit,
        strategy,
        unit.context_capsule,
        frozenSystemPrompt,
        ctx,
        plan,
        fileInventory,
        paths,
      );

      unitResults.push(unitResult);

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
  }

  console.log(`  [BUILD-UNIT] Unit-centric generation complete: ${filesGenerated} generated, ${filesFailed} failed`);
  return { success: filesFailed === 0, filesGenerated, filesFailed, errors, unitResults };
}

export interface RemediationFileContext {
  findingTitle: string;
  findingDescription: string;
  remediationGuidance: string;
  severity: string;
}

export interface FixFileResult {
  filePath: string;
  status: "fixed" | "unchanged" | "failed";
  beforeHash: string;
  afterHash: string;
  findingsAddressed: string[];
  error?: string;
}

export interface FixUnitResult {
  unitId: string;
  unitName: string;
  files: FixFileResult[];
  success: boolean;
}

function computeSimpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

async function fixFileFromFindings(
  existingContent: string,
  filePath: string,
  findings: RemediationFileContext[],
  model: string = "gpt-4o",
): Promise<string | null> {
  const findingsBlock = findings.map((f, i) =>
    `  ${i + 1}. [${f.severity.toUpperCase()}] ${f.findingTitle}\n     Description: ${f.findingDescription}\n     Fix guidance: ${f.remediationGuidance}`
  ).join("\n\n");

  const systemPrompt = `You are a senior software engineer performing targeted code remediation. You will receive an existing source file and a list of specific issues found by automated certification analysis (AVCS). Your job is to fix ONLY the identified issues while preserving all existing functionality, architecture, and coding patterns.

RULES:
- Output ONLY the complete fixed file content — no explanations, no markdown fences, no comments about changes
- Fix every listed finding
- Do NOT add new features, refactor unrelated code, or change the file's purpose
- Preserve all imports, exports, types, and function signatures unless a finding specifically requires changing them
- Preserve code style, formatting conventions, and naming patterns
- If a finding asks to remove something (e.g., hardcoded secrets, eval), replace it with the correct pattern (e.g., environment variable, safe alternative)
- The output must be a complete, valid, drop-in replacement for the original file`;

  const userPrompt = `FILE: ${filePath}

FINDINGS TO FIX:
${findingsBlock}

EXISTING FILE CONTENT:
${existingContent}

Output the complete fixed file:`;

  const maxTokens = Math.min(Math.max(existingContent.split("\n").length * 20, 4096), 16384);
  const result = await generateCode(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens,
    "REMEDIATION_FIX",
    model,
  );

  if (!result) return null;
  return extractCodeBlock(result);
}

export async function fixUnitsFromFindings(
  repoDir: string,
  buildDir: string,
  gsePlan: GenerationStrategyPlan,
  unitIds: string[],
  fileRemediationContext: Map<string, RemediationFileContext[]>,
  onProgress?: ProgressCallback,
): Promise<{ success: boolean; filesFixed: number; filesUnchanged: number; filesFailed: number; errors: string[]; unitResults: FixUnitResult[] }> {
  const unitIdSet = new Set(unitIds);
  const strategyMap = new Map<string, GenerationStrategy>();
  for (const s of gsePlan.strategies) strategyMap.set(s.build_unit_id, s);

  const fileIdToPath = new Map<string, string>();
  const blueprintPath = path.join(buildDir, "repo_blueprint.json");
  try {
    const bp = JSON.parse(fs.readFileSync(blueprintPath, "utf-8"));
    for (const entry of (bp.file_inventory ?? [])) {
      fileIdToPath.set(entry.file_id, entry.path);
    }
    console.log(`  [BA-REMEDIATION] Loaded blueprint: ${fileIdToPath.size} file_id → path mappings`);
  } catch {
    console.log(`  [BA-REMEDIATION] Warning: Could not load blueprint, falling back to file_id as path`);
    for (const unit of gsePlan.build_units) {
      for (const fid of unit.file_ids) {
        fileIdToPath.set(fid, fid);
      }
    }
  }

  const resolvedRepoDir = path.resolve(repoDir);

  let filesFixed = 0;
  let filesUnchanged = 0;
  let filesFailed = 0;
  const errors: string[] = [];
  const unitResults: FixUnitResult[] = [];
  let totalProcessed = 0;

  let unitsToProcess = gsePlan.build_units.filter(u => unitIdSet.has(u.id));

  if (unitsToProcess.length === 0 && fileRemediationContext.size > 0) {
    console.log(`  [BA-REMEDIATION] No GSE build units matched — constructing synthetic units from affected files`);

    const filesByUnit = new Map<string, string[]>();
    for (const filePath of fileRemediationContext.keys()) {
      let assignedUnit: string | null = null;
      for (const uid of unitIds) {
        if (!filesByUnit.has(uid)) filesByUnit.set(uid, []);
      }
      for (const uid of unitIds) {
        assignedUnit = uid;
        break;
      }
      if (!assignedUnit) assignedUnit = "remediation-direct-files";
      const existing = filesByUnit.get(assignedUnit) || [];
      existing.push(filePath);
      filesByUnit.set(assignedUnit, existing);
    }

    for (const [unitId, filePaths] of filesByUnit) {
      if (filePaths.length === 0) continue;
      unitsToProcess.push({
        id: unitId,
        unit_type: "remediation" as any,
        name: `Remediation: ${unitId}`,
        file_ids: filePaths,
        dependency_unit_ids: [],
        source_refs: [],
        context_capsule: undefined as any,
      });
      for (const fp of filePaths) {
        fileIdToPath.set(fp, fp);
      }
    }
  }

  const totalFiles = unitsToProcess.reduce((sum, u) => sum + u.file_ids.length, 0);
  console.log(`  [BA-REMEDIATION] Processing ${unitsToProcess.length} units (${totalFiles} files) for targeted fix`);

  for (const unit of unitsToProcess) {
    const strategy = strategyMap.get(unit.id);
    const modelName = strategy
      ? (strategy.model_tier === "mini" ? "gpt-4o-mini" : "gpt-4o")
      : "gpt-4o";

    const unitResult: FixUnitResult = {
      unitId: unit.id,
      unitName: unit.name,
      files: [],
      success: true,
    };

    console.log(`  [BA-REMEDIATION] Unit: ${unit.name} (${unit.file_ids.length} files)`);

    for (const fileId of unit.file_ids) {
      const filePath = fileIdToPath.get(fileId) || fileId;
      const fullPath = path.resolve(repoDir, filePath);
      totalProcessed++;

      if (!fullPath.startsWith(resolvedRepoDir + path.sep) && fullPath !== resolvedRepoDir) {
        unitResult.files.push({
          filePath,
          status: "failed",
          beforeHash: "",
          afterHash: "",
          findingsAddressed: [],
          error: "Path traversal rejected — target escapes repo directory",
        });
        filesFailed++;
        errors.push(`Path traversal blocked for ${filePath}`);
        unitResult.success = false;
        continue;
      }

      const findings = fileRemediationContext.get(filePath);
      if (!findings || findings.length === 0) {
        unitResult.files.push({
          filePath,
          status: "unchanged",
          beforeHash: "",
          afterHash: "",
          findingsAddressed: [],
        });
        filesUnchanged++;
        continue;
      }

      let existingContent: string;
      try {
        existingContent = fs.readFileSync(fullPath, "utf-8");
      } catch {
        unitResult.files.push({
          filePath,
          status: "failed",
          beforeHash: "",
          afterHash: "",
          findingsAddressed: findings.map(f => f.findingTitle),
          error: "File not found on disk — cannot fix nonexistent file",
        });
        filesFailed++;
        errors.push(`Cannot read ${filePath} for fixing — file not found`);
        unitResult.success = false;
        continue;
      }

      const beforeHash = computeSimpleHash(existingContent);
      console.log(`    [BA-FIX] Fixing ${filePath} (${findings.length} findings, ${existingContent.split("\n").length} lines)`);

      try {
        const fixedContent = await fixFileFromFindings(existingContent, filePath, findings, modelName);

        if (!fixedContent) {
          unitResult.files.push({
            filePath,
            status: "failed",
            beforeHash,
            afterHash: beforeHash,
            findingsAddressed: findings.map(f => f.findingTitle),
            error: "LLM returned empty result",
          });
          filesFailed++;
          errors.push(`Fix failed for ${filePath}: LLM returned empty`);
          unitResult.success = false;
          continue;
        }

        const afterHash = computeSimpleHash(fixedContent);

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, fixedContent, "utf-8");

        unitResult.files.push({
          filePath,
          status: afterHash !== beforeHash ? "fixed" : "unchanged",
          beforeHash,
          afterHash,
          findingsAddressed: findings.map(f => f.findingTitle),
        });

        if (afterHash !== beforeHash) {
          filesFixed++;
          console.log(`    [BA-FIX] Fixed ${filePath} (hash ${beforeHash} → ${afterHash})`);
        } else {
          filesUnchanged++;
          console.log(`    [BA-FIX] ${filePath} unchanged after fix attempt`);
        }

        onProgress?.({
          sliceId: unit.id,
          sliceName: unit.name,
          fileIndex: totalProcessed,
          totalFiles,
          filePath,
          status: "generated",
        });
      } catch (err: any) {
        unitResult.files.push({
          filePath,
          status: "failed",
          beforeHash,
          afterHash: beforeHash,
          findingsAddressed: findings.map(f => f.findingTitle),
          error: err.message,
        });
        filesFailed++;
        errors.push(`Fix error for ${filePath}: ${err.message}`);
        unitResult.success = false;
      }
    }

    unitResults.push(unitResult);
  }

  console.log(`  [BA-REMEDIATION] Complete: ${filesFixed} fixed, ${filesUnchanged} unchanged, ${filesFailed} failed`);
  return { success: filesFailed === 0, filesFixed, filesUnchanged, filesFailed, errors, unitResults };
}

async function generateFile(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget, model?: string): Promise<string | null> {
  if (file.generationMethod === "deterministic") {
    return generateDeterministic(ctx, slice, file);
  }
  return generateWithAI(ctx, slice, file, model);
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

function genBarrelIndex(file: BuildFileTarget): string {
  const dir = path.dirname(file.relativePath);
  return `// Barrel index for ${dir}\n// Generated by Axion Build Mode\n// Re-export all modules from this directory\n// Source: ${file.sourceRef ?? "auto-generated"}\n\n// TODO: [AXION] Add re-exports as modules are implemented\n`;
}

const COMPLEX_ROLES = new Set([
  "feature_page", "auth_page", "app_entry", "layout_component",
  "feature_form", "feature_list", "feature_detail", "settings_page",
  "route_handler", "service_module", "middleware_handler",
  "entity_repository", "acceptance_test", "integration_test",
  "event_handler", "feature_card", "e2e_test", "feature_store",
  "entity_validator", "entity_mapper", "auth_policy",
  "contract_test", "test_mock", "api_binding", "audit_hook",
]);

async function generateWithAI(ctx: KitContext, slice: BuildSlice, file: BuildFileTarget, model?: string): Promise<string | null> {
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

  if (file.traceRef) {
    parts.push(`Requirement trace: ${file.traceRef}`);
    const traceFeature = ctx.features.find(f => f.feature_id === file.traceRef);
    if (traceFeature) {
      parts.push(`Traced requirement: ${traceFeature.name} — ${traceFeature.description}`);
    }
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
  } else if (role === "route_handler") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route", "handler", "REST"], 5000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model", "entity"], 3000));
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "permission", "middleware", "rate limit"], 2000));
    parts.push("\nGenerate an Express route handler with proper request validation, error handling, and response formatting.");
    parts.push("Use async/await, validate request body/params, return typed JSON responses, and wrap in try/catch with proper HTTP status codes.");
  } else if (role === "service_module") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["service", "business logic", "architecture"], 4000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model"], 3000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["service", "implementation", "business"], 3000));
    parts.push("\nGenerate a service module that encapsulates business logic. Export typed functions that interact with repositories/data layer.");
    parts.push("Use dependency injection where possible. Include proper error handling and input validation.");
  } else if (role === "middleware_handler") {
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "middleware", "permission", "rate limit", "CORS", "session"], 5000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["middleware", "interceptor", "pipeline"], 2000));
    parts.push("\nGenerate Express middleware with proper typing (Request, Response, NextFunction).");
    parts.push("Handle errors gracefully and call next() appropriately. Export as default or named function.");
  } else if (role === "entity_repository") {
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model", "schema", "database"], 5000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["repository", "data access", "ORM", "database"], 3000));
    parts.push("\nGenerate a repository module with CRUD operations for the entity.");
    parts.push("Use typed queries, return typed results, and handle database errors. Export named functions: findById, findAll, create, update, delete.");
  } else if (role === "acceptance_test" || role === "integration_test") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint"], 3000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "quality", "coverage", "assertion", "acceptance", "integration"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model"], 2000));
    if (feat) {
      parts.push(`\nWrite comprehensive ${role === "acceptance_test" ? "acceptance" : "integration"} tests for the ${feat.name} feature.`);
    }
    parts.push(`\nGenerate ${role === "acceptance_test" ? "acceptance" : "integration"} tests using vitest. Include setup/teardown, test data factories, happy path and error cases.`);
    parts.push("Use describe/it blocks with clear test names. Mock external dependencies where appropriate.");
  } else if (role === "event_handler") {
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["event", "handler", "pub/sub", "message"], 4000));
    parts.push("\n--- IMPLEMENTATION ---");
    parts.push(findRelevantDocs(ctx.implDocs, featureTerms.length > 0 ? featureTerms : ["event", "handler", "async"], 3000));
    parts.push("\nGenerate an event handler module. Export typed handler functions that process domain events.");
  } else if (role === "e2e_test") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route"], 4000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "e2e", "end-to-end", "integration", "acceptance"], 3000));
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model"], 2000));
    if (feat) {
      parts.push(`\nWrite comprehensive end-to-end tests for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate E2E tests using vitest + supertest. Test full request/response cycles through the API.");
    parts.push("Include setup/teardown, seed data, happy path, error cases, auth checks, and edge cases.");
    parts.push("Use describe/it blocks with clear test names. Test actual HTTP endpoints with real request/response validation.");
  } else if (role === "feature_store") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["state", "context", "provider"], 3000));
    parts.push("\nGenerate a React Context provider for this feature. Export a typed context, provider component, and useContext hook.");
    parts.push("Include state type, action types, reducer, and the Provider wrapper. Use useReducer for state management.");
  } else if (role === "feature_card") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DESIGN SPECS ---");
    parts.push(findRelevantDocs(ctx.designDocs, featureTerms.length > 0 ? featureTerms : ["card", "component", "design"], 3000));
    parts.push("\nGenerate a React card component for displaying a summary of this entity. Include key fields, status indicator, and action buttons.");
    parts.push("Use Tailwind CSS for styling. Export as default component with typed props interface.");
  } else if (role === "entity_validator") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "schema", "model", "entity", "validation"], 5000));
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["validation", "rule", "constraint", "business"], 3000));
    parts.push("\nGenerate an entity validator module with comprehensive validation rules.");
    parts.push("Export validate functions that check business rules, field constraints, cross-field validations, and state transitions.");
    parts.push("Return typed validation results with field-level error messages. Use Zod schemas where applicable.");
    parts.push("import { z } from 'zod';");
  } else if (role === "entity_mapper") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- DATA MODELS ---");
    parts.push(findRelevantDocs(ctx.dataDocs, featureTerms.length > 0 ? featureTerms : ["data", "entity", "model", "schema", "DTO"], 4000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["mapper", "transform", "DTO", "layer"], 3000));
    parts.push("\nGenerate a mapper module that converts between domain entities and DTOs/API responses.");
    parts.push("Export typed mapping functions: toResponse, fromRequest, toListResponse.");
    parts.push("Handle null/undefined fields, date formatting, and nested object mapping.");
  } else if (role === "auth_policy") {
    parts.push("\n--- SECURITY & AUTH ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["auth", "authorization", "permission", "role", "policy", "RBAC", "access control"], 5000));
    parts.push("\n--- ROLES & PERMISSIONS ---");
    parts.push(`Roles: ${ctx.roles.map(r => `${r.role_id}: ${r.name}${r.description ? " — " + r.description : ""}`).join("\n  ")}`);
    parts.push("\n--- REQUIREMENTS ---");
    parts.push(findRelevantDocs(ctx.requirementsDocs, featureTerms.length > 0 ? featureTerms : ["permission", "access", "authorization"], 2000));
    if (feat) {
      parts.push(`\nGenerate authorization policy for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate an authorization policy module that enforces role-based access control.");
    parts.push("Export middleware functions and policy check helpers: canAccess, requireRole, requirePermission.");
    parts.push("Include resource-level authorization (owner checks) and role hierarchy support.");
    parts.push("Use Express middleware signature (req, res, next) with proper typing.");
  } else if (role === "contract_test") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "contract", "schema"], 5000));
    parts.push("\n--- QUALITY ---");
    parts.push(findRelevantDocs(ctx.qualityDocs, ["test", "contract", "API", "schema", "validation"], 3000));
    if (feat) {
      parts.push(`\nWrite API contract tests for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate contract tests using vitest that verify API request/response shapes match their defined schemas.");
    parts.push("Test that all endpoints return correct status codes, content types, and response body structures.");
    parts.push("Validate error responses, pagination format, and auth error shapes. Use describe/it blocks with clear names.");
  } else if (role === "test_mock") {
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "client"], 4000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["service", "repository", "dependency"], 3000));
    if (feat) {
      parts.push(`\nGenerate mock implementations for the ${feat.name} feature's dependencies.`);
    }
    parts.push("\nGenerate typed mock implementations for testing. Export mock factories and spy-enabled mocks.");
    parts.push("Create mock API client, mock repository, and mock service stubs with configurable return values.");
    parts.push("Use vitest's vi.fn() for spy capabilities. Export createMock* factory functions.");
  } else if (role === "api_binding") {
    if (feat) {
      parts.push(`\n--- TARGET FEATURE ---`);
      parts.push(`Feature: ${feat.name} (${feat.feature_id})`);
      parts.push(`Description: ${feat.description}`);
    }
    parts.push("\n--- API CONTRACTS ---");
    parts.push(findRelevantDocs(ctx.apiDocs, featureTerms.length > 0 ? featureTerms : ["API", "endpoint", "route", "REST"], 5000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, featureTerms.length > 0 ? featureTerms : ["API", "client", "binding", "fetch"], 3000));
    parts.push("\nGenerate a typed API binding/client module for this feature.");
    parts.push("Export async functions for each API operation: getAll, getById, create, update, delete.");
    parts.push("Use the shared API client from src/lib/api/client. Include proper TypeScript types for requests and responses.");
    parts.push("Handle errors consistently, return typed results, and support pagination parameters.");
  } else if (role === "audit_hook") {
    parts.push("\n--- SECURITY ---");
    parts.push(findRelevantDocs(ctx.securityDocs, ["audit", "logging", "compliance", "tracking", "IAM"], 4000));
    parts.push("\n--- GOVERNANCE ---");
    parts.push(findRelevantDocs(ctx.governanceDocs, ["audit", "compliance", "governance", "trail"], 3000));
    parts.push("\n--- ARCHITECTURE ---");
    parts.push(findRelevantDocs(ctx.archDocs, ["middleware", "hook", "event", "logging"], 2000));
    if (feat) {
      parts.push(`\nGenerate audit logging hook/middleware for the ${feat.name} feature.`);
    }
    parts.push("\nGenerate an audit logging module that captures and records security-relevant actions.");
    parts.push("Export Express middleware and utility functions: auditMiddleware, logAuditEvent, createAuditTrail.");
    parts.push("Record: action type, actor (user id/role), resource, timestamp, IP address, changes (before/after).");
    parts.push("Support structured JSON logging format suitable for compliance review.");
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
