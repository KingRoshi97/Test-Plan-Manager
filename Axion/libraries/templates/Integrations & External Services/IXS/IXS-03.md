# IXS-03 — Connectivity & Network Policy (timeouts, retries, allowlists)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-03                                             |
| Template Type     | Integration / External Systems                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring connectivity & network policy (timeouts, retries, allowlists)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Connectivity & Network Policy (timeouts, retries, allowlists) Document                         |

## 2. Purpose

Define the canonical connectivity and network policy for integrations: allowed destinations,
network timeouts, retry/backoff behavior, DNS/TLS requirements, and handling for degraded
connectivity. This template must be consistent with integration specs and must not invent
external destinations not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}} | OPTIONAL
- API-05 Rate Limit & Abuse Controls: {{api.rate_limits}} | OPTIONAL
- CER-02 Retry & Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Destination allowlist ... | spec         | Yes             |
| TLS requirements (min ... | spec         | Yes             |
| Timeout policy (connec... | spec         | Yes             |
| Retry policy (retryabl... | spec         | Yes             |
| Circuit breaker policy... | spec         | Yes             |
| Concurrency limits (pe... | spec         | Yes             |
| Outbound proxy/VPC egr... | spec         | Yes             |
| DNS policy (caching, f... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Regional routing policy | OPTIONAL

Pinned certs / mTLS notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **No outbound connectivity to non-allowlisted destinations.**
- **Retries MUST not amplify incidents; use backoff and circuit breaker rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Destination Allowlist`
2. `## TLS / Transport Security`
3. `## Timeouts`
4. `## Retries`
5. `## Circuit Breaker`
6. `## Concurrency Limits`
7. `## Inbound Connectivity (Webhooks)`
8. `## DNS`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}}, {{xref:IXS-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IXS-06}}, {{xref:IXS-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
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
