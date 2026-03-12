---
library: templates
id: TMP-3a
schema_version: 1.0.0
status: draft
---

# TMP-3a — Selection Rules (Minimum)

## Inputs
- profile_id (from normalized input / run manifest)
- risk_class (from policy)
- canonical domains/capabilities (from canonical_spec)
- standards snapshot required artifacts (optional influence)
- template registry entries

## Filter
A template is eligible if:
1) profile_id is in entry.profiles (or entry.profiles empty)
2) risk_class is in entry.risk_classes (or entry.risk_classes empty)
3) entry is not deprecated (unless repro mode)
4) required_inputs are satisfiable (CANONICAL_SPEC, STANDARDS_SNAPSHOT exist)

## Rank (stable scoring)
Score each eligible template:
- +3 if any entry.domains match canonical domains
- +2 if any entry.tags match canonical tags/capabilities
- +1 if category required by standards snapshot (optional rule)
Tie-breakers:
1) category order (fixed)
2) template_id lexicographic
3) version (highest)

## Cap selection
- default max_templates = 40 (configurable per profile/risk)
- if over cap, take highest scores deterministically and record cap.reason
