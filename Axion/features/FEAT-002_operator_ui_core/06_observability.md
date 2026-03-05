# FEAT-002 — Operator UI Core: Observability

## 1. Console Output

The CLI uses `console.log` and `console.error` for all operator-facing output. There is no structured logging framework; output is plain text.

### 1.1 Status Messages by Command

| Command | Output Pattern |
|---------|---------------|
| `axion init` | `"Initialized .axion/ directory at {path}"` |
| `axion run` | `"[1/2] Creating new run via ICP..."`, `"[2/2] Executing {N} stages..."`, per-stage status, artifact listing |
| `axion run start` | `"[run start] Creating new run via ICP..."`, `"Run ID: {runId}"` |
| `axion run stage` | `"Stage {stageId}: pass → {reportPath}"` or `"Stage {stageId}: FAIL (gate {gateId} blocked)"` |
| `axion run gates` | `"Running gates for stage {stageId}..."`, per-gate results, `"ALL PASSED"` or `"FAILED"` |
| `axion help` | Full usage text with command list, stage list, gate registry |

### 1.2 Per-Stage Console Lines

| Stage | Output |
|-------|--------|
| S2 (on fail) | `"S2: Intake validation FAILED with {N} error(s)"` |
| S4 (on fail) | `"S4: Canonical validation FAILED with {N} error(s)"` |
| S5 | `"S5: Resolved {N} standards from {M} packs"` |
| S8 | `"S8: Generated {N} work units, {M} acceptance items, coverage: {P}%"` |
| S9 | `"S9: Verified {N} gates, created {M} proof objects, pointers: {R}/{T} resolved"` |
| S10 | `"S10: Packaged kit with {N} files, hash={hash}"` |

## 2. Audit Trail

- `AuditLogger` (from FEAT-001) writes structured JSONL entries to `.axion/audit.jsonl`
- Records run creation, stage advancement, stage results, and run completion events
- Append-only; no log rotation or truncation

## 3. Artifact Index

- `artifact_index.json` in each run directory serves as an observability manifest
- Each entry includes `artifact_id`, `type`, `path`, `sha256`, `created_at`, `producer.stage_id`
- Updated after each stage execution

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
- FEAT-001 (Control Plane Core — AuditLogger)
