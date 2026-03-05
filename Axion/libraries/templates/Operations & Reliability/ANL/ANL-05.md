# ANL-05 — Consent & Opt-Out Enforcement (ties to PRIV-04)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-05                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring consent & opt-out enforcement (ties to priv-04)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Consent & Opt-Out Enforcement (ties to PRIV-04) Document                         |

## 2. Purpose

Define the canonical enforcement of analytics consent and opt-out: where consent is captured,
how it is stored, how instrumentation checks consent before emitting, and how opt-out affects
identity and retention. This must align with PRIV-04 and must be enforceable (not just UI).

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Consent model: {{xref:PRIV-04}} | OPTIONAL
- Event taxonomy: {{xref:ANL-02}} | OPTIONAL
- Identity model: {{xref:ANL-04}} | OPTIONAL
- Guard rules (role/auth gating): {{xref:ROUTE-04}} | OPTIONAL
- Client data protection: {{xref:CSec-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Consent signals used (... | spec         | Yes             |
| Default state rule (op... | spec         | Yes             |
| Where consent stored (... | spec         | Yes             |
| Enforcement points (cl... | spec         | Yes             |
| Opt-out behavior (stop... | spec         | Yes             |
| Identity behavior on o... | spec         | Yes             |
| Scope of opt-out (anal... | spec         | Yes             |
| Audit requirements (co... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Testing/verification r... | spec         | Yes             |

## 5. Optional Fields

Per-jurisdiction overrides | OPTIONAL

Do-not-track handling | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- If an event requires consent, it must not be emitted without consent.
- **Opt-out must be honored promptly across clients and backend pipelines.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Consent Signals`
2. `## Defaults`
3. `## Storage`
4. `## Enforcement`
5. `## Opt-Out Behavior`
6. `## Identity on Opt-Out`
7. `## Scope`
8. `## Audit`
9. `## Telemetry`
10. `## Verification`

## 8. Cross-References

- **Upstream: {{xref:PRIV-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-09}}, {{xref:ANL-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define defaults, enforcement points, stop-emit rule, and verification rule.**
- **intermediate: Required. Define storage model, opt-out identity rule, and telemetry metrics.**
- **advanced: Required. Add jurisdiction/DNT handling and strict audit/event-block evidence.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, fields stored, sdk/backend rules,**
- delete/stop processing, opt-out rate metric, ci gate ref, jurisdiction/DNT notes, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If consents.list is UNKNOWN → block

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
