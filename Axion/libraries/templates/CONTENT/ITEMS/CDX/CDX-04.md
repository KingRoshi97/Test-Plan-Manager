# CDX-04 — Error/Warning/Success

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CDX-04                                             |
| Template Type     | Design / Content                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error/warning/success    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error/Warning/Success Document                         |

## 2. Purpose

Define the canonical catalog of user-facing messages for success, warning, and error states.
This ensures consistent wording, supports reason-code mapping, and prevents sensitive detail
leakage.

## 3. Inputs Required

- ● DES-07: {{xref:DES-07}} | OPTIONAL
- ● DES-06: {{xref:DES-06}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}}
- ● ARC-06: {{xref:ARC-06}} | OPTIONAL
- ● API-03: {{xref:API-03}} | OPTIONAL
- ● A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each message:         | spec         | Yes             |
| ○ msg_id                  | spec         | Yes             |
| ○ category (success/wa... | spec         | Yes             |
| ○ trigger condition (w... | spec         | Yes             |
| ○ surface (inline/toas... | spec         | Yes             |
| ○ title (optional)        | spec         | Yes             |
| ○ body text (required)    | spec         | Yes             |
| ○ user action guidance... | spec         | Yes             |
| ○ severity (P0/P1/P2)     | spec         | Yes             |
| ○ reason_code mapping ... | spec         | Yes             |
| ○ retry_allowed (true/... | spec         | Yes             |
| ○ accessibility notes ... | spec         | Yes             |

## 5. Optional Fields

● Variants by platform | OPTIONAL
● Debug correlation ID policy (display or not) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Must comply with CDX-01 voice/tone rules.
- Error messages must not leak internal system details; use redaction rules.
- If mapped to reason codes (ARC-06), the mapping must be explicit.
- Every P0 error must include user action guidance.
- If retry_allowed is true, the message must align to DES-07 retry rules.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Message Catalog (canonical)`
2. `## m cate`
3. `## s gory`
4. `## surf`
5. `## ace`
6. `## trig`
7. `## ger`
8. `## titl`
9. `## bod`
10. `## user seve`

## 8. Cross-References

- Upstream: {{xref:CDX-01}}, {{xref:DES-07}} | OPTIONAL, {{xref:ARC-06}} | OPTIONAL,
- **{{xref:API-03}} | OPTIONAL**
- Downstream: {{xref:DES-05}} | OPTIONAL, {{xref:FE-07}} | OPTIONAL, {{xref:MOB-*}} |
- **OPTIONAL, {{xref:QA-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
- {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
