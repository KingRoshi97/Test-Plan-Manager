---
library: knowledge
id: KNO-0
section: purpose
schema_version: 1.0.0
status: draft
---

# KNO-0 — knowledge/ Purpose + Boundaries

## Purpose
`knowledge/` defines the **knowledge governance contract**: the curated reference material, classification rules, authority tiers, freshness policies, retrieval logic, and evidence requirements that govern how knowledge items (KIDs) are authored, maintained, selected, and consumed across every Axion pipeline run.

This library is the source-of-truth for:
- what knowledge unit classes exist and how they are classified (authoritative, guidance, example, anti-pattern, reference)
- what authority tiers govern KID trust levels (golden, verified, reviewed, draft)
- how freshness and supersession chains are managed across KID versions
- how knowledge is selected for a run (profile-based filtering, risk-class filtering, applicability scoring)
- how KIDs link to other libraries (standards, templates, proofs, gates)
- what evidence and citation requirements apply to knowledge claims
- what the minimum viable knowledge set is for a valid Axion run

## What it governs (in scope)
- **Knowledge unit classification**: unit classes (authoritative rules, guidance, examples, anti-patterns, references), quality tiers, maturity levels. References KNO-1 data.
- **Authority tier model**: trust levels for KIDs (golden/verified/reviewed/draft), promotion rules, determinism rules. References KNO-2 data.
- **Freshness and supersession**: freshness windows, staleness detection, supersession chains, version lineage. References KNO-3 data.
- **Retrieval and resolution**: profile-based filtering, risk-class filtering, applicability rules, scoring, determinism rules. References KNO-4 data.
- **Dependency mapping**: cross-library linkage (KIDs to standards, templates, proofs), dependency edge types. References KNO-5 data.
- **Proof and trust**: evidence requirements, citation policy, trust model, validation. References KNO-6 data.
- **Knowledge content pillars**: IT_END_TO_END, INDUSTRY_PLAYBOOKS, LANGUAGES_AND_LIBRARIES content organization.
- **Knowledge bundles**: curated KID sets by run profile, risk class, and executor type.
- **Knowledge policies**: usage rules, external agent policy, citation policy, plagiarism/IP rules, secrets/PII handling.

## What it does NOT govern (out of scope)
- Gate evaluation logic and predicate DSL → `gates/`
- Risk classes and override policies → `policy/`
- Audit trail storage and compliance ledger → `audit/`
- Pipeline stage ordering and IO contracts → `orchestration/`
- Workspace/project/pin configuration → `system/`
- Intake form schemas and normalization → `intake/`
- Canonical spec schema and unknown handling → `canonical/`
- Standards packs and resolution logic → `standards/`
- Template registry and rendering rules → `templates/`
- Verification proof ledger and completion criteria → `verification/`
- Kit packaging rules → `kit/`
- Operational monitoring, SLOs, and performance budgets → `ops/`

## Consumers (what reads knowledge/)
- Template renderer (selects applicable KIDs during template creation and specification work)
- Gate evaluator (verifies that required knowledge was consulted and cited)
- Operator UI (displays knowledge library content, browsing, search, and selection reports)
- Audit ledger (references knowledge citations for compliance tracing)
- Standards resolver (maps standards to supporting knowledge items)
- Run planner (selects knowledge bundles based on run profile and risk class)

## Determinism requirements
- Knowledge selection for a given run profile, risk class, and applicability scope is deterministic given the same registry state.
- Authority tier comparisons are deterministic: golden > verified > reviewed > draft.
- Freshness evaluation is deterministic given the same staleness window and timestamp.
- Retrieval scoring is deterministic given the same query, applicability rules, and registry version.
- Supersession chain resolution is deterministic: always follow supersedes/superseded_by links to terminal node.

## Outputs (what knowledge/ produces)
- Knowledge unit registry (all governed KIDs with lifecycle and classification fields)
- Knowledge retrieval reports (what was queried, what matched, scoring, final selection, confidence)
- Knowledge citation records (which KIDs were consulted, by which agent, at which pipeline stage)
- Knowledge bundle manifests (curated KID sets for specific run profiles)
- Knowledge health metrics (freshness, authority distribution, coverage scores)

## Boundary checklist
- [ ] Every KID has a stable ID, owner, and maturity status
- [ ] Every KID is classified by unit_class and authority_tier
- [ ] Freshness windows are defined and staleness is detectable
- [ ] Retrieval rules produce deterministic selections
- [ ] Cross-library dependencies are declared and typed
- [ ] Evidence requirements are documented per authority tier
- [ ] Minimum viable knowledge set is defined
