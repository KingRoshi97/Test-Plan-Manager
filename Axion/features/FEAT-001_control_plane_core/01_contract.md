# FEAT-001 — Control Plane Core: Contract

## 1. Purpose

Central orchestration service that manages the full lifecycle of Axion pipeline runs. Provides run creation, sequential stage progression with gate enforcement, artifact pinning with integrity verification, release lifecycle management (draft → staged → published → revoked), append-only hash-chained audit logging, and policy evaluation with risk-class and override support.

## 2. Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config: Record<string, unknown>` | Caller | Run configuration containing `pipeline_id`, `pipeline_version`, `profile_id` |
| `runId: string` | Caller | Run identifier in `RUN-NNNNNN` format |
| `stageId: string` | Caller | One of the 10 stage IDs (S1–S10) |
| `result: "pass" \| "fail" \| "skip"` | Stage executor | Stage execution outcome |
| `artifactPath: string` | Caller | Filesystem path to artifact for pinning |
| `Policy[]` | Policy registry file | Array of policy definitions loaded from JSON |
| `PolicyContext` | Caller | Context object for policy evaluation (risk_class, evidence, overrides, gate_results) |
| Release parameters | Caller | `runId`, `version`, `basePath`, `artifacts[]`, `notes` |

## 3. Outputs

| Output | Module | Description |
|--------|--------|-------------|
| `ICPRun` | api.ts | Full run record with stages, gates, errors, config |
| `RunManifest` | model.ts | Serialized run manifest (JSON on disk at `run_manifest.json`) |
| `AuditEntry` (JSONL) | audit.ts | Hash-chained audit log entries |
| `PinEntry` | pins.ts | Artifact pin with SHA-256 hash and metadata |
| `Release` | releases.ts | Release object with artifacts, signatures, status |
| `PolicyEvaluationResult` | policies.ts | Per-policy pass/fail with violation details |

## 4. Invariants

- Run IDs are monotonically increasing (`RUN-000001`, `RUN-000002`, …) via a persisted counter at `.axion/run_counter.json`
- Run status transitions are strictly enforced: `queued → running → gated → running → released → archived` or `queued → running → failed → archived`. Invalid transitions throw.
- Stage progression is sequential — a stage cannot start unless the prior stage has status `pass` or `skip`
- When a stage fails and has an associated gate, the run transitions to `gated` (not `failed`), allowing retry
- When a stage fails without a gate, the run transitions to `failed`
- All state mutations are recorded via `AuditLogger.append()` with hash-chained entries (each entry's `prev_hash` is the prior entry's `hash`)
- Artifact pins are content-addressed — the pin stores the SHA-256 hash of the artifact content at pin time
- A pinned artifact cannot be re-pinned (duplicate pin throws)
- Pin verification compares current file hash against stored hash
- Release status transitions follow: `draft → staged → revoked`, `staged → published → revoked`. Publishing requires at least one signature.
- Policy evaluation is deterministic: same policy + context always produces same result
- Strict-enforcement policies fail on any `deny` violation; advisory-enforcement policies always pass

## 5. State Machine

### Run Status (`ICPRunStatus`)

```
queued ──→ running ──→ gated ──→ running (retry)
  │            │                     │
  │            ├──→ released ──→ archived
  │            │
  └──→ failed ──→ archived
```

Valid transitions:
- `queued` → `running`, `failed`
- `running` → `gated`, `failed`, `released`
- `gated` → `running`, `failed`
- `failed` → `archived`
- `released` → `archived`
- `archived` → (none)

### Stage Status (`ICPStageStatus`)

`not_started` → `in_progress` → `pass` | `fail` | `skip`

### Release Status (`ReleaseStatus`)

`draft` → `staged` → `published` → `revoked`

## 6. Dependencies

- `../../types/run.js` — `STAGE_ORDER`, `STAGE_GATES`, `GATES_REQUIRED`, `StageId`
- `../../types/artifacts.js` — `ArtifactRef`
- `../../utils/time.js` — `isoNow()`
- `../../utils/fs.js` — `readJson`, `writeJson`, `ensureDir`, `appendJsonl`
- `../../utils/hash.js` — `sha256()`

## 7. Source Modules

| Module | Responsibility |
|--------|---------------|
| `api.ts` | `RunController` class — run lifecycle (create, advance, record, complete, status) |
| `model.ts` | Type definitions (`ICPRun`, `ICPStageRun`, status types) and manifest conversion functions |
| `store.ts` | `RunStore` interface + `JSONRunStore` — persistence via JSON manifest files |
| `audit.ts` | `AuditLogger` — append-only hash-chained JSONL audit log |
| `pins.ts` | Artifact pinning — pin, unpin, list, verify, verifyAll |
| `releases.ts` | Release lifecycle — create, sign, publish, revoke, get, list |
| `policies.ts` | Policy loading, condition matching, applicability checks, evaluation |

## 8. Failure Modes

- Run counter file corrupted → next run ID unpredictable
- Partial write during `updateRun` → manifest on disk may be inconsistent
- Audit log append fails → mutation occurs without audit record
- Pinned file deleted or modified → `verifyPin` returns `false`
- Policy registry file missing → `loadPolicies` returns empty array (silent)
- Release counter is in-memory only → restarts reset the counter (potential ID collisions across process restarts)

## 9. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- STATE-01 (State Snapshot Format)
- GOV-04 (Audit & Traceability Rules)
