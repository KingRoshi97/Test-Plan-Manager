---
library: policy
id: POL-3b
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# POL-3b — Determinism Rules (Precedence)

- Precedence evaluation uses a fixed layer order (unless policy_set specifies explicit_priority).
- "Most restrictive wins" uses closed strictness orderings defined in POL-3a.
- When non-comparable, deny_by_default controls deny vs require_approval.
- All policy decisions reference pinned policy_set_id and risk_class.
