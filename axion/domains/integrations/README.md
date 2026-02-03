<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:integrations -->
<!-- AXION:PREFIX:integ -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Integrations — Axion Assembler

**Module slug:** `integrations`  
**Prefix:** `integ`  
**Description:** Third-party integrations and external services for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:INTEG_SCOPE -->
## Scope & Ownership
- Owns: Integration with AXION CLI scripts, filesystem access patterns
- Does NOT own: Database access (data module), API routes (backend)

<!-- AXION:SECTION:INTEG_CATALOG -->
## Integration Catalog
- Provider list + purpose:
  | Provider | Purpose | Data Direction |
  |----------|---------|----------------|
  | AXION CLI Scripts | Execute pipeline stages | Out (spawn) → In (stdout/stderr) |
  | Local Filesystem | Read/write workspace files | Both |
  | PostgreSQL | Persist app state | Both |
- Data exchanged:
  - AXION scripts: stage name, module slug, mode → JSON result, logs, exit code
  - Filesystem: file paths → file contents (read/write)

<!-- AXION:SECTION:INTEG_AUTH -->
## Credentials & Auth
- Credential storage strategy: N/A — no external service credentials for v1
- Rotation expectations: N/A

<!-- AXION:SECTION:INTEG_WEBHOOKS -->
## Webhooks / Callbacks
- Incoming webhooks: N/A — no external webhooks for v1
- Signature verification: N/A
- Retry/dedup strategy: N/A

<!-- AXION:SECTION:INTEG_FAILURES -->
## Failure Handling
- Timeouts: 120s timeout for AXION script execution; script killed if exceeded
- Retries: No automatic retry; user manually re-runs failed stage
- Partial failure strategies: If script fails mid-execution, stderr captured and run marked failed

<!-- AXION:SECTION:INTEG_COMPLIANCE -->
## Compliance & Data Handling
- PII shared: None — no PII in AXION workspaces
- Data retention: Runs retained indefinitely; files managed by user

<!-- AXION:SECTION:INTEG_TESTING -->
## Integration Testing
- Sandbox strategies: Use fixture workspaces with known AXION state
- Contract tests: Verify script output matches expected JSON schema

<!-- AXION:SECTION:INTEG_ACCEPTANCE -->
## Acceptance Criteria
- [x] Catalog enumerated
- [x] Credential and webhook policies defined
- [x] Failure modes addressed

<!-- AXION:SECTION:INTEG_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always spawn AXION scripts with working directory set to workspace_path.
2. Capture both stdout and stderr; parse JSON from stdout.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
