# RLIM-05 — Exemptions & Allowlist Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-05                                             |
| Template Type     | Build / Rate Limiting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring exemptions & allowlist policy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Exemptions & Allowlist Policy Document                         |

## 2. Purpose

Define the canonical policy for rate limit exemptions and allowlists: what can be exempted, who
can grant exemptions, how exemptions are scoped and time-bounded, how they are audited,
and how exemptions interact with abuse enforcement. This template must be consistent with the
global rate limit policy and must not invent exemption powers not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Grant policy (who can ... | spec         | Yes             |
| Duration policy (perma... | spec         | Yes             |
| Review/renewal policy ... | spec         | Yes             |
| Audit requirements (wh... | spec         | Yes             |
| Revocation policy (who... | spec         | Yes             |
| Interaction with abuse... | spec         | Yes             |

## 5. Optional Fields

Emergency/break-glass exemptions | OPTIONAL
Per-environment differences | OPTIONAL
Approval workflow (two-person) | OPTIONAL

Per-tenant exemption limits | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Exemptions MUST be explicit, scoped, and auditable.**
- **Exemptions SHOULD be time-bounded by default; permanent requires explicit policy.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Grant/revoke authority MUST align to {{xref:API-04}} (or be UNKNOWN flagged).**
- **Exemptions MUST NOT disable abuse enforcement unless explicitly allowed.**

## 7. Output Format

### Required Headings (in order)

1. `## Exemption Scope Types`
2. `## Allowlist Entry Schema`
3. `## Entry fields:`
4. `## Grant Policy`
5. `## Duration & Review Policy`
6. `## Revocation Policy`
7. `## Safety Constraints`
8. `## Interaction with Abuse Enforcement`
9. `## Observability Requirements`
10. `## metrics:`

## 8. Cross-References

- **Upstream: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:RLIM-02}}, {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL

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
