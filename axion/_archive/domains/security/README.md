<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:security -->
<!-- AXION:PREFIX:sec -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Security — Axion Assembler

**Module slug:** `security`  
**Prefix:** `sec`  
**Description:** Security policies, audits, and vulnerability management for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:SEC_SCOPE -->
## Scope & Ownership
- Owns: Security policies, input validation rules, path traversal prevention, secrets management
- Does NOT own: Authentication implementation (auth), API routes (backend)

<!-- AXION:SECTION:SEC_THREAT -->
## Threat Model
- Top threats by asset:
  | Asset | Threat | Mitigation |
  |-------|--------|------------|
  | Workspace files | Path traversal | Validate paths within workspace_path |
  | Database | SQL injection | Use Drizzle ORM (parameterized queries) |
  | API | Unauthorized access | Session validation (if auth enabled) |
  | Secrets | Exposure | Environment variables only; never log |
- Abuse cases:
  - Attacker attempts to read files outside workspace via path manipulation
  - Attacker attempts to inject commands via script arguments

<!-- AXION:SECTION:SEC_POLICIES -->
## Security Policies
- Data classification: No PII; workspace paths are internal only
- Encryption requirements:
  - At rest: Database encryption via PostgreSQL settings
  - In transit: HTTPS in production
- Secrets requirements:
  - All secrets via environment variables
  - Never commit secrets to repository
  - SESSION_SECRET must be strong (32+ characters)

<!-- AXION:SECTION:SEC_VULN -->
## Vulnerability Management
- Scanning tools: npm audit, dependabot alerts
- Patch SLAs:
  - Critical: 24 hours
  - High: 7 days
  - Medium/Low: Next release

<!-- AXION:SECTION:SEC_IR -->
## Incident Response
- Detection signals:
  - Repeated failed login attempts (if auth enabled)
  - 500 errors spike
  - Unusual file access patterns
- Response: Log and investigate; no automated response for v1

<!-- AXION:SECTION:SEC_SUPPLY -->
## Supply Chain
- Dependency controls:
  - Lock file committed (package-lock.json)
  - Review major version updates before merge
- Build provenance: N/A for v1

<!-- AXION:SECTION:SEC_ACCEPTANCE -->
## Acceptance Criteria
- [x] Threat model exists
- [x] Policies documented
- [x] Vuln + IR process defined

<!-- AXION:SECTION:SEC_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always validate file paths are within workspace_path before access.
2. Never log secrets or sensitive environment variables.
3. Use parameterized queries via Drizzle ORM.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
