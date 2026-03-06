export type BuildState =
  | "not_requested"
  | "requested"
  | "approved"
  | "building"
  | "verifying"
  | "failed"
  | "passed"
  | "exported";

export type BuildOutputMode = "kit_only" | "build_repo" | "build_and_export";

export type BuildFailureClass =
  | "missing_kit"
  | "invalid_inputs"
  | "eligibility"
  | "planning"
  | "workspace"
  | "generation"
  | "verification"
  | "packaging"
  | "records";

export const BUILD_TRANSITIONS: Record<BuildState, BuildState[]> = {
  not_requested: ["requested"],
  requested: ["approved", "failed"],
  approved: ["building", "failed"],
  building: ["verifying", "failed"],
  verifying: ["passed", "failed"],
  failed: ["requested"],
  passed: ["exported"],
  exported: [],
};

export interface BuildRequest {
  runId: string;
  outputMode: BuildOutputMode;
  requestedAt: string;
  operatorNote?: string;
}

export interface BuildSlice {
  sliceId: string;
  name: string;
  order: number;
  requiresAI: boolean;
  files: BuildFileTarget[];
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface BuildFileTarget {
  relativePath: string;
  role: string;
  sourceRef?: string;
  generationMethod: "deterministic" | "ai_assisted";
  status: "pending" | "generated" | "failed" | "skipped";
  sizeBytes?: number;
}

export interface BuildPlan {
  buildId: string;
  runId: string;
  kitRef: string;
  stackProfile: StackProfile;
  repoShape: RepoShape;
  slices: BuildSlice[];
  totalFiles: number;
  totalSlices: number;
  createdAt: string;
}

export interface StackProfile {
  framework: string;
  language: string;
  runtime: string;
  packageManager: string;
  buildTool?: string;
  testFramework?: string;
  cssFramework?: string;
  database?: string;
}

export interface RepoShape {
  rootDirs: string[];
  srcLayout: Record<string, string[]>;
  configFiles: string[];
  docFiles: string[];
}

export interface BuildManifest {
  buildId: string;
  runId: string;
  sourceKit: {
    kitRoot: string;
    runId: string;
    specId: string;
    version: string;
  };
  buildProfile: StackProfile;
  request: BuildRequest;
  lifecycle: BuildLifecycleEvent[];
  status: BuildState;
  startedAt: string;
  completedAt?: string;
  outputRefs: {
    repoPath?: string;
    buildManifestPath?: string;
    repoManifestPath?: string;
    verificationReportPath?: string;
    buildPlanPath?: string;
    fileIndexPath?: string;
    exportZipPath?: string;
  };
  tokenUsage?: {
    total_prompt_tokens: number;
    total_completion_tokens: number;
    total_tokens: number;
    total_cost_usd: number;
    api_calls: number;
  };
  failureEvidence?: {
    failureClass: BuildFailureClass;
    phase: string;
    reason: string;
    blockedConditions?: string[];
    partialOutputs?: string[];
  };
}

export interface BuildLifecycleEvent {
  state: BuildState;
  timestamp: string;
  phase?: string;
  detail?: string;
}

export interface RepoManifest {
  buildId: string;
  runId: string;
  repoRoot: string;
  structure: {
    directories: string[];
    totalFiles: number;
    totalSizeBytes: number;
  };
  fileInventory: FileInventoryEntry[];
  moduleCoverage: Record<string, string[]>;
  dependencies: Record<string, string>;
  commands: {
    install?: string;
    dev?: string;
    build?: string;
    test?: string;
    lint?: string;
  };
  generatedAt: string;
}

export interface FileInventoryEntry {
  path: string;
  role: string;
  sourceRef?: string;
  sizeBytes: number;
  generationMethod: "deterministic" | "ai_assisted";
}

export interface VerificationReport {
  buildId: string;
  runId: string;
  verifiedAt: string;
  overallResult: "pass" | "fail";
  categories: VerificationCategory[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  exportEligible: boolean;
}

export interface VerificationCategory {
  categoryId: string;
  name: string;
  result: "pass" | "fail" | "warn" | "skip";
  checks: VerificationCheck[];
}

export interface VerificationCheck {
  checkId: string;
  description: string;
  result: "pass" | "fail" | "warn" | "skip";
  detail?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  conditions: EligibilityCondition[];
  blockers: string[];
}

export interface EligibilityCondition {
  conditionId: string;
  description: string;
  passed: boolean;
  detail?: string;
}

export interface BuildProgress {
  buildId: string;
  state: BuildState;
  currentSlice?: string;
  slicesCompleted: number;
  totalSlices: number;
  filesGenerated: number;
  totalFiles: number;
  tokenUsage?: {
    total_tokens: number;
    total_cost_usd: number;
    api_calls: number;
  };
  startedAt: string;
  updatedAt: string;
  error?: string;
  failureClass?: BuildFailureClass;
}

export function isValidTransition(from: BuildState, to: BuildState): boolean {
  return BUILD_TRANSITIONS[from]?.includes(to) ?? false;
}

export function generateBuildId(): string {
  const num = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
  return `BLD-${num}`;
}
