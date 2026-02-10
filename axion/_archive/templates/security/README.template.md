<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:security -->
<!-- AXION:PREFIX:sec -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Security — AXION Module Template (Blank State)

**Module slug:** `security`  
**Prefix:** `sec`  
**Description:** Security policies, audits, and vulnerability management

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:SEC_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the security module.
"Owns" = security policies, threat modeling, vulnerability management, incident response process, supply chain security, encryption standards.
"Does NOT own" = authentication implementation (auth module), API authorization logic (backend module), infrastructure security controls (cloud module).
Common mistake: conflating security policy with auth implementation — security sets policy and audits compliance; auth module implements authentication/authorization. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:SEC_THREAT -->
## Threat Model
<!-- AGENT: Derive from RPBS §8 Security & Compliance and RPBS §3 Actors for attack surface analysis.
Top threats = STRIDE or similar analysis per critical asset (user data, payment info, auth tokens) — identify threat, likelihood, impact, mitigations.
Abuse cases = how malicious actors could misuse features (account enumeration, rate limit bypass, privilege escalation), derived from RPBS §3 actor list.
Common mistake: only modeling external threats — include insider threats and supply chain attacks. -->
- Top threats by asset: [TBD]
- Abuse cases: [TBD]


<!-- AXION:SECTION:SEC_POLICIES -->
## Security Policies
<!-- AGENT: Derive from RPBS §8 Security & Compliance and RPBS §29 Privacy Controls.
Data classification = sensitivity tiers (public, internal, confidential, restricted) with handling rules per tier.
Encryption = at-rest encryption (AES-256, KMS-managed keys), in-transit encryption (TLS 1.2+), field-level encryption for PII.
Secrets = storage (vault, env vars), rotation policy, access control, audit logging for secret access.
Common mistake: defining policies without enforcement mechanisms — every policy needs a corresponding technical control or audit check. -->
- Data classification: [TBD]
- Encryption requirements: [TBD]
- Secrets requirements: [TBD]


<!-- AXION:SECTION:SEC_VULN -->
## Vulnerability Management
<!-- AGENT: Derive from RPBS §8 for compliance requirements and quality module dependency policy.
Scanning tools = SAST, DAST, SCA tools used, scan frequency (per PR, nightly, pre-release), integration with CI pipeline.
Patch SLAs = maximum time to patch by severity (critical: 24h, high: 7d, medium: 30d, low: 90d), exception process.
Common mistake: scanning without SLAs — discovered vulnerabilities need time-bound remediation commitments. -->
- Scanning tools/process: [TBD]
- Patch SLAs: [TBD]


<!-- AXION:SECTION:SEC_IR -->
## Incident Response
<!-- AGENT: Derive from RPBS §8 Security & Compliance for incident response requirements.
Detection signals = what triggers a security incident investigation (anomalous login patterns, data exfiltration signals, WAF alerts, dependency compromise notifications).
Response runbooks = who owns each runbook (security team, devops, engineering), escalation path, communication plan (internal + external disclosure).
Common mistake: having runbooks without regular drills — incident response should be practiced periodically to verify effectiveness. -->
- Detection signals: [TBD]
- Response runbooks ownership: [TBD]


<!-- AXION:SECTION:SEC_SUPPLY -->
## Supply Chain
<!-- AGENT: Derive from quality module dependency policy and RPBS §8 for compliance requirements.
Dependency controls = lockfile enforcement, allowed registries, package signing verification, SBOM generation.
Build provenance = reproducible builds, build attestation, artifact signing, deployment artifact integrity verification.
Common mistake: only scanning direct dependencies — transitive dependency attacks are increasingly common and must be covered. -->
- Dependency controls: [TBD]
- Build provenance expectations: [TBD]


<!-- AXION:SECTION:SEC_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Threat model exists
- [ ] Policies documented
- [ ] Vuln + IR process defined


<!-- AXION:SECTION:SEC_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved security decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting RPBS §8 for compliance certification requirements").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
