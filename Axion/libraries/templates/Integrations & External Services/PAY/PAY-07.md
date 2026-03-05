# PAY-07 — Ledger & Reconciliation Rules (source of truth, audits)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-07                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring ledger & reconciliation rules (source of truth, audits)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Ledger & Reconciliation Rules (source of truth, audits) Document                         |

## 2. Purpose

Define the canonical internal ledger model and reconciliation rules for payments: what the
source of truth is for financial state, how provider events map to ledger entries, how
reconciliation is performed, what counts as mismatch, and what audits/controls exist. This
template must be consistent with payment flows and webhook handling and must not invent
financial fields beyond upstream schemas.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- PAY-04 Webhook Handling: {{pay.webhooks}} | OPTIONAL
- DATA-06 Canonical Data Schemas (ledger): {{data.schemas}} | OPTIONAL
- DQV-03 Data Validation Rules: {{dqv.rules}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Ledger source of truth... | spec         | Yes             |
| Ledger entities/record... | spec         | Yes             |
| Event → ledger mapping... | spec         | Yes             |
| Idempotency rules for ... | spec         | Yes             |
| Reconciliation cadence... | spec         | Yes             |
| Reconciliation inputs ... | spec         | Yes             |
| Mismatch detection rul... | spec         | Yes             |
| Mismatch handling (hol... | spec         | Yes             |
| Audit controls (append... | spec         | Yes             |
| Retention policy for l... | spec         | Yes             |

## 5. Optional Fields

Multi-currency handling | OPTIONAL
Accounting export rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Ledger writes MUST be idempotent and append-only where possible.**
- **Reconciliation must be repeatable and produce artifacts (reports).**
- **Mismatches must not silently self-resolve; must be surfaced.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Source of Truth`
2. `## Ledger Model`
3. `## Event → Ledger Mapping`
4. `## Mapping`
5. `## (Repeat per mapping.)`
6. `## Idempotency`
7. `## Reconciliation Cadence`
8. `## Mismatch Detection`
9. `## Mismatch Handling`
10. `## Audit Controls`

## 8. Cross-References

- **Upstream: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-10}} | OPTIONAL**
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
