# SKM-09 — Logging & Redaction Rules (no secrets in logs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-09                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring logging & redaction rules (no secrets in logs)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Logging & Redaction Rules (no secrets in logs) Document                         |

## 2. Purpose

Define the canonical logging and redaction rules to prevent secrets/key material from being
emitted into logs, traces, crash reports, or analytics. This template must align with SDLC secret
scanning, application logging policy, and audit schema constraints.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secure SDLC policy: {{xref:SEC-07}} | OPTIONAL
- Client/server logging policy: {{xref:CER-05}} | OPTIONAL
- Secrets storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| No-secrets-in-logs rul... | spec         | Yes             |
| Sensitive fields allow... | spec         | Yes             |
| Sensitive fields denyl... | spec         | Yes             |
| Redaction strategy (ma... | spec         | Yes             |
| Logging wrappers/middl... | spec         | Yes             |
| Trace/span redaction rule | spec         | Yes             |
| Crash report redaction... | spec         | Yes             |
| Verification rule (tes... | spec         | Yes             |
| Incident procedure if ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

PII redaction coupling (PRIV-02) | OPTIONAL

Sampling rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Auth headers, cookies, tokens must never be logged.**
- **Redaction must occur before logs leave the process (not only in SIEM).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Core Rule`
2. `## Allowlist / Denylist`
3. `## Redaction Strategy`
4. `## Implementation`
5. `## Verification`
6. `## Leakage Procedure`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-06}}, {{xref:COMP-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
