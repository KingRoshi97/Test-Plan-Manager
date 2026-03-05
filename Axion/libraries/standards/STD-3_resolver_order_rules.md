---
library: standards
id: STD-3a
schema_version: 1.0.0
status: draft
---

# STD-3a — Resolver Order Rules

## Goal
Produce a single deterministic list of packs and rules.

## Pack selection
1) Filter packs by applicability (STD-2).
2) If multiple versions of same pack_id are applicable:
  - choose the highest version present in the pinned index (semantic compare)
  - if versions are not semver comparable, use lexicographic compare
3) Sort selected packs by precedence keys:
  1) specificity score (more scope constraints = higher):
     - +2 if scope.domains non-empty
     - +2 if scope.stacks non-empty
     - +1 if scope.profiles length is smaller (more specific)
     - +1 if scope.risk_classes length is smaller (more specific)
  2) maturity (golden > verified > reviewed > draft)
  3) pack_id (lexicographic)

Result: resolved_pack_list (ordered high → low precedence).

## Rule layering
Rules are applied in resolved_pack_list order.
When rules conflict:
- must_not beats must beats should
- if equal severity and conflicting statements exist:
  - record a conflict
  - default to most restrictive interpretation
  - if not comparable → require approval (policy) OR fail (risk-class dependent)
