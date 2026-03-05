# PMAD-04 — Permission Check Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PMAD-04                                             |
| Template Type     | Architecture / Authorization                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring permission check patterns    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Permission Check Patterns Document                         |

## 2. Purpose

Define the standard pattern for performing permission checks and generating consistent deny
outcomes: what inputs are required, how decisions are logged, which reason codes to emit, and
how to avoid inconsistent authz logic across services.

## 3. Inputs Required

- ● PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● ARC-06: {{xref:ARC-06}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Standard decision flow... | spec         | Yes             |
| Required inputs (subje... | spec         | Yes             |
| Decision outcomes (all... | spec         | Yes             |
| Deny response rules:      | spec         | Yes             |
| ○ status mapping          | spec         | Yes             |
| ○ reason_code mapping     | spec         | Yes             |
| ○ redaction rules         | spec         | Yes             |
| Logging/audit rules:      | spec         | Yes             |
| ○ what to log             | spec         | Yes             |
| ○ what not to log         | spec         | Yes             |
| ○ correlation ID inclu... | spec         | Yes             |
| Example patterns (mini... | spec         | Yes             |

## 5. Optional Fields

● Policy evaluation caching design | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Unknown evaluation results must default to deny (per PMAD-01 default-deny).
- Deny must always output a reason_code (policy-defined or fallback).
- Logging must be redacted; never log secrets or sensitive resource contents.
- If caching decisions, cache must be scoped by subject + resource + action + context.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Standard Decision Flow (required)`
2. `## 2) Required Inputs (required)`
3. `## 3) Outcomes (required)`
4. `## outco`
5. `## meaning`
6. `## response`
7. `## reason_code_rule`
8. `## allow`
9. `## deny`
10. `## unkno`

## 8. Cross-References

- Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:ERR-02}} | OPTIONAL, {{xref:ARC-06}}
- | OPTIONAL
- Downstream: {{xref:PMAD-03}} | OPTIONAL, {{xref:PMAD-06}} | OPTIONAL,
- **{{xref:TINF-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
