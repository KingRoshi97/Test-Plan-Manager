---
  contract_id: KL-7a
  schema_version: 1.0.0
  applies_to: "MVKL readiness review"
  enforcement_level: "soft"
  ---

  # KL-7a — MVKL Validation Checklist

  ## Spine
  - [ ] KL-1 through KL-6 artifacts exist
  - [ ] Registries validate (KL-2.x)
  - [ ] Selection input/output validate (KL-3.1, KL-3.2)
  - [ ] Usage rules + citations enforced (KL-4.x)
  - [ ] Gates exist and are runnable (KL-5.x)

  ## Content minimum
  - [ ] At least 1 IT_END_TO_END domain has ~8 KIDs
  - [ ] KNOWLEDGE_INDEX references all KIDs with correct paths
  - [ ] TAXONOMY contains the domain/tags used
  - [ ] At least 2 bundles exist and validate

  ## Safety
  - [ ] External executor selection and export rules are enforced
  - [ ] Reuse gates block verbatim beyond limits
  