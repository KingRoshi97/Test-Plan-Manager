# ARC-04 — Authentication Architecture

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-04                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring authentication architecture    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Authentication Architecture Document                         |

## 2. Purpose

Define how authentication works across the system: identity sources, session/token strategy,
SSO boundaries (if any), and the trust model for establishing and maintaining authenticated
user context.

## 3. Inputs Required

- ● PRD-03: {{xref:PRD-03}} | OPTIONAL
- ● IAM-01: {{xref:IAM-01}} | OPTIONAL
- ● IAM-02: {{xref:IAM-02}} | OPTIONAL
- ● IAM-04: {{xref:IAM-04}} | OPTIONAL
- ● PMAD-01: {{xref:PMAD-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Auth strategy (session... | spec         | Yes             |
| Token/session lifecycle:  | spec         | Yes             |
| ○ issuance rules          | spec         | Yes             |
| ○ rotation rules          | spec         | Yes             |
| ○ expiry rules            | spec         | Yes             |
| ○ revocation rules        | spec         | Yes             |
| ○ refresh strategy        | spec         | Yes             |
| Auth flows (high level):  | spec         | Yes             |
| ○ signup                  | spec         | Yes             |
| ○ login                   | spec         | Yes             |
| ○ recovery                | spec         | Yes             |
| ○ logout                  | spec         | Yes             |

## 5. Optional Fields

● MFA strategy | OPTIONAL
● Device/session limits | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Auth must separate identity (who you are) from authorization (what you can do).
- Any token storage method must respect privacy/security policy; no sensitive tokens in
- **unsafe storage.**
- Rotation/revocation must be deterministic; “manual revocation” without strategy is not
- **allowed.**
- If SSO exists, define attribute mapping and account linking behavior.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Strategy Overview (required)`
2. `## 2) Token/Session Lifecycle (required)`
3. `## artifa`
4. `## issued_wh`
5. `## stored_whe`
6. `## rotated_wh`
7. `## expires_in`
8. `## acces`
9. `## s_tok`
10. `## ccess.issue`

## 8. Cross-References

- Upstream: {{xref:IAM-02}} | OPTIONAL, {{xref:IAM-04}} | OPTIONAL, {{xref:PMAD-01}} |
- OPTIONAL
- Downstream: {{xref:API-02}} | OPTIONAL, {{xre

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
