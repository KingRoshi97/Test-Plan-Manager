# FEAT-001 — Control Plane Core: Test Plan

## 1. Unit Tests — api.ts (RunController)

### 1.1 createRun

- Creates run with monotonically increasing ID (RUN-000001, RUN-000002, …)
- Initializes all 10 stages with status `not_started`
- Sets run status to `queued`
- Creates run directory with all required subdirs (stage_reports, gates, intake, standards, canonical, planning, templates, proof, verification, kit, state, state/handoff_packet)
- Persists counter to `.axion/run_counter.json`
- Records `run.created` audit entry

### 1.2 advanceStage

- Transitions run from `queued` to `running` on first stage advance
- Transitions run from `gated` to `running` on retry
- Sets stage status to `in_progress`
- Throws when run ID not found
- Throws when stage ID not in `stage_order`
- Throws when prior stage is not `pass` or `skip`
- Throws when run status is `failed`, `released`, or `archived`
- Records `stage.started` audit entry

### 1.3 recordStageResult

- Sets stage status to `pass`, `fail`, or `skip`
- On fail with gate: transitions run to `gated`, appends error to `run.errors[]`
- On fail without gate: transitions run to `failed`
- Stores `stage_report_ref` if provided
- Records `stage.completed` audit entry

### 1.4 completeRun

- Transitions run to `released` when all stages are pass/skip
- Throws with list of incomplete stages when not all done
- Records `run.released` audit entry

### 1.5 getRunStatus

- Returns full `ICPRun` for valid run ID
- Returns `null` for non-existent run ID

## 2. Unit Tests — model.ts

### 2.1 icpRunToManifest

- Maps all ICP statuses to manifest statuses correctly (queued→created, running→running, gated→paused, failed→failed, released→completed, archived→completed)
- Maps all stage statuses correctly (not_started→queued, in_progress→running, pass→pass, fail→fail, skip→skipped)
- Preserves all fields through conversion

### 2.2 manifestToICPRun

- Reverse-maps all manifest statuses to ICP statuses
- Handles `cancelled` manifest status → `failed` ICP status
- Round-trip: `manifestToICPRun(icpRunToManifest(run))` preserves all data

## 3. Unit Tests — store.ts (JSONRunStore)

- `createRun` writes manifest JSON to `{basePath}/runs/{runId}/run_manifest.json`
- `getRun` returns null for non-existent run
- `getRun` deserializes and converts manifest back to ICPRun
- `updateRun` merges updates and persists
- `updateRun` throws for non-existent run
- `listRuns` returns all runs in the runs directory

## 4. Unit Tests — audit.ts (AuditLogger)

- Appends JSONL entries to log file
- Each entry includes timestamp, action, run_id, details
- Hash chain: first entry has zero prev_hash, subsequent entries chain
- `hash` field is SHA-256 of the payload JSON

## 5. Unit Tests — pins.ts

- `pinArtifact` creates pin with SHA-256 hash of file content
- `pinArtifact` throws for non-existent file
- `pinArtifact` throws for already-pinned artifact
- `unpinArtifact` removes pin from pinset
- `unpinArtifact` throws for non-existent pin
- `listPins` returns all pins for a run
- `verifyPin` returns true when hash matches
- `verifyPin` returns false when file content changed
- `verifyPin` returns false when file deleted
- `verifyAllPins` returns aggregate result

## 6. Unit Tests — releases.ts

- `createRelease` creates draft release with generated ID
- `signRelease` transitions draft → staged, adds signature
- `signRelease` throws for non-existent release
- `publishRelease` transitions staged → published
- `publishRelease` throws when no signatures present
- `revokeRelease` transitions any non-revoked → revoked
- Invalid transitions throw with allowed list
- `listReleases` returns all releases

## 7. Unit Tests — policies.ts

- `loadPolicies` loads from registry JSON file
- `loadPolicies` loads risk class policies from `libraries/policy/risk_classes.v1.json`
- `loadPolicies` loads override policies from `libraries/policy/override_policy.v1.json`
- `loadPolicies` returns empty array when files missing
- `evaluatePolicy` skips policies that don't apply to context
- `evaluatePolicy` triggers deny on hard-stop conditions
- `evaluatePolicy` triggers deny on missing evidence
- `evaluatePolicy` strict enforcement: deny violation → failed
- `evaluatePolicy` advisory enforcement: deny violation → passed (with violations)
- `evaluateAllPolicies` evaluates all policies and returns results

## 8. Integration Tests

- Full run lifecycle: create → advance through all 10 stages → complete
- Gate-blocked retry: fail a gated stage → verify gated status → retry → pass
- Fail non-gated stage → verify failed status → cannot retry
- Pin artifact during run → verify pin → modify artifact → verify pin fails
- Create release → sign → publish lifecycle

## 9. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/`
- Helpers: `test/helpers/`
- Requires temp directory for filesystem operations

## 10. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
- 04_gates_and_proofs.md (gate enforcement rules)
