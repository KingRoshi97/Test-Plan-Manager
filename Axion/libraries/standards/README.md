# Standards Library

## Purpose

The Standards Library defines Axion's **standards pack system**: the rules-of-build that shape canonical construction, template selection, planning, and verification. Standards packs are collections of fixed and configurable rules that are resolved deterministically into a snapshot, which then governs all downstream pipeline stages.

## Structure

| Directory | Purpose |
|-----------|---------|
| `SYSTEM/doctrine/` | Governance docs: STD-0 (purpose/boundaries) through STD-6 (definition of done), determinism rules, validation checklists |
| `SYSTEM/contracts/` | Numbered validation/rule files, JSON schemas (standards_pack, standards_unit, standards_snapshot, standards_index), resolver rules |
| `SYSTEM/policies/` | Usage policies: use policy, versioning policy, resolution policy |
| `SYSTEM/taxonomy/` | Controlled vocabularies: categories, status, domains, pack types, risk classes, rule types |
| `SYSTEM/registries/` | Standards registry, standards index, changelog, deprecations, aliases, relationships |
| `SYSTEM/templates/` | Authoring templates for creating new standard units and packs |
| `CONTENT/ITEMS/` | Individual standard unit markdown files with YAML frontmatter (derived from packs) |
| `CONTENT/META/` | Collections (by pack), aliases, and redirects for logical grouping |
| `VIEWS/` | Queryable indices: by_pack, by_domain, by_status, by_risk_class |
| `BUNDLES/` | Curated standard sets by run profile, risk class, and executor type |
| `OUTPUTS/` | Export and selection schemas for standards resolution artifacts |
| `packs/` | Standards pack JSON files (preserved — serves distinct aggregation purpose) |

## Packs

- **CORE@1.0.0** — Mandatory engineering rules (deterministic stage order, schema validation, pinning)
- **SEC_BASE@1.0.0** — Security baseline standards
- **QA_BASE@1.0.0** — Quality assurance baseline
- **DESIGN_BASE@1.0.0** — Design standards
- **OPS_CONDITIONAL@1.0.0** — Operations standards (conditional)
- **ANALYTICS_CONDITIONAL@1.0.0** — Analytics standards (conditional)
- **CONTRACTS_CONDITIONAL@1.0.0** — Contract standards (conditional)
- Additional baseline packs: eng_core, qa_baseline, sec_baseline

## Standard Unit Contract

Every standard unit file must contain:
- YAML frontmatter with: unit_id, title, version, status, applicability, created_at, updated_at, owner
- Optional frontmatter fields: category, source_pack, rule_id, rule_type, fixed, dependency_edges, tags, supersedes, deprecated_by
- Required sections: Summary, Rule
- Recommended sections: Rationale, Applicability, Verification, Examples (include where applicable)
- Schema: SYSTEM/contracts/standards_unit.v1.schema.json

## Usage Rules

- CORE pack standards are mandatory for all runs
- Conditional packs apply when applicability conditions match the run context
- Standards are resolved deterministically using resolver order rules (STD-3)
- Resolved snapshots are pinned and recorded in the run manifest

## Governance

- Status workflow: draft → active → deprecated → archived
- Pack versions use semantic versioning
- Supersession chains track pack evolution
- All changes tracked in SYSTEM/registries/changelog.md
- Deprecation requires replacement mapping in deprecations registry
