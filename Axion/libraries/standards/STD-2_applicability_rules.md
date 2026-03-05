---
library: standards
id: STD-2a
schema_version: 1.0.0
status: draft
---

# STD-2a — Applicability Rules

A standards pack applies if ALL are true:
1) run.profile_id is in pack.scope.profiles
2) run.risk_class is in pack.scope.risk_classes
3) If pack.scope.stacks is non-empty:
  - at least one stack matches run.stack_family signals (from normalized_input/canonical meta)
4) If pack.scope.domains is non-empty:
  - at least one domain matches canonical spec domains/capabilities

If a pack omits stacks/domains:
- it is considered "general" within its profiles + risk classes.
