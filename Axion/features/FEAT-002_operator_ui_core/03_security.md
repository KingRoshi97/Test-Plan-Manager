# FEAT-002 — Operator UI Core: Security Requirements

## 1. Scope

Security properties of the CLI entry point and command modules.

## 2. Security Properties

- The CLI operates entirely on the local filesystem; no network calls are made
- All file reads/writes are scoped under `baseDir` (resolved to `"."` or `"Axion"`)
- Run directories are scoped to `.axion/runs/RUN-NNNNNN/` — no path traversal beyond `baseDir`
- No secrets, credentials, or PII are read, generated, or logged by the CLI itself
- Audit logging (via `AuditLogger`) writes to `.axion/audit.jsonl` as append-only

## 3. Data Classification

| Data | Classification |
|------|---------------|
| CLI arguments (`process.argv`) | Internal |
| Run artifacts (canonical spec, gate reports, stage reports) | Internal |
| Audit log (`.axion/audit.jsonl`) | Restricted — append-only |
| Console output (stdout/stderr) | Internal |

## 4. Access Control

- No authentication or authorization is enforced — the CLI runs with the permissions of the invoking process
- File system permissions are inherited from the OS user context
- Audit log integrity relies on append-only write pattern (no truncation or editing)

## 5. Input Validation

| Input | Validation |
|-------|-----------|
| `stageId` argument | Validated against `STAGE_ORDER` via `resolveStageId()`; rejected if not found |
| `runId` argument | Validated by attempting to read the run manifest; error if file does not exist |
| `subCommand` for `run` | Matched via switch/if-else; unrecognized subcommands fall through to `cmdRunFull` |
| Base directory | Resolved by checking for `registries/` directory existence |

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- GOV-04 (Audit & Traceability Rules)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
