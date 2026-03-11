# Secrets & PII Handling

## Purpose

Defines redaction and retention guidance for knowledge items that may reference sensitive data patterns. Aligned with KL-5.2 access gates and KL-5.2b kit content classification.

## Governing Contracts

| Contract | Title | Enforcement |
|----------|-------|-------------|
| KL-5.2 | Access Gates | hard |
| KL-5.2b | Kit Content Classification | hard |
| KL-4.3 | Restricted Behaviors | hard |

## Rules

### Content Authoring

- KIDs must NOT contain actual secrets, API keys, passwords, or credentials
- KIDs must NOT contain real PII (names, emails, SSNs, etc.)
- Example data in KIDs must use clearly synthetic/placeholder values
- Secrets patterns should describe the pattern, not include real values

### Redaction Classes

| Class | Description | Access |
|-------|-------------|--------|
| public | Safe for any audience | All agents |
| internal | Internal reference only | Internal agents only |
| restricted | Contains sensitive patterns or references | Internal agents with explicit access |

### Access Control (KL-5.2 / KL-GATE-04)

- KIDs with redaction_class `restricted` must have `executor_access: internal_only`
- External agents cannot access restricted KIDs (KL-GATE-04)
- Knowledge selection for external execution must filter by redaction_class and executor_access

### Retention

- KIDs with redaction_class `restricted` must be reviewed quarterly
- Deprecated KIDs with sensitive content must be archived, not deleted (KL-6.3)
- Reuse logs referencing restricted KIDs must be retained for audit (KL-4.4b)

### Kit Export (KL-5.2 / KL-GATE-05, KL-5.2b)

- Kit exports must strip any `restricted` content references
- Knowledge selection for external execution must filter by redaction_class
- Secrets-related KIDs should default to `executor_access: internal_only`
- Kit export report must list blocked items with reason codes (KL-5.2b)

## Cross-References

- KL-5.2: Access Gates (KL-GATE-04, KL-GATE-05)
- KL-5.2b: Kit Content Classification
- KL-4.3: Restricted Behaviors
- FEAT-012: Secrets/PII Scanner & Quarantine
- STD-PLAG-01: Plagiarism & IP-Safe Use Standard
