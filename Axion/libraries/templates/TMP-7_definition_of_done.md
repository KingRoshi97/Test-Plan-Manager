---
library: templates
id: TMP-7a
schema_version: 1.0.0
status: draft
---

# TMP-7a — templates/ Definition of Done
templates/ is "done" when:

## Schemas + registries
- [ ] All template schemas validate (JSON Schema check)
- [ ] template_registry validates and references existing template paths
- [ ] template_category_order and completeness policy registries exist and are pinned

## Runtime behavior (contract-level)
- [ ] S5 produces TEMPLATE_SELECTION deterministically with reasons
- [ ] S7 renders outputs for selected templates
- [ ] Each output has a render_envelope with citations and trace refs
- [ ] Completeness metrics are computed deterministically and recorded

## Gates
- [ ] TMP-GATE-01..06 implemented and mapped to pipeline gates:
  - G4_TEMPLATE_SELECTION
  - G5_TEMPLATE_COMPLETENESS
- [ ] Failures include actionable evidence (missing inputs/placeholders/citations)
