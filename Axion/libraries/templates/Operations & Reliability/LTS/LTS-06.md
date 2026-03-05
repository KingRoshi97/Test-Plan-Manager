# LTS-06 — Client Logging Standard (mobile/web constraints)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-06                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring client logging standard (mobile/web constraints)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Client Logging Standard (mobile/web constraints) Document                         |

## 2. Purpose

Define the canonical logging standard for client apps (web + mobile): what is allowed to be
logged on-device, what can be shipped to servers, redaction rules, offline buffering limits, and
crash logging behavior. This standard must align with client security and privacy constraints.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Client logging/crash reporting: {{xref:CER-05}} | OPTIONAL
- Client data protection: {{xref:CSec-02}} | OPTIONAL
- Global logging standard: {{xref:LTS-01}} | OPTIONAL
- Telemetry schema: {{xref:OBS-02}} | OPTIONAL
- App lifecycle/state: {{xref:MOB-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Allowed client log typ... | spec         | Yes             |
| On-device storage limi... | spec         | Yes             |
| Upload/shipping rules ... | spec         | Yes             |
| Redaction rules (same ... | spec         | Yes             |
| PII/sensitive UI conte... | spec         | Yes             |
| Network logging constr... | spec         | Yes             |
| Offline buffering rule... | spec         | Yes             |
| Crash reporting rule (... | spec         | Yes             |
| User controls (opt-out... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Debug mode rules (dev only) | OPTIONAL

Platform differences (iOS/Android/web) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Never log auth tokens/cookies or request bodies on clients.**
- **Client logs must be bounded and safe to ship (redacted).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Allowed Types`
2. `## On-Device Limits`
3. `## Shipping`
4. `## Redaction`
5. `## Sensitive UI Content`
6. `## Network Logging`
7. `## Offline Buffering`
8. `## Crash Reporting`
9. `## User Controls`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:CER-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LTS-09}}, {{xref:ALRT-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define allowed types, on-device limits, redaction, and network constraints.**
- **intermediate: Required. Define offline buffering, crash rules, user controls, telemetry metrics.**
- **advanced: Required. Add debug/platform differences and strict shipping/flush triggers with**
- safety checks.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, max age days, flush triggers, extra rules,**
- retry rule, stack policy, consent ref, optional metrics, debug/platform differences,
- open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If types.allowed is UNKNOWN → block

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
