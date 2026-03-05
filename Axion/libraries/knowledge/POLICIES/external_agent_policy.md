# External Agent Policy

## Purpose

Defines what external agents may access from the Knowledge Library. Aligned with KL-5.2 access gates and KL-5.2b kit content classification.

## Governing Contracts

| Contract | Title | Enforcement |
|----------|-------|-------------|
| KL-4.3 | Restricted Behaviors | hard |
| KL-5.2 | Access Gates | hard |
| KL-5.2b | Kit Content Classification | hard |

## Access Rules

### Allowed for External Agents

- KIDs with `executor_access: internal_and_external`
- KIDs with `use_policy: pattern_only` (study and derive only)
- Checklists and procedures (rules-based content)
- Glossary terms and canonical definitions
- Paraphrased content from accessible KIDs (KL-5.2b classification: paraphrase)

### Restricted from External Agents (KL-4.3 §2, KL-5.2 / KL-GATE-04)

- KIDs with `executor_access: internal_only`
- KIDs with `use_policy: restricted_internal_only`
- Internal architecture decisions and proprietary patterns
- Content marked with `redaction_class: restricted`

### Kit Content Classification (KL-5.2b)

When packaging a kit, classify any knowledge-derived content as:

| Classification | Description | External Kit Allowed |
|----------------|-------------|---------------------|
| citation_only | KID referenced, no excerpt included | Yes (if KID is accessible) |
| paraphrase | Rewritten content, no distinctive phrasing preserved | Yes (if underlying KID accessible to executor) |
| excerpt | Verbatim text/code/table content from a KID | Only if use_policy == reusable_with_allowlist AND within allowed_excerpt AND reuse_log exists |

### Kit Export Rules (KL-5.2 / KL-GATE-05)

- Kit exports for external execution must be filtered to exclude restricted KIDs
- Knowledge selection artifacts for external runs must apply executor_access filtering
- Bundle selection must use executor-appropriate bundles (EXTERNAL_AGENT bundle)
- External kits MUST NOT contain:
  - Full text of any internal_only KID
  - Any verbatim excerpts from internal_only KIDs
  - Any KID content with use_policy == restricted_internal_only
- Even for reusable_with_allowlist, only include excerpts within allowed_excerpt limits

### Kit Export Proof of Compliance (KL-5.2b)

Kit export MUST include an export_report listing:
- KIDs cited
- KIDs excerpted + excerpt sizes
- Blocked items (if any) + reason codes

## Enforcement

| Gate | Rule | Contract |
|------|------|----------|
| KL-GATE-04 | External executor cannot access restricted KIDs | KL-5.2 |
| KL-GATE-05 | Kit export for external use excludes restricted content | KL-5.2 |
