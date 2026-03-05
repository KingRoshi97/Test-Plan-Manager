# SMD-05 — Offline State Handling (queueing, retry)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-05                                             |
| Template Type     | Build / State Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring offline state handling (queueing, retry)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Offline State Handling (queueing, retry) Document                         |

## 2. Purpose

Define the canonical offline handling model for the client: what works offline, how reads are
served from cache, how writes are queued, retry/backoff rules on reconnect, conflict handling,
and user-visible status. This template must be consistent with cache and mutation patterns and
must not invent offline capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-02 Query/Cache Strategy: {{smd.cache_strategy}}
- SMD-03 Mutation Patterns: {{smd.mutation_patterns}}
- CER-03 Offline/Error Mode UX: {{cer.offline_mode}} | OPTIONAL
- CER-02 Retry & Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Offline scope (what fu... | spec         | Yes             |
| Network state detectio... | spec         | Yes             |
| Read behavior when off... | spec         | Yes             |
| Write queue model (wha... | spec         | Yes             |
| Queue persistence mode... | spec         | Yes             |
| Retry policy on reconn... | spec         | Yes             |
| Conflict handling when... | spec         | Yes             |
| User-visible offline i... | spec         | Yes             |
| Data safety rules (do ... | spec         | Yes             |
| Observability hooks (q... | spec         | Yes             |

## 5. Optional Fields

Per-route offline exceptions | OPTIONAL

Background sync rules | OPTIONAL
Battery/network constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Queued writes MUST be idempotent or have dedupe rules.**
- **Offline UX MUST align with {{xref:CER-03}} when present.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Offline Scope`
2. `## Network Detection`
3. `## Reads When Offline`
4. `## Write Queue Model`
5. `## queue_item_schema:`
6. `## Queue Persistence`
7. `## Retry on Reconnect`
8. `## Conflict Handling`
9. `## User Experience`
10. `## Data Safety Rules`

## 8. Cross-References

- **Upstream: {{xref:SMD-02}}, {{xref:SMD-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OFS-01}} | OPTIONAL**
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
