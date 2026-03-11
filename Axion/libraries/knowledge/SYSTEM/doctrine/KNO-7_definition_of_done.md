---
library: knowledge
id: KNO-7
section: definition_of_done
schema_version: 1.0.0
status: draft
---

# KNO-7 — Definition of Done

knowledge/ is "done" when:

## Documentation Complete
- [ ] KNO-0: Purpose and boundary checklist documented
- [ ] KNO-1: Unit classes, quality tiers, maturity levels, and validation checklist documented
- [ ] KNO-2: Authority tiers, promotion/demotion rules, trust ordering, and validation checklist documented
- [ ] KNO-3: Freshness windows, staleness detection, supersession chains, version lineage, and validation checklist documented
- [ ] KNO-4: Retrieval pipeline, scoring, filtering, resolution, determinism rules, and validation checklist documented
- [ ] KNO-5: Dependency edge types, cross-library linkage, referential integrity, and validation checklist documented
- [ ] KNO-6: Evidence requirements, citation policy, trust model, and validation checklist documented
- [ ] KNO-7: Definition of done, minimum viable knowledge set, and minimal tree documented

## Schemas Complete
- [ ] `KL-1.3_kid_metadata.schema.json` — KID metadata (frontmatter) schema
- [ ] `knowledge_unit.v1.schema.json` — governed knowledge unit schema
- [ ] `knowledge_retrieval_report.v1.schema.json` — retrieval decision report schema

## Registries Complete
- [ ] Knowledge index registry with all KIDs (`INDEX/knowledge.index.json`)
- [ ] Governed knowledge registry with lifecycle fields (`INDEX/knowledge_registry.v1.json`)
- [ ] Taxonomy registry (`INDEX/taxonomy.json`)
- [ ] Bundle index (`BUNDLES/`)

## Runtime Integration
- [ ] Loader module loads all knowledge library assets
- [ ] API endpoints serve knowledge library data
- [ ] UI page displays knowledge library content
- [ ] Assets registered in schema_registry and library_index

## Determinism Verified
- [ ] All determinism rules documented per section (KNO-1 through KNO-6)
- [ ] Retrieval produces identical results for identical inputs
- [ ] Authority tier comparisons follow the strict ordering
- [ ] Supersession chains resolve deterministically

## Minimum Viable Knowledge Set
The minimum viable knowledge set for a valid Axion run consists of:

1. **At least one KID per applicable domain** — the run's target domain(s) must have at least one non-deprecated, non-stale KID in the registry.
2. **Knowledge registry** — a valid `knowledge_registry.v1.json` with governance envelope fields.
3. **Retrieval report** — every run that selects knowledge must produce a retrieval decision report.
4. **Citation records** — every consulted authoritative KID must have a citation record.

## Minimal Tree

```
knowledge/
  KNO-0_purpose.md
  KNO-1_unit_classes.md
  KNO-2_authority_tiers.md
  KNO-3_freshness_supersession.md
  KNO-4_retrieval_resolution_rules.md
  KNO-5_dependency_mapping.md
  KNO-6_proof_and_trust.md
  KNO-7_definition_of_done.md
  contracts/
    KL-1.3_kid_metadata.schema.json
    knowledge_unit.v1.schema.json
    knowledge_retrieval_report.v1.schema.json
  INDEX/
    knowledge.index.json
    knowledge_registry.v1.json
    taxonomy.json
  BUNDLES/
    (at least one bundle manifest)
  PILLARS/
    IT_END_TO_END/
    INDUSTRY_PLAYBOOKS/
    LANGUAGES_AND_LIBRARIES/
  POLICIES/
    (usage, citation, external agent policies)
```
