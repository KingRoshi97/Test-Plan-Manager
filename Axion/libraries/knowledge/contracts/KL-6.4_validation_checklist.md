---
  contract_id: KL-6.4b
  schema_version: 1.0.0
  applies_to: "External ingestion compliance validation"
  enforcement_level: "hard"
  ---

  # KL-6.4b — External Ingestion Validation Checklist

  - [ ] If KID derived from external source:
    - [ ] source_id exists in SOURCES_INDEX (strict mode)
    - [ ] license + allowed_reuse_level present
    - [ ] attribution included when required
  - [ ] No verbatim copyrighted dumps outside allowed reuse constraints
  - [ ] Any verbatim excerpt intended for outputs is:
    - [ ] allowlisted (use_policy == reusable_with_allowlist)
    - [ ] within KID.allowed_excerpt
    - [ ] within source reuse_constraints
  