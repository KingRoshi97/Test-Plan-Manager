# Secrets & PII Handling

  ## Purpose

  Defines redaction and retention guidance for knowledge items that may reference sensitive data patterns.

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

  ### Retention

  - KIDs with redaction_class `restricted` must be reviewed quarterly
  - Deprecated KIDs with sensitive content must be archived, not deleted
  - Reuse logs referencing restricted KIDs must be retained for audit

  ### Kit Export

  - Kit exports must strip any `restricted` content references
  - Knowledge selection for external execution must filter by redaction_class
  - Secrets-related KIDs should default to `executor_access: internal_only`

  ## Cross-References

  - FEAT-012: Secrets/PII Scanner & Quarantine
  - STD-PLAG-01: Plagiarism & IP-Safe Use Standard
  