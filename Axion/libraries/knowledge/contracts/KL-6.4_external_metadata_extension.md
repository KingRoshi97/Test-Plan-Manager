---
  contract_id: KL-6.4a
  schema_version: 1.0.0
  applies_to: "KID metadata when derived from external content"
  enforcement_level: "soft_to_hard_by_policy"
  ---

  # KL-6.4a — External Metadata Extension

  If a KID is derived from an external source, add these optional metadata fields:

  - source_id: "SRC-..."
  - source_attribution: "Publisher / Author / Year"
  - derivation_mode: summary_only | short_excerpts_only | allowlisted_reuse | full_reuse_per_license

  These fields improve auditing but are optional if you keep attribution in Links.
  