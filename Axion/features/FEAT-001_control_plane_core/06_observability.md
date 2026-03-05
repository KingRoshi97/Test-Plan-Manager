# FEAT-001 — Control Plane Core: Observability

## 1. Audit Log (Primary Observability Channel)

The `AuditLogger` is the main observability mechanism. It writes hash-chained JSONL entries for all state mutations.

### Audit Actions

| Action | Trigger | Details Payload |
|--------|---------|----------------|
| `run.created` | `createRun()` | `{ config }` |
| `stage.started` | `advanceStage()` | `{ stage_id }` |
| `stage.completed` | `recordStageResult()` | `{ stage_id, result, report_ref }` |
| `run.released` | `completeRun()` | `{}` |

### Audit Entry Schema

```typescript
interface AuditEntry {
  timestamp: string;       // ISO 8601
  action: string;          // Dot-notation action identifier
  run_id: string;          // Run ID (RUN-NNNNNN)
  details: Record<string, unknown>;
  prev_hash: string;       // SHA-256 of previous entry (or zero hash for first)
  hash: string;            // SHA-256 of this entry's payload
}
```

## 2. Console Logging

The following `console.log` statements provide runtime visibility:

| Module | Message | Trigger |
|--------|---------|---------|
| api.ts | `Created run: ${runId}` | `createRun()` |
| api.ts | `  Run directory: ${runDir}` | `createRun()` |
| api.ts | `  Stage ${stageId}: ${result}` | `recordStageResult()` |

## 3. Run Error Tracking

Gate-blocked failures are recorded in `run.errors[]`:

```typescript
interface RunError {
  stage_id: StageId;
  message: string;       // "Gate ${gateId} blocked stage ${stageId}"
  timestamp: string;     // ISO 8601
}
```

## 4. Pin Verification Reporting

`verifyAllPins()` returns a structured verification report:

```typescript
{
  valid: boolean;
  results: Array<{ pin_id: string; valid: boolean }>
}
```

## 5. Observable State

| State | Location | Format |
|-------|----------|--------|
| Run manifest | `.axion/runs/{RUN-ID}/run_manifest.json` | JSON |
| Audit log | Configured log path | JSONL (append-only) |
| Pinset | `.axion/runs/{RUN-ID}/pinset.json` | JSON |
| Releases | `.axion/releases/{REL-ID}.json` | JSON |
| Run counter | `.axion/run_counter.json` | JSON |

## 6. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
