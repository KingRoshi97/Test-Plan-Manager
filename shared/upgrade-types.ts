export type UpgradeModeId =
  | "MM-05"
  | "MM-06"
  | "MM-08"
  | "MM-09"
  | "MM-10"
  | "MM-15"
  | "MM-16"
  | "MM-17"
  | "MM-18"
  | "MM-19";

export type UpgradeSessionStatus =
  | "draft"
  | "planning"
  | "awaiting_approval"
  | "approved"
  | "executing"
  | "verifying"
  | "promotion_ready"
  | "promoted"
  | "failed"
  | "cancelled"
  | "archived";

export type UpgradeRevisionStatus =
  | "active"
  | "candidate"
  | "approved"
  | "archived"
  | "failed"
  | "rolled_back"
  | "superseded";

export type UpgradeVerificationVerdict =
  | "not_run"
  | "running"
  | "pass"
  | "pass_with_warnings"
  | "fail";

export type UpgradeInternalTabId =
  | "plan"
  | "workspace"
  | "compare"
  | "verify"
  | "promote";

export type UpgradeModeOption = {
  id: UpgradeModeId;
  label: string;
  description: string;
  isDestructive?: boolean;
  requiresCompatibilityCheck?: boolean;
  requiresRollbackTarget?: boolean;
};

export type UpgradeRevisionSummary = {
  id: string;
  revisionNumber: number;
  title?: string | null;
  summary?: string | null;
  status: UpgradeRevisionStatus;
  modeId: UpgradeModeId | null;
  parentRevisionId: string | null;
  sourceRunId: string | null;
  sourceSessionId: string | null;
  createdAt: string;
  createdBy?: string | null;
  promotedAt?: string | null;
  archivedAt?: string | null;
  isRollbackTarget: boolean;
  isCurrentActive: boolean;
  isCandidate: boolean;
  diffStats?: UpgradeDiffStats | null;
  verificationVerdict?: UpgradeVerificationVerdict | null;
};

export type UpgradeSessionSummary = {
  id: string;
  assemblyId: number;
  sourceRevisionId: string;
  candidateRevisionId: string | null;
  modeId: UpgradeModeId;
  objective: string;
  scope?: string | null;
  instructions?: string | null;
  status: UpgradeSessionStatus;
  compatibilityRequired: boolean;
  validationProfile?: string | null;
  riskLevel?: "low" | "medium" | "high" | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  blockingIssue?: string | null;
};

export type UpgradeDiffStats = {
  added: number;
  removed: number;
  modified: number;
  renamed: number;
  warnings?: number;
  regressions?: number;
};

export type UpgradeVerificationSummary = {
  revisionId: string;
  verdict: UpgradeVerificationVerdict;
  requiredChecksTotal: number;
  requiredChecksPassed: number;
  optionalChecksTotal: number;
  optionalChecksPassed: number;
  warningCount: number;
  failureCount: number;
  lastRunAt?: string | null;
};

export type StartUpgradeSessionInput = {
  sourceRevisionId: string;
  modeId: UpgradeModeId;
  objective: string;
  scope?: string | null;
  instructions?: string | null;
  notes?: string | null;
  compatibilityRequired: boolean;
  validationProfile?: string | null;
  snapshotBeforeStart?: boolean;
};

export type UpgradePlanData = {
  id: string;
  sessionId: string;
  findingsSummary: string;
  proposedChanges: UpgradePlannedChange[];
  impactedArtifacts: UpgradeArtifactRef[];
  risks: UpgradeRiskItem[];
  validationPlan: UpgradeValidationPlan;
  rollbackPlan: UpgradeRollbackPlan;
  agentSummary?: string | null;
  generatedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export type UpgradePlannedChange = {
  id: string;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  targetArea?: string | null;
  expectedImpact?: string | null;
};

export type UpgradeArtifactRef = {
  id: string;
  label: string;
  path?: string | null;
  artifactType?: string | null;
};

export type UpgradeRiskItem = {
  id: string;
  level: "low" | "medium" | "high";
  title: string;
  description: string;
  mitigation?: string | null;
};

export type UpgradeValidationPlan = {
  requiredChecks: string[];
  optionalChecks?: string[];
  compatibilityChecks?: string[];
};

export type UpgradeRollbackPlan = {
  targetRevisionId: string | null;
  notes?: string | null;
  isSafeRollbackAvailable: boolean;
};

export type UpgradeExecutionStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt?: string | null;
  completedAt?: string | null;
  message?: string | null;
};

export type UpgradeActivityEvent = {
  id: string;
  timestamp: string;
  actorType: "agent" | "system" | "user";
  actorLabel: string;
  message: string;
  level?: "info" | "warning" | "error" | "success";
};

export type CandidateArtifactChange = {
  id: string;
  label: string;
  path?: string | null;
  changeType: "added" | "removed" | "modified" | "renamed";
  status?: "pending" | "processing" | "done" | "failed";
};

export type RevisionDiffData = {
  sourceRevisionId: string;
  candidateRevisionId: string;
  stats: UpgradeDiffStats;
  added: DiffItem[];
  removed: DiffItem[];
  modified: DiffItem[];
  renamed: DiffRenameItem[];
  configChanges?: DiffItem[];
  structuralChanges?: DiffItem[];
  semanticSummary?: UpgradeSemanticDiff | null;
  regressionFlags?: UpgradeRegressionFlag[];
};

export type DiffItem = {
  id: string;
  label: string;
  path?: string | null;
  detail?: string | null;
  category?: string | null;
};

export type DiffRenameItem = {
  id: string;
  fromPath: string;
  toPath: string;
  label?: string | null;
};

export type UpgradeSemanticDiff = {
  improvements: string[];
  regressions: string[];
  unresolvedIssues: string[];
  introducedAssumptions: string[];
};

export type UpgradeRegressionFlag = {
  id: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
};

export type VerificationCheckStatus =
  | "not_run"
  | "running"
  | "pass"
  | "warning"
  | "fail";

export type VerificationCheckData = {
  id: string;
  label: string;
  category: "required" | "optional" | "compatibility" | "ci" | "workspace";
  status: VerificationCheckStatus;
  message?: string | null;
  proofRefs?: string[];
};

export type RevisionVerificationDetail = {
  revisionId: string;
  verdict: UpgradeVerificationVerdict;
  requiredChecks: VerificationCheckData[];
  optionalChecks: VerificationCheckData[];
  compatibilityChecks?: VerificationCheckData[];
  ciChecks?: VerificationCheckData[];
  workspaceChecks?: VerificationCheckData[];
  warnings: string[];
  proofRefs: string[];
  lastRunAt?: string | null;
};

export type PromotionDecisionInput = {
  revisionId: string;
  notes?: string | null;
  confirm: boolean;
};

export type RollbackDecisionInput = {
  targetRevisionId: string;
  reason?: string | null;
  confirm: boolean;
};

export type UpgradeLineagePreview = {
  currentActiveRevisionId: string | null;
  nextActiveRevisionId: string | null;
  preservedRollbackRevisionId: string | null;
  summary: string;
};

export type RevisionEventData = {
  id: string;
  assemblyId: number;
  revisionId: string | null;
  sessionId: string | null;
  eventType: string;
  actorType: string;
  actorLabel: string | null;
  payloadJson: Record<string, unknown> | null;
  createdAt: string;
};

export type RevisionSnapshotSummary = {
  id: string;
  revisionId: string;
  snapshotType: string;
  manifestPath: string | null;
  kitArchivePath: string | null;
  artifactTreeHash: string | null;
  createdAt: string;
  createdBy: string | null;
};

export const UPGRADE_MODE_OPTIONS: UpgradeModeOption[] = [
  { id: "MM-05", label: "Planned Upgrade", description: "Standard planned upgrade with full review cycle", requiresCompatibilityCheck: true },
  { id: "MM-06", label: "Hotfix", description: "Narrow-scope emergency fix with rapid verification" },
  { id: "MM-08", label: "Breaking Upgrade", description: "Major version upgrade with incompatibility warnings", isDestructive: true, requiresCompatibilityCheck: true, requiresRollbackTarget: true },
  { id: "MM-09", label: "Artifact Migration", description: "Structural migration of artifacts, paths, or schemas", requiresCompatibilityCheck: true },
  { id: "MM-10", label: "Backcompat Validation", description: "Validate backward compatibility without changes" },
  { id: "MM-15", label: "Rollback / Revert", description: "Revert to a previous revision", isDestructive: true, requiresRollbackTarget: true },
  { id: "MM-16", label: "Dependency Update", description: "Update external dependencies" },
  { id: "MM-17", label: "Config Refresh", description: "Refresh configuration without structural changes" },
  { id: "MM-18", label: "Security Patch", description: "Apply security-focused patches" },
  { id: "MM-19", label: "Performance Tune", description: "Performance optimization pass" },
];
