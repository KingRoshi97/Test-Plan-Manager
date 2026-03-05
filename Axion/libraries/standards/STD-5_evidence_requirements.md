---
library: standards
id: STD-5c
schema_version: 1.0.0
status: draft
---

# STD-5c — Evidence Requirements (Standards Failures)

On failure, evidence must include:
- pointer to standards_index entry (pack_id/version/path)
- pointer to missing/invalid pack file (path)
- pointer to snapshot fields (resolved_packs/resolved_rules/conflicts)
- conflict details:
  - pack_ids + rule_ids
  - chosen resolution mode
  - policy decision ref if approval required
- remediation:
  - fix pack schema
  - fix applicability/scope
  - resolve conflict or approve override
  - rerun S3 and downstream stages
