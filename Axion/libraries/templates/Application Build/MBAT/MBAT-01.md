# MBAT-01 — Background Work Rules (limits, schedules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-01                                             |
| Template Type     | Build / Mobile Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring background work rules (limits, schedules)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Background Work Rules (limits, schedules) Document                         |

## 2. Purpose

Define the canonical rules for mobile background work: what runs in background, OS
constraints, scheduling rules, network/battery constraints, and how background work interacts
with offline sync and push delivery. This template must be consistent with mobile lifecycle rules
and must not invent background capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MOB-04 App Lifecycle + State: {{mob.lifecycle}} | OPTIONAL
- OFS-02 Sync Model: {{ofs.sync_model}} | OPTIONAL
- MPUSH-04 Delivery/Retry Rules: {{mpush.delivery_retry}} | OPTIONAL
- MBAT-02 Network Usage Policy: {{mbat.network_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| OS constraints summary... | spec         | Yes             |
| Scheduling model (peri... | spec         | Yes             |
| Network constraints (w... | spec         | Yes             |
| Battery constraints (d... | spec         | Yes             |
| Max runtime limits (ti... | spec         | Yes             |
| Retry/backoff rules fo... | spec         | Yes             |
| User controls (allow b... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Per-task priority tiers | OPTIONAL

Foreground service rules (Android) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Background tasks MUST honor battery/network policies and OS limits.**
- **Background sync MUST align with offline sync model ({{xref:OFS-02}}).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Allowed Background Work`
2. `## OS Constraints`
3. `## Scheduling`
4. `## Network Constraints`
5. `## Battery Constraints`
6. `## Runtime Limits`
7. `## Retry / Backoff`
8. `## User Controls`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MOB-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MBAT-02}}, {{xref:MBAT-05}} | OPTIONAL**
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
