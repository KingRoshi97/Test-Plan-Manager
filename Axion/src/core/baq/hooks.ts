import type {
  BAQHookName,
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQBuildQualityReport,
  BAQGenerationFailureReport,
  BAQSeverity,
} from "./types.js";

export interface BuildQualityHookContext {
  hook_name: BAQHookName;
  run_id: string;
  build_id: string;
  timestamp: string;
  upstream_artifacts: Record<string, string>;
  extraction: BAQKitExtraction | null;
  derived_inputs: BAQDerivedBuildInputs | null;
  inventory: BAQRepoInventory | null;
  trace_map: BAQRequirementTraceMap | null;
  quality_report: BAQBuildQualityReport | null;
  failure_report: BAQGenerationFailureReport | null;
}

export interface BuildQualityHookResult {
  hook_name: BAQHookName;
  success: boolean;
  blocking: boolean;
  evidence: HookEvidence[];
  warnings: string[];
  errors: string[];
  timestamp: string;
}

export interface HookEvidence {
  evidence_id: string;
  type: string;
  path: string;
  detail: Record<string, unknown>;
}

export type HookHandler = (ctx: BuildQualityHookContext) => Promise<BuildQualityHookResult> | BuildQualityHookResult;

interface RegisteredHook {
  name: BAQHookName;
  handler: HookHandler;
  required_upstream: BAQHookName[];
}

const HOOK_ORDER: BAQHookName[] = [
  "onBuildAuthorityLoaded",
  "onKitExtractionStart",
  "onKitExtractionComplete",
  "onDerivedInputsBuild",
  "onRepoInventoryPlan",
  "onRequirementTraceBuild",
  "onSufficiencyEvaluation",
  "beforeGenerationStart",
  "onFileGenerated",
  "onGenerationComplete",
  "onVerificationReconcile",
  "beforePackaging",
  "onPackagingDecision",
  "onBuildQualityFinalize",
  "onGenerationFailure",
];

const HOOK_UPSTREAM_REQUIREMENTS: Record<BAQHookName, BAQHookName[]> = {
  onBuildAuthorityLoaded: [],
  onKitExtractionStart: ["onBuildAuthorityLoaded"],
  onKitExtractionComplete: ["onKitExtractionStart"],
  onDerivedInputsBuild: ["onKitExtractionComplete"],
  onRepoInventoryPlan: ["onDerivedInputsBuild"],
  onRequirementTraceBuild: ["onRepoInventoryPlan"],
  onSufficiencyEvaluation: ["onRequirementTraceBuild"],
  beforeGenerationStart: ["onSufficiencyEvaluation"],
  onFileGenerated: ["beforeGenerationStart"],
  onGenerationComplete: ["onFileGenerated"],
  onVerificationReconcile: ["onGenerationComplete"],
  beforePackaging: ["onVerificationReconcile"],
  onPackagingDecision: ["beforePackaging"],
  onBuildQualityFinalize: ["onPackagingDecision"],
  onGenerationFailure: [],
};

export class BuildQualityHookRunner {
  private hooks: Map<BAQHookName, RegisteredHook> = new Map();
  private completedHooks: Set<BAQHookName> = new Set();
  private results: Map<BAQHookName, BuildQualityHookResult> = new Map();

  register(name: BAQHookName, handler: HookHandler): void {
    this.hooks.set(name, {
      name,
      handler,
      required_upstream: HOOK_UPSTREAM_REQUIREMENTS[name],
    });
  }

  private validateUpstreamArtifacts(name: BAQHookName): { valid: boolean; missing: BAQHookName[] } {
    const required = HOOK_UPSTREAM_REQUIREMENTS[name];
    const missing = required.filter((dep) => !this.completedHooks.has(dep));
    return { valid: missing.length === 0, missing };
  }

  async run(name: BAQHookName, ctx: BuildQualityHookContext): Promise<BuildQualityHookResult> {
    const upstream = this.validateUpstreamArtifacts(name);
    if (!upstream.valid) {
      const result: BuildQualityHookResult = {
        hook_name: name,
        success: false,
        blocking: true,
        evidence: [],
        warnings: [],
        errors: [`Upstream artifact rule violated: missing hooks [${upstream.missing.join(", ")}]`],
        timestamp: new Date().toISOString(),
      };
      this.results.set(name, result);
      return result;
    }

    const hook = this.hooks.get(name);
    if (!hook) {
      const result: BuildQualityHookResult = {
        hook_name: name,
        success: true,
        blocking: false,
        evidence: [],
        warnings: [`No handler registered for hook ${name}, passing through`],
        errors: [],
        timestamp: new Date().toISOString(),
      };
      this.completedHooks.add(name);
      this.results.set(name, result);
      return result;
    }

    try {
      const result = await hook.handler(ctx);

      if (!result.evidence || result.evidence.length === 0) {
        result.warnings.push(`Deterministic evidence rule: hook ${name} produced no evidence entries`);
      }

      this.completedHooks.add(name);
      this.results.set(name, result);
      return result;
    } catch (err: any) {
      const result: BuildQualityHookResult = {
        hook_name: name,
        success: false,
        blocking: true,
        evidence: [],
        warnings: [],
        errors: [`Hook ${name} threw: ${err.message ?? String(err)}`],
        timestamp: new Date().toISOString(),
      };
      this.results.set(name, result);
      return result;
    }
  }

  getResult(name: BAQHookName): BuildQualityHookResult | undefined {
    return this.results.get(name);
  }

  isCompleted(name: BAQHookName): boolean {
    return this.completedHooks.has(name);
  }

  getHookOrder(): BAQHookName[] {
    return [...HOOK_ORDER];
  }

  reset(): void {
    this.completedHooks.clear();
    this.results.clear();
  }
}

export function createHookContext(
  hookName: BAQHookName,
  runId: string,
  buildId: string,
  overrides: Partial<BuildQualityHookContext> = {},
): BuildQualityHookContext {
  return {
    hook_name: hookName,
    run_id: runId,
    build_id: buildId,
    timestamp: new Date().toISOString(),
    upstream_artifacts: {},
    extraction: null,
    derived_inputs: null,
    inventory: null,
    trace_map: null,
    quality_report: null,
    failure_report: null,
    ...overrides,
  };
}
