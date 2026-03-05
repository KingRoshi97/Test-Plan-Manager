# RLIM-02 — Rate Limit Catalog (limits by surface/endpoint)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-02                                             |
| Template Type     | Build / Rate Limiting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring rate limit catalog (limits by surface/endpoint)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Rate Limit Catalog (limits by surface/endpoint) Document                         |

## 2. Purpose

Create the canonical catalog of concrete rate limits applied across surfaces and endpoints,
including scope keys, units, burst settings, and enforcement actions. This document must be
consistent with the global rate limit policy and the endpoint catalog and must not invent endpoint
IDs or limit classes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Catalog index (list of limit entries)
limit_id (stable identifier)
surface (api/ws/webhook/jobs/admin)
target binding (endpoint_id / route pattern / consumer_id / producer_id)
scope (per_ip/per_user/per_org/per_project/per_token/etc.)
unit (req/min, req/sec, bytes/min, concurrent, etc.)
limit value (number)
burst configuration (capacity/refill) or pointer to RLIM-01 defaults
enforcement action (reject/throttle/slow/ban)
error mapping (status + error_code pointer to API-03)
exemptions reference (allowlist) | OPTIONAL
observability tags (labels to attach)

## 5. Optional Fields

Time-window overrides | OPTIONAL

Environment overrides (dev/stage/prod) | OPTIONAL
Per-tenant overrides | OPTIONAL
Feature flag gating | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent endpoint_id; bindings MUST reference API-01 (or be UNKNOWN flagged).
- **Limit behavior MUST be consistent with RLIM-01 (scopes, units, headers, enforcement).**
- **Error mapping MUST follow {{xref:API-03}} | OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Each limit_id MUST be unique.

## 7. Output Format

### Required Headings (in order)

1. `## Catalog Summary`
2. `## Limit Entries (by limit_id)`
3. `## Limit`
4. `## (endpoint_id/route_pattern/consumer_id/producer_id/UNKNOWN)`
5. `## open_questions:`
6. `## (Repeat the “Limit” entry block for each limit_id.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:RLIM-01}}, {{xref:API-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:RLIM-03}}, {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
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
