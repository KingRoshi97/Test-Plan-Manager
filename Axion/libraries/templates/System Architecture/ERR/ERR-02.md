# ERR-02 — Reason Codes Registry (rc_*

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ERR-02                                             |
| Template Type     | Architecture / Error Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring reason codes registry (rc_*    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Reason Codes Registry (rc_* Document                         |

## 2. Purpose

Create the canonical registry of reason codes (rc_*) used across the system. This enables
deterministic error mapping, consistent UX messaging, and consistent observability. Reason
codes are stable identifiers and must never be reused.

## 3. Inputs Required

- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● ARC-06: {{xref:ARC-06}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● DMG-01: {{xref:DMG-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Naming convention rules for reason codes
● Registry entries (minimum 40 for non-trivial products; justify if smaller)
● For each reason code:
○ reason_code (rc_<domain>_<slug>)
○ error_class (from ERR-01)
○ meaning (one sentence)
○ user_action_guidance (what to do)
○ default_http_status (if applicable)
○ retryable_default (true/false)
○ data_sensitivity (does message involve PII?) (yes/no)
○ owner_boundary/service
○ related_policy_or_rule (BRP/PMAD/etc pointer)
○ used_by (API endpoints/jobs/webhooks) | OPTIONAL
○ deprecation_status (active/deprecated)
○ replacement_reason_code (if deprecated)

## 5. Optional Fields

● Localization key mapping | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- Reason codes are immutable IDs; deprecate instead of changing meaning.
- Every deny/validation/business-rule error must map to a reason code (or the fallback
- **policy).**
- A reason code must map to exactly one primary error_class.
- If retryable_default is true, ERR-05 must define the exact retry behavior.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Naming Rules (required)`
2. `## 2) Reason Codes Registry (canonical)`
3. `## erro`
4. `## r_cl`
5. `## ass`
6. `## mea`
7. `## ning`
8. `## user`
9. `## _gui`
10. `## danc`

## 8. Cross-References

- Upstream: {{xref:ERR-01}} | OPTIONAL, {{xref:ARC-06}} | OPTIONAL
- Downstream: {{xref:ERR-03}}, {{xref:ERR-04}}, {{xref:ERR-05}}, {{xref:CDX-04}} |
- OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
