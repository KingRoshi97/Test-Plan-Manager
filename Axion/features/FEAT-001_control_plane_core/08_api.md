# FEAT-001 — Control Plane Core: API Surface

## 1. api.ts — RunController

```typescript
class RunController {
  constructor(store: RunStore, audit?: AuditLogger, baseDir?: string);

  async createRun(config: Record<string, unknown>): Promise<ICPRun>;
  async advanceStage(runId: string, stageId: string): Promise<void>;
  async recordStageResult(
    runId: string,
    stageId: string,
    result: "pass" | "fail" | "skip",
    reportRef?: string
  ): Promise<void>;
  async completeRun(runId: string): Promise<void>;
  async getRunStatus(runId: string): Promise<ICPRun | null>;

  private transitionRun(run: ICPRun, target: ICPRunStatus): void;
}
```

## 2. model.ts — Types & Conversion

```typescript
type ICPRunStatus = "queued" | "running" | "gated" | "failed" | "released" | "archived";
type ICPStageStatus = "not_started" | "in_progress" | "pass" | "fail" | "skip";

interface ICPStageRun {
  stage_id: StageId;
  icp_status: ICPStageStatus;
  stage_report_ref: string | null;
}

interface ICPRun {
  run_id: string;
  icp_status: ICPRunStatus;
  created_at: string;
  updated_at: string;
  pipeline: { pipeline_id: string; pipeline_version: string };
  profile: { profile_id: string };
  stage_order: StageId[];
  stages: ICPStageRun[];
  stage_gates: Record<string, string>;
  gates_required: string[];
  gate_reports: GateReportRef[];
  artifact_index_ref: string;
  errors: RunError[];
  policy_snapshot_ref: string | null;
  config: Record<string, unknown>;
}

interface ProofRef {
  proof_id: string;
  type: string;
  gate_id: string;
  timestamp: string;
}

function icpRunToManifest(icp: ICPRun): RunManifest;
function manifestToICPRun(manifest: RunManifest): ICPRun;
```

## 3. store.ts — Persistence

```typescript
interface RunStore {
  createRun(run: ICPRun): Promise<void>;
  getRun(runId: string): Promise<ICPRun | null>;
  updateRun(runId: string, updates: Partial<ICPRun>): Promise<void>;
  listRuns(): Promise<ICPRun[]>;
}

class JSONRunStore implements RunStore {
  constructor(basePath: string);
}
```

## 4. audit.ts — Audit Logging

```typescript
interface AuditEntry {
  timestamp: string;
  action: string;
  run_id: string;
  details: Record<string, unknown>;
  prev_hash: string;
  hash: string;
}

class AuditLogger {
  constructor(logPath: string);
  append(action: string, runId: string, details: Record<string, unknown>): void;
}
```

## 5. pins.ts — Artifact Pinning

```typescript
interface PinEntry {
  pin_id: string;
  artifact_id: string;
  artifact_path: string;
  pinned_at: string;
  pinned_by: string;
  reason?: string;
  hash: string;
}

interface Pinset {
  run_id: string;
  pins: PinEntry[];
  updated_at: string;
}

function pinArtifact(runId: string, artifactPath: string, pinnedBy: string, reason?: string): PinEntry;
function unpinArtifact(runId: string, pinId: string): void;
function listPins(runId: string): PinEntry[];
function verifyPin(runId: string, pinId: string): boolean;
function verifyAllPins(runId: string): { valid: boolean; results: Array<{ pin_id: string; valid: boolean }> };
```

## 6. releases.ts — Release Lifecycle

```typescript
type ReleaseStatus = "draft" | "staged" | "published" | "revoked";

interface Release {
  release_id: string;
  run_id: string;
  version: string;
  created_at: string;
  updated_at: string;
  status: ReleaseStatus;
  artifacts: Array<{ artifact_id: string; path: string; hash: string }>;
  signatures: Array<{ signer: string; signature: string; signed_at: string }>;
  notes?: string;
  revocation_reason?: string;
}

function createRelease(runId: string, version: string, basePath?: string, artifacts?: Array<{...}>, notes?: string): Release;
function signRelease(releaseId: string, signer: string, basePath?: string): Release;
function publishRelease(releaseId: string, basePath?: string): Release;
function revokeRelease(releaseId: string, reason: string, basePath?: string): Release;
function getRelease(releaseId: string, basePath?: string): Release | null;
function listReleases(basePath?: string): Release[];
```

## 7. policies.ts — Policy Engine

```typescript
interface Policy {
  policy_id: string;
  name: string;
  version: string;
  description: string;
  rules: PolicyRule[];
  applies_to: string[];
  enforcement: "strict" | "advisory";
}

interface PolicyRule {
  rule_id: string;
  condition: string;
  action: "allow" | "deny" | "warn";
  message: string;
}

interface PolicyEvaluationResult {
  policy_id: string;
  passed: boolean;
  violations: Array<{
    rule_id: string;
    action: "deny" | "warn";
    message: string;
    context: Record<string, unknown>;
  }>;
}

interface RiskClass {
  risk_class: string;
  hard_stops: string[];
  required_evidence: string[];
  allow_overrides: boolean;
}

interface OverrideRule {
  rule_id: string;
  applies_to: string;
  allowed: boolean;
  requires_evidence: string[];
  expires_in_days: number;
  notes?: string;
}

interface PolicyContext {
  run_id?: string;
  stage_id?: string;
  risk_class?: string;
  gate_results?: Record<string, { passed: boolean }>;
  evidence?: string[];
  overrides?: Array<{ rule_id: string; evidence: string[]; created_at: string }>;
  [key: string]: unknown;
}

function loadPolicies(registryPath: string): Policy[];
function evaluatePolicy(policy: Policy, context: unknown): PolicyEvaluationResult;
function evaluateAllPolicies(policies: Policy[], context: unknown): PolicyEvaluationResult[];
```

## 8. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error conditions)
- SYS-03 (End-to-End Architecture)
